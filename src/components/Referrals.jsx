import { ArrowLeft, Moon, Sun, Users, Share2, Copy, Mail, MessageSquare, Gift, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import BottomNavigation from "./BottomNavigation";
import useFirebase from '../hooks/useFirebase'
import { doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

function Referrals() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  // Use referral code/link from user's Firestore profile when available.
  // Fallbacks: empty string (frontend will show copy/share disabled behavior).
  const { user } = useFirebase()

  const dynamicReferralCode = user?.referralCode ?? ''
  const dynamicReferralLink = user?.referralLink ?? (dynamicReferralCode && typeof window !== 'undefined' ? `${window.location.origin}/auth?ref=${dynamicReferralCode}` : '')

  const [invitedFriends, setInvitedFriends] = useState([])

  // helper: format relative time (mins, hrs, days, weeks, months, years)
  function timeAgo(date) {
    if (!date) return ''
    const now = Date.now()
    const then = date instanceof Date ? date.getTime() : (date.seconds ? date.seconds * 1000 : new Date(date).getTime())
    const diff = Math.max(0, now - then)
    const mins = Math.floor(diff / (1000 * 60))
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `${weeks}w`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo`
    const years = Math.floor(days / 365)
    return `${years}y`
  }

  // subscribe to users referred by current user
  useEffect(() => {
    if (!user?.uid) {
      setInvitedFriends([])
      return
    }
    const q = query(collection(db, 'users'), where('referredBy', '==', user.uid), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => {
        const data = d.data()
        const createdAt = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : null)
        return {
          id: d.id,
          displayName: data.displayName || `${(data.firstName || '')} ${(data.lastName || '')}`.trim() || data.email?.split('@')[0] || 'User',
          username: data.username ? `@${data.username}` : '',
          joinedAgo: timeAgo(createdAt),
          pointsEarned: 10 // default per referral; adjust if you track per-invite points elsewhere
        }
      })
      setInvitedFriends(arr)
    }, (err) => {
      console.error('Failed to load invited friends', err)
      setInvitedFriends([])
    })
    return () => unsub()
  }, [user?.uid])

  const [referralsCount, setReferralsCount] = useState(null)
  const [referralsXp, setReferralsXp] = useState(null)

  useEffect(() => {
    let mounted = true
    const loadReferrals = async () => {
      if (!user?.uid) {
        setReferralsCount(0)
        setReferralsXp(0)
        return
      }

      try {
        const udoc = await getDoc(doc(db, 'users', user.uid))
        if (!mounted) return
  if (udoc.exists()) {
          const data = udoc.data()
          // Use existing values or default
          const count = (data.referralsCount !== undefined) ? data.referralsCount : 0
          // Do not assume referralsXp when missing; show 0 in the UI until explicitly awarded
          const xp = (data.referralsXp !== undefined) ? data.referralsXp : 0
          setReferralsCount(count)
          setReferralsXp(xp)

          // initialize missing fields in Firestore
          const updates = {}
          if (data.referralsCount === undefined) updates.referralsCount = 0
          if (Object.keys(updates).length) {
            try {
              await updateDoc(doc(db, 'users', user.uid), updates)
            } catch (e) {
              console.error('Failed to initialize referrals fields', e)
            }
          }
        } else {
          // no user doc; set defaults locally
          setReferralsCount(0)
          setReferralsXp(0)
        }
      } catch (e) {
        console.error('Failed to load referrals data', e)
        if (mounted) {
          setReferralsCount(0)
          setReferralsXp(0)
        }
      }
    }

    loadReferrals()

    return () => { mounted = false }
  }, [user?.uid])

  const copyReferralLink = () => {
    if (!dynamicReferralLink) return
    navigator.clipboard.writeText(dynamicReferralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralCode = () => {
    if (!dynamicReferralCode) return
    navigator.clipboard.writeText(dynamicReferralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isLightMode ? 'bg-gray-50 text-gray-900' : 'bg-[#0e0e0e] text-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-4 border-b transition-colors duration-300 ${isLightMode ? 'border-gray-200' : 'border-gray-800'}`}>
        <button 
          onClick={() => navigate(-1)} 
          className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold">Referrals</h2>
          <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Invite friends and earn rewards
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
        >
          {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="px-4 py-4">
        <div className={`rounded-xl p-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-md' : 'bg-black'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Referral Stats</h3>
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-lime-400">{referralsCount ?? 0}</div>
              <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Friends Invited
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{referralsXp ?? 0}</div>
              <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                XP Earned
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Friend Section */}
      <div className="px-4 mb-4">
        <div className={`rounded-xl p-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-md' : 'bg-black'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${isLightMode ? 'bg-green-100' : 'bg-green-900/30'}`}>
              <Gift className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Invite a friend</h3>
              <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Earn +20 XP for each friend who joins
              </p>
            </div>
          </div>

          {/* Referral Code */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              Your Referral Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dynamicReferralCode}
                readOnly
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors duration-300 ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-300 text-gray-900' 
                    : 'bg-[#2a2a2a] border-gray-600 text-white'
                }`}
              />
              <button
                onClick={copyReferralCode}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-300 cursor-pointer ${
                  copied 
                    ? 'bg-green-400 text-black' 
                    : 'bg-lime-400 text-black hover:bg-lime-500'
                }`}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              Your Referral Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dynamicReferralLink}
                readOnly
                className={`flex-1 px-3 py-2 rounded-lg border transition-colors duration-300 text-xs ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-300 text-gray-900' 
                    : 'bg-[#2a2a2a] border-gray-600 text-white'
                }`}
              />
              <button
                onClick={copyReferralLink}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-300 cursor-pointer ${
                  copied 
                    ? 'bg-green-400 text-black' 
                    : 'bg-lime-400 text-black hover:bg-lime-500'
                }`}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Share Button */}
          <div className="mt-4">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Join me on Proofly!',
                    text: `Join me on Proofly and start earning rewards! Use my referral code: ${dynamicReferralCode}`,
                    url: dynamicReferralLink
                  }).catch(err => console.log('Error sharing:', err));
                } else {
                  // Fallback: copy to clipboard
                  copyReferralLink();
                }
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-colors duration-300 cursor-pointer ${
                isLightMode 
                  ? 'bg-lime-400 text-black hover:bg-lime-500' 
                  : 'bg-lime-400 text-black hover:bg-lime-500'
              }`}
            >
              <Share2 className="w-4 h-4" />
              Share Invitation
            </button>
            <p className={`text-xs mt-2 text-center transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Share via any app or platform
            </p>
          </div>

          {copied && (
            <div className="mt-3 text-center">
              <span className="text-green-400 text-sm font-medium">✓ Copied to clipboard!</span>
            </div>
          )}
        </div>
      </div>

      {/* Invited Friends */}
      <div className="px-4 mb-24 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Invited Friends</h3>
          <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Invited: {referralsCount ?? 0}
          </div>
        </div>

        <div className="space-y-3">
          {invitedFriends.length === 0 ? (
            <div className={`text-center py-8 rounded-xl transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-black'}`}>
              <p className={`text-sm mb-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>No invites yet</p>
              <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Share your referral link to invite friends and earn XP.</p>
            </div>
          ) : (
            invitedFriends.map((friend) => (
              <div
                key={friend.id}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors duration-300 ${
                  isLightMode ? 'bg-white shadow-sm' : 'bg-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'
                  }`}>
                    <Users className="w-5 h-5 text-lime-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{friend.displayName}</h4>
                    <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {friend.username} • Joined {friend.joinedAgo}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <Award className="w-4 h-4" />
                    +{friend.pointsEarned}
                  </div>
                  <div className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    points earned
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default Referrals;
