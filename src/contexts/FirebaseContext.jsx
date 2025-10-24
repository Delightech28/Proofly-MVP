import React, { createContext, useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import sha256Hex from '../lib/sha256'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

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
      setUser(u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null)
      setLoading(false)
    })
    return () => unsub()
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
