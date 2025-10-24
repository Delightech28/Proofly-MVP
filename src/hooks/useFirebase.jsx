import { useContext } from 'react'
import FirebaseContext from '../contexts/FirebaseContext'

export function useFirebase() {
  const ctx = useContext(FirebaseContext)
  if (!ctx) throw new Error('useFirebase must be used within FirebaseProvider')
  return ctx
}

export default useFirebase
