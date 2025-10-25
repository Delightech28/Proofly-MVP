import { Camera, ArrowLeft, Edit3, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Address, Identity } from '@coinbase/onchainkit/identity';
import ProfileImage from "../assets/images/Delight.png";
import useFirebase from '../hooks/useFirebase'
import { doc, getDoc, updateDoc, collection, getDocs, where, query as firestoreQuery } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { auth } from '../lib/firebase'
import { updateProfile } from 'firebase/auth'
import useToast from '../hooks/useToast'

function EditProfile() {
  const navigate = useNavigate();
  const { isLightMode } = useTheme();
  const [isEditing, setIsEditing] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    username: ""
  });
  // keep a copy of the initial values so we can detect if the user changed anything
  const [initialData, setInitialData] = useState(null)

  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [usernameMessage, setUsernameMessage] = useState('');

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const { user } = useFirebase()
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  // whether any editable field (fullName, phone, username) has changed
  const isDirty = useMemo(() => {
    if (!initialData) return false
    return (
      (formData.fullName || '') !== (initialData.fullName || '') ||
      (formData.phone || '') !== (initialData.phone || '') ||
      ((formData.username || '').replace(/^@/, '')) !== ((initialData.username || '').replace(/^@/, ''))
    )
  }, [formData, initialData])

  const handleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleSave = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    // Here you would typically save to backend
    console.log(`Saved ${field}:`, formData[field]);
  };

  const handleCancel = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    // Reset to original value if needed
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextUrl = URL.createObjectURL(file);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(nextUrl);
    // TODO: upload to backend here if needed
  };

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  // Load profile values from Firestore + auth
  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!user?.uid) return
      try {
        const d = await getDoc(doc(db, 'users', user.uid))
        if (!mounted) return
        const data = d.exists() ? d.data() : {}
        setFormData({
          fullName: data.displayName || user.displayName || '',
          phone: data.phone || '',
          username: data.username ? `@${data.username}` : (user.email ? `@${user.email.split('@')[0]}` : '')
        })
        // initialize initialData for dirty-checking
        setInitialData({
          fullName: data.displayName || user.displayName || '',
          phone: data.phone || '',
          username: data.username ? `@${data.username}` : (user.email ? `@${user.email.split('@')[0]}` : '')
        })
      } catch (e) {
        console.error('Failed to load edit-profile data', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [user?.uid, user?.displayName, user?.email])

  // Auto-save connected wallet address: detect current accounts and listen for changes
  useEffect(() => {
    if (!user?.uid) return
    let mounted = true

    const saveWalletAddress = async (addr) => {
      if (!addr) return
      try {
        // Only update if different from what's in the profile
        if (addr === user?.walletAddress) return
        const uref = doc(db, 'users', user.uid)
        await updateDoc(uref, { walletAddress: addr })
        if (!mounted) return
        showToast({ title: 'Wallet saved', description: 'Connected wallet address saved to your profile.', variant: 'success' })
      } catch (e) {
        console.error('Failed to save wallet address', e)
        // non-fatal; show a toast optionally
        if (mounted) showToast({ title: 'Wallet save failed', description: e?.message || 'Could not save wallet address.', variant: 'error' })
      }
    }

    const detectAndSave = async () => {
      try {
        const win = window
        if (win?.ethereum && typeof win.ethereum.request === 'function') {
          const accounts = await win.ethereum.request({ method: 'eth_accounts' })
          if (accounts && accounts.length) await saveWalletAddress(accounts[0])
        } else if (win?.web3 && win.web3?.eth && typeof win.web3.eth.getAccounts === 'function') {
          const accounts = await new Promise((res, rej) => win.web3.eth.getAccounts((err, acc) => err ? rej(err) : res(acc)))
          if (accounts && accounts.length) await saveWalletAddress(accounts[0])
        }
      } catch (e) {
        console.warn('Could not detect wallet on load', e)
      }
    }

    detectAndSave()

    const accountsChangedHandler = (accounts) => {
      // accounts may be an array or a single string depending on provider
      const addr = Array.isArray(accounts) ? accounts[0] : accounts
      if (addr) saveWalletAddress(addr)
    }

    try {
      const win = window
      if (win?.ethereum && typeof win.ethereum.on === 'function') {
        win.ethereum.on('accountsChanged', accountsChangedHandler)
      }
    } catch (e) {
      console.warn('Failed to attach accountsChanged listener', e)
    }

    return () => {
      mounted = false
      try {
        const win = window
        if (win?.ethereum && typeof win.ethereum.removeListener === 'function') {
          win.ethereum.removeListener('accountsChanged', accountsChangedHandler)
        }
      } catch {
        // ignore
      }
    }
  }, [user?.uid, user?.walletAddress, showToast])

  useEffect(() => {
    if (!isEditing.username) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    const candidateRaw = formData.username || '';
    const candidate = candidateRaw.replace(/^@/, '').trim().toLowerCase();

    setUsernameStatus('checking');
    setUsernameMessage('');

  const handle = setTimeout(() => {
      // simple validations
      if (candidate.length < 3) {
        setUsernameStatus('unavailable');
        setUsernameMessage('Must be at least 3 characters');
        return;
      }

      if (!/^[a-z0-9_]+$/.test(candidate)) {
        setUsernameStatus('unavailable');
        setUsernameMessage('Only lowercase letters, numbers, and underscores allowed');
        return;
      }

      // Check Firestore for existing username (exclude current user's doc)
      (async () => {
        try {
          const q = firestoreQuery(collection(db, 'users'), where('username', '==', candidate))
          const snap = await getDocs(q)
          // if no docs found, it's available
          if (snap.empty) {
            setUsernameStatus('available')
            setUsernameMessage('Available')
            return
          }

          // If only doc found belongs to current user, it's available
          if (snap.size === 1 && snap.docs[0].id === user?.uid) {
            setUsernameStatus('available')
            setUsernameMessage('Available')
            return
          }

          // Otherwise it's taken
          setUsernameStatus('unavailable')
          setUsernameMessage('Username is already taken')
        } catch (e) {
          console.error('Username availability check failed', e)
          // treat as unavailable on error to be safe
          setUsernameStatus('unavailable')
          setUsernameMessage('Could not verify username')
        }
      })()
    }, 500);

    return () => clearTimeout(handle);
  }, [formData.username, isEditing.username, user?.uid]);
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isLightMode ? 'bg-gray-50 text-gray-900' : 'bg-[#0e0e0e] text-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className={`p-2 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'bg-gray-200 text-gray-800' : 'bg-gray-900 text-white'}`}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center mb-8 px-5">
        <div className="relative">
          <img
            src={avatarPreviewUrl || ProfileImage}
            alt="avatar"
            className="w-32 h-32 rounded-full"
          />
          <div onClick={handleOpenFilePicker} className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer">
            <Camera className="w-4 h-4 text-black" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* User Information Container */}
      <div className="mx-5 mb-8">
        <div className={`rounded-xl p-4 space-y-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
          {/* Full name */}
          <div className="flex justify-between items-center py-2">
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Full name</span>
            <div className="flex items-center gap-2">
              {isEditing.fullName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`text-sm px-2 py-1 rounded border focus:outline-none transition-colors duration-300 ${isLightMode ? 'bg-white text-gray-900 border-gray-300 focus:border-indigo-600' : 'bg-[#2a2a2a] text-white border-gray-600 focus:border-indigo-600'}`}
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave('fullName')}
                    className="p-1 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel('fullName')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{formData.fullName}</span>
                  <button
                    onClick={() => handleEdit('fullName')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Phone number */}
          <div className="flex justify-between items-center py-2">
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Phone number</span>
            <div className="flex items-center gap-2">
              {isEditing.phone ? (
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`text-sm px-2 py-1 rounded border focus:outline-none transition-colors duration-300 ${isLightMode ? 'bg-white text-gray-900 border-gray-300 focus:border-indigo-600' : 'bg-[#2a2a2a] text-white border-gray-600 focus:border-indigo-600'}`}
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave('phone')}
                    className="p-1 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel('phone')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{formData.phone}</span>
                  <button
                    onClick={() => handleEdit('phone')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Email */}
          <div className="flex justify-between items-center py-2">
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Email</span>
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{user?.email || ''}</span>
          </div>
          
          {/* Username */}
          <div className="flex justify-between items-center py-2">
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Username</span>
            <div className="flex items-center gap-2">
              {isEditing.username ? (
                <div className="flex items-start gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 ${isLightMode ? 'text-gray-700 bg-gray-100 border border-gray-300' : 'text-gray-300 bg-[#2a2a2a] border border-gray-600'} rounded-l`}>@</span>
                      <input
                        type="text"
                        value={(formData.username || '').replace(/^@/, '')}
                        onChange={(e) => handleInputChange('username', '@' + e.target.value)}
                        className={`text-sm px-2 py-1 rounded-r border-l-0 focus:outline-none transition-colors duration-300 ${isLightMode ? 'bg-white text-gray-900 border-gray-300 focus:border-indigo-600' : 'bg-[#2a2a2a] text-white border-gray-600 focus:border-indigo-600'}`}
                        autoFocus
                      />
                    </div>
                    <span className={`mt-1 text-xs ${usernameStatus === 'checking' ? (isLightMode ? 'text-gray-500' : 'text-gray-400') : usernameStatus === 'available' ? 'text-indigo-600' : 'text-red-500'}`}>
                      {usernameStatus === 'idle' ? '' : usernameStatus === 'checking' ? 'Checking availability…' : usernameMessage}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSave('username')}
                    disabled={usernameStatus !== 'available'}
                    className={`p-1 rounded transition ${usernameStatus !== 'available' ? 'opacity-50 cursor-not-allowed text-indigo-600' : 'text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel('username')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{formData.username}</span>
                  <button
                    onClick={() => handleEdit('username')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Wallet Connection */}
          <div className={`flex justify-between items-center py-2 pt-4 ${isLightMode ? 'border-t border-gray-200' : 'border-t border-gray-700'}`}>
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Wallet Address</span>
            <Wallet>
              <ConnectWallet
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${isLightMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity hasCopyAddressOnClick>
                  <Address />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 space-y-4">
        {/* Save Changes Button */}
        {
          // compute save button disabled state to keep markup readable
        }
        <button
          disabled={(() => (saving || usernameStatus === 'unavailable' || usernameStatus === 'checking' || !isDirty))()}
          onClick={async () => {
            if (!user?.uid) return
            // Prevent saving if username is unavailable or still checking
            if (usernameStatus === 'unavailable') {
              setUsernameMessage('Please choose a different username')
              return
            }
            if (usernameStatus === 'checking') {
              setUsernameMessage('Still checking username availability, please wait')
              return
            }

            setSaving(true)
            try {
              const uref = doc(db, 'users', user.uid)

              // Normalize username: trim leading @, whitespace, and force lowercase
              const usernameRaw = (formData.username || '').replace(/^@/, '').trim()
              const normalizedUsername = usernameRaw.toLowerCase()

              // Attempt to detect a connected web3 wallet address (common providers expose window.ethereum)
              let walletAddress = null
              try {
                const win = window
                if (win?.ethereum && typeof win.ethereum.request === 'function') {
                  // eth_accounts does not prompt; returns connected addresses
                  const accounts = await win.ethereum.request({ method: 'eth_accounts' })
                  if (accounts && accounts.length) walletAddress = accounts[0]
                  else if (win.ethereum.selectedAddress) walletAddress = win.ethereum.selectedAddress
                } else if (win?.web3 && win.web3?.eth && typeof win.web3.eth.getAccounts === 'function') {
                  const accounts = await new Promise((res, rej) => win.web3.eth.getAccounts((err, acc) => err ? rej(err) : res(acc)))
                  if (accounts && accounts.length) walletAddress = accounts[0]
                }
              } catch (e) {
                // Non-fatal: simply don't include wallet address if detection fails
                console.warn('Could not read connected wallet address', e)
              }

              const updates = {
                phone: formData.phone || ''
              }
              // only set displayName/username if provided (allow empty phone)
              if (formData.fullName !== undefined) updates.displayName = formData.fullName || null
              if (usernameRaw !== undefined) updates.username = normalizedUsername || ''
              if (walletAddress) updates.walletAddress = walletAddress

              await updateDoc(uref, updates)
              // notify success
              showToast({ title: 'Profile updated', description: 'Your changes have been saved.', variant: 'success' })

              // Also update Firebase Auth displayName if present
              if (formData.fullName && auth.currentUser) {
                try {
                  await updateProfile(auth.currentUser, { displayName: formData.fullName })
                } catch (e) {
                  // Non-fatal: log and continue
                  console.error('Failed to update Auth displayName', e)
                }
              }
            } catch (e) {
              console.error('Failed to save profile', e)
              showToast({ title: 'Save failed', description: e?.message || 'Could not save profile. Try again.', variant: 'error' })
            } finally {
              setSaving(false)
            }
          }}
          className={`w-full ${saving || usernameStatus === 'unavailable' || usernameStatus === 'checking' || !isDirty ? 'cursor-not-allowed' : 'cursor-pointer'} ${saving || usernameStatus === 'unavailable' || usernameStatus === 'checking' || !isDirty ? (isLightMode ? 'bg-indigo-200 text-white' : 'bg-indigo-400 text-white') : 'bg-indigo-600 text-white hover:bg-indigo-700'} font-medium py-3 rounded-xl transition`}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

        {/* Delete Account Button */}
        <button className={`w-full py-3 font-medium rounded-xl transition cursor-pointer ${isLightMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default EditProfile