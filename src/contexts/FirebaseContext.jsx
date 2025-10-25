import React, { createContext, useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import sha256Hex from '../lib/sha256'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs, runTransaction, increment } from 'firebase/firestore'

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
function generateReferralCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

// Ensure referral code is unique (small number of retries)
async function generateUniqueReferralCode(db, length = 8, maxTries = 6) {
  for (let i = 0; i < maxTries; i++) {
    const candidate = generateReferralCode(length)
    const q = query(collection(db, 'users'), where('referralCode', '==', candidate))
    const snap = await getDocs(q)
    if (snap.empty) return candidate
  }
  // fallback to timestamp + random if collisions keep happening
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`
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
    let unsubProfile = null
    const unsub = onAuthStateChanged(auth, (u) => {
      setLoading(false)
      if (!u) {
        setUser(null)
        if (unsubProfile) {
          unsubProfile()
          unsubProfile = null
        }
        return
      }

      // Start with auth info
      setUser({ uid: u.uid, email: u.email, displayName: u.displayName })

      // Subscribe to Firestore profile doc for realtime updates so UI reflects changes immediately
      try {
        const userRef = doc(db, 'users', u.uid)
        unsubProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            // merge auth info with profile doc
            setUser({ uid: u.uid, email: u.email, displayName: (data.displayName || u.displayName), ...data })
          } else {
            // no profile doc yet; keep auth info
            setUser({ uid: u.uid, email: u.email, displayName: u.displayName })
          }
        }, (err) => {
          console.error('Failed to subscribe to user profile', err)
        })
      } catch (e) {
        console.error('Error setting up profile subscription', e)
      }
    })

    return () => {
      unsub()
      if (unsubProfile) unsubProfile()
    }
  }, [])

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

    // generate a unique referral code for the new user
    // NOTE: we intentionally do NOT persist an absolute referralLink (origin-dependent)
    // to avoid storing localhost origins from dev environments. Build links client-side.
    let referralCode = null
    try {
      referralCode = await generateUniqueReferralCode(db, 8)
    } catch (e) {
      console.warn('Failed to generate unique referral code; falling back to random', e)
      referralCode = generateReferralCode(8)
    }

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

    // If an incoming referral code was provided during signup, attempt to redeem it.
    // This is currently implemented client-side as a Firestore transaction as a stopgap.
    // Production: move this logic to a trusted Cloud Function to prevent abuse.
    if (profile?.referralCode) {
      try {
        const refQ = query(collection(db, 'users'), where('referralCode', '==', profile.referralCode))
        const refSnap = await getDocs(refQ)
        if (!refSnap.empty) {
          const refDoc = refSnap.docs[0]
          const refUid = refDoc.id
          // don't allow self-referral
          if (refUid !== u.uid) {
            const refUserRef = doc(db, 'users', refUid)
            const newUserRef = doc(db, 'users', u.uid)
            await runTransaction(db, async (tx) => {
              const r = await tx.get(refUserRef)
              const n = await tx.get(newUserRef)
              if (!r.exists()) throw new Error('Referrer user missing')
              if (!n.exists()) throw new Error('Referred user profile missing')
              // award XP: +20 to referrer, +10 to referred user; increment referralsCount
              tx.update(refUserRef, {
                referralsCount: increment(1),
                referralsXp: increment(20),
                xp: increment(20)
              })
              tx.update(newUserRef, {
                  referralsXp: increment(10),
                  xp: increment(10),
                  referredBy: refUid,
                  referredAt: serverTimestamp()
              })
              // create a small audit record for traceability
              const auditRef = doc(collection(db, 'referrals'))
              tx.set(auditRef, {
                referrerUid: refUid,
                referredUid: u.uid,
                code: profile.referralCode,
                createdAt: serverTimestamp()
              })
            })
          }
        }
      } catch (e) {
        console.error('Referral processing failed', e)
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
