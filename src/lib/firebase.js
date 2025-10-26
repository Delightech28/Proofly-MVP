import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Reads Vite env vars (make sure to add these to your .env or Vite environment)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Connect to Firebase Emulators in development
if (import.meta.env.DEV) {
  try {
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080)
    console.log('Connected to Firestore emulator')
  } catch (error) {
    // Emulator already connected, ignore error
    console.log('Firestore emulator already connected')
  }
  
  try {
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099')
    console.log('Connected to Auth emulator')
  } catch (error) {
    // Emulator already connected, ignore error
    console.log('Auth emulator already connected')
  }
}

export default app
