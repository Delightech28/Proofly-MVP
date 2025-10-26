import React, { createContext, useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import sha256Hex from '../lib/sha256'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs, runTransaction, increment, arrayUnion, addDoc, getDoc } from 'firebase/firestore'

// Helper: generate a simple username from name + random suffix
function generateUsername(firstName = '', lastName = '') {
  const base = `${(firstName || '').trim().split(' ')[0] || ''}${(lastName || '').trim().split(' ')[0] || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  const suffix = Math.floor(100 + Math.random() * 900) // 3 digits
  const username = (base || 'user') + suffix
  return username
}

// Helper: generate a 6-digit numeric verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Helper: generate a short referral code (alphanumeric)
// Removed unused client-side generator to avoid lint error; use generateReferralCodeFromUid instead.

// generateUniqueReferralCode was removed because it's not used in the client;
// derive referral codes from the newly created user's UID instead via
// generateReferralCodeFromUid to avoid client-side collection reads.

// Fallback deterministic-ish referral code generator that derives from the
// newly created user's UID to avoid needing to read the users collection
// from the client (which is restricted by security rules). This reduces the
// chance of collision and avoids permission errors when generating codes.
function generateReferralCodeFromUid(uid = '', length = 8) {
  const base = (uid || Date.now().toString(36)).toLowerCase().replace(/[^a-z0-9]/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000).toString(36)
  const combined = (base + rand)
  return combined.slice(0, length)
}



// Helper: send email via EmailJS REST API (no SDK). Requires Vite env vars set:
// VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
async function sendEmailJS(serviceId, templateId, publicKey, templateParams) {
  const url = 'https://api.emailjs.com/api/v1.0/email/send'
  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error('EmailJS send failed: ' + txt)
  }
  return true
}

const FirebaseContext = createContext(null)

export function FirebaseProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setLoading(false)
      if (!u) {
        setUser(null)
        return
      }

      // Start with auth info
      setUser({ uid: u.uid, email: u.email, displayName: u.displayName })

      // Load user profile once instead of real-time listener to avoid permission issues
      const loadUserProfile = async () => {
        try {
          const userRef = doc(db, 'users', u.uid)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            const data = userSnap.data()
            // merge auth info with profile doc
            setUser({ uid: u.uid, email: u.email, displayName: (data.displayName || u.displayName), ...data })
          } else {
            // no profile doc yet; keep auth info
            setUser({ uid: u.uid, email: u.email, displayName: u.displayName })
          }
        } catch (e) {
          console.error('Error loading user profile', e)
          // fallback to auth info only
          setUser({ uid: u.uid, email: u.email, displayName: u.displayName })
        }
      }
      
      loadUserProfile()
    })

    return () => {
      unsub()
    }
  }, [])

  // Helper to create a referral request for processing by Cloud Function.
  // Returns true if request created, false if skipped or failed.
  const _processReferralCode = async (code, newUid) => {
    if (!code) return false
    try {
      // Create a referral request document that will be processed by Cloud Function
      const referralRequestRef = doc(collection(db, 'referralRequests'))
      await setDoc(referralRequestRef, {
        newUid,
        code,
        createdAt: serverTimestamp()
      })
      
      console.info('Referral request created for Cloud Function processing. Code:', code)
      return true
    } catch (e) {
      console.error('Failed to create referral request', e)
      return false
    }
  }

  // signUp: creates an Auth user *and* writes a profile document to Firestore.
  // Also generates a username and verification code, stores a hashed code and expiry,
  // and attempts to send the code via EmailJS (client-side REST API).
  const signUp = async (email, password, profile = {}) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const u = cred.user

    // set displayName on the Firebase user profile if provided
    if (profile?.displayName) {
      try {
        await updateProfile(u, { displayName: profile.displayName })
      } catch (e) {
        // non-fatal
        console.warn('Failed to update displayName', e)
      }
    }

    // choose a username
    const username = generateUsername(profile.firstName, profile.lastName)

    // generate a referral code for the new user. We avoid querying the
    // `users` collection from the client (permission-restricted) by deriving
    // a short code from the newly created user's UID. This is fast and
    // avoids client-side permission errors; collisions are unlikely.
    let referralCode = generateReferralCodeFromUid(u.uid, 8)

    // generate verification code and hash
    const plainCode = generateVerificationCode()
    const codeHash = await sha256Hex(plainCode)
    const expiresAt = Date.now() + 1000 * 60 * 15 // 15 minutes

    // write a profile document in Firestore under 'users/{uid}'
    try {
      await setDoc(doc(db, 'users', u.uid), {
        uid: u.uid,
        email: u.email,
        username,
        referralCode: referralCode || null,
        displayName: profile.displayName || null,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        is_verified: false,
        verification_code_hash: codeHash,
        verification_expires: expiresAt,
        // Referral tracking fields
        referralsCount: 0,
        referredUids: [],
        createdAt: serverTimestamp()
      })
    } catch (e) {
      console.error('Failed to write Firestore user profile', e)
      // surface failure to caller so UI can show a toast/error
      throw new Error('Failed to create user profile in database: ' + (e?.message || String(e)))
    }

    // Try sending the verification code via EmailJS (client-side REST)
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      if (serviceId && templateId && publicKey) {
        // template params should match your EmailJS template variables
        await sendEmailJS(serviceId, templateId, publicKey, {
          to_name: profile.displayName || profile.firstName || '',
          to_email: email,
          code: plainCode,
          username
        })
      } else {
        console.warn('EmailJS env vars are not set; skipping sending verification email')
      }
    } catch (e) {
      // do not fail the signup if email sending fails, but log it so you can debug
      console.error('Failed to send verification email', e)
    }

    // If an incoming referral code was provided during signup, process it directly
    // This will update the referrer's referrals array and count
    if (profile?.referralCode) {
      try {
        await _processReferralCode(profile.referralCode, u.uid)
      } catch (e2) {
        console.error('Failed to process referral', e2)
        // Don't fail the signup if referral processing fails
      }
    }

    return cred
  }
  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signOut = () => fbSignOut(auth)

  return (
    <FirebaseContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </FirebaseContext.Provider>
  )
}

export default FirebaseContext
