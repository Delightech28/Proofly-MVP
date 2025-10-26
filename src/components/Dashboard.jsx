import { useState, useEffect } from "react";
import { 
  Bell, 
  Sun, 
  Moon, 
  TrendingUp, 
  Target, 
  Gift, 
  Users, 
  CheckCircle, 
  Clock, 
  Award,
  Activity,
  ChevronRight,
  Trophy,
  Star
} from "lucide-react";
import ProfileImage from "../assets/images/Delight.png";
import useFirebase from '../hooks/useFirebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import BottomNavigation from "./BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function Dashboard() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('steps');
  const [unreadNotifications] = useState(3); // Mock unread count
  const { user } = useFirebase()

  // Truncate long strings to maxLen characters and add ellipsis when truncated.
  const truncate = (str, maxLen = 15) => {
    if (!str && str !== '') return '';
    const s = String(str);
    return s.length > maxLen ? s.slice(0, maxLen) + '...' : s;
  };

  // Load Firestore profile (users/{uid}) to read username and other profile fields
  const [profile, setProfile] = useState(null)
  useEffect(() => {
    let mounted = true
    const loadProfile = async () => {
      if (!user?.uid) {
        setProfile(null)
        return
      }
      try {
        const d = await getDoc(doc(db, 'users', user.uid))
        if (!mounted) return
        if (d.exists()) {
          const data = d.data()
          setProfile(data)
          // Do not attempt to initialize protected referral fields from the client.
          // Firestore rules restrict client writes to these counters; show 0 in the UI
          // when the fields are missing and let server-side processes initialize them.
        } else setProfile(null)
      } catch (e) {
        console.error('Failed to load user profile', e)
        if (mounted) setProfile(null)
      }
    }
    loadProfile()
    return () => { mounted = false }
  }, [user?.uid])

  const handle = profile?.username
    ? `@${profile.username}`
    : user?.email
    ? `@${(user.email || '').split('@')[0]}`
    : '@username'

  const earningTabs = [
    { id: 'steps', icon: Activity, label: 'Steps', color: 'text-green-400' },
    { id: 'tasks', icon: CheckCircle, label: 'Tasks', color: 'text-blue-400' },
    { id: 'challenges', icon: Target, label: 'Challenges', color: 'text-purple-400' },
    { id: 'referrals', icon: Users, label: 'Referrals', color: 'text-orange-400' }
  ];

  const activityFeed = [
    { type: 'steps', message: 'You walked 8,200 steps today', points: '+4 points', time: '2 hours ago', icon: Activity },
    { type: 'task', message: 'Task completed: Followed brand on X', points: '+2 points', time: '4 hours ago', icon: CheckCircle },
    { type: 'badge', message: 'New badge unlocked: Consistency Hero', points: '🏅', time: '1 day ago', icon: Trophy },
    { type: 'challenge', message: 'Challenge completed: 3-day streak', points: '+15 points', time: '2 days ago', icon: Target },
    { type: 'referral', message: 'Friend joined: @johndoe', points: '+20 points', time: '3 days ago', icon: Users }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isLightMode ? 'bg-gray-50 text-gray-900' : 'bg-[#0e0e0e] text-white'}`}>
      {/* Top Bar / Header */}
      <div className={`px-4 py-4 border-b transition-colors duration-300 ${isLightMode ? 'border-gray-200' : 'border-gray-800'}`}>
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <img src={ProfileImage} alt="avatar" className="w-10 h-10 rounded-full" />
            <div>
              <h3 className="font-semibold text-sm">{truncate(user?.displayName || 'Your name', 15)}</h3>
              <p className="text-xs text-gray-400">{truncate(handle, 15)}</p>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2">
            {/* Points Balance */}
              <div className="flex items-center gap-2 bg-indigo-600 text-white px-2 py-1 rounded-full sm:px-3 sm:py-1.5">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-semibold">{(profile?.xp ?? 0) + ' XP'}</span>
            </div>
            {/* Notifications */}
            <button 
              onClick={() => navigate('/notifications')}
              className={`relative p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
            >
              {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Main Overview Card */}
      <div className="px-4 py-6">
        <div className={`rounded-2xl p-6 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-lg' : 'bg-[#1c1c1c]'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Activity Summary</h2>
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>

          <div className="space-y-4 mb-6">
            {/* Steps Progress */}
            <div className={`flex items-center justify-between p-4 rounded-xl transition-colors duration-300 ${isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
              <div className="flex-1">
                <div className="text-2xl font-bold text-indigo-600">6,240</div>
                <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>Steps Today</div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>6,240 / 10,000</div>
              </div>
              <div className="w-20">
                <div className={`w-full rounded-full h-3 transition-colors duration-300 ${isLightMode ? 'bg-gray-200' : 'bg-gray-700'}`}>
                  <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
            </div>

            {/* Tasks Completed */}
            <div className={`flex items-center justify-between p-4 rounded-xl transition-colors duration-300 ${isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
              <div className="flex-1">
                <div className="text-2xl font-bold text-blue-400">3</div>
                <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>Tasks Completed</div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>This week</div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${isLightMode ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
            </div>

            {/* Total Earned */}
            <div className={`flex items-center justify-between p-4 rounded-xl transition-colors duration-300 ${isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
              <div className="flex-1">
                <div className="text-2xl font-bold text-green-400">$4.25</div>
                <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>Total Earned</div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>This month</div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${isLightMode ? 'bg-green-100' : 'bg-green-900/30'}`}>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Earning Tabs */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Earning Methods</h3>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {earningTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors duration-300 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : isLightMode
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-[#2a2a2a] text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {earningTabs.map((tab) => (
            <div
              key={tab.id}
              className={`p-4 rounded-xl transition-colors duration-300 ${
                isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'
              } ${activeTab === tab.id ? 'ring-2 ring-indigo-600' : ''}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
                  <tab.icon className={`w-5 h-5 ${tab.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{tab.label}</h4>
                  <p className="text-xs text-gray-400">
                    {tab.id === 'steps' && 'Walk 10,000 steps = +5 XP'}
                    {tab.id === 'tasks' && 'Follow a brand on X'}
                    {tab.id === 'challenges' && '3-day streak of 10k steps'}
                    {tab.id === 'referrals' && 'Invite a friend = +20 XP'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {tab.id === 'steps' && 'Progress: 62%'}
                  {tab.id === 'tasks' && 'Completed: 3/5'}
                  {tab.id === 'challenges' && 'Active: 1'}
                  {tab.id === 'referrals' && `Invited: ${profile?.referralsCount ?? 0}`}
                </div>
                <button 
                  onClick={() => {
                    if (tab.id === 'tasks') navigate('/tasks');
                    if (tab.id === 'referrals') navigate('/referrals');
                  }}
                  className="bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                >
                  {tab.id === 'steps' ? 'Track Now' : 'Do Task'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="px-4 pb-24 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          {activityFeed.length > 4 && (
            <button 
              onClick={() => navigate('/recent-activity')}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition"
            >
              View All
            </button>
          )}
        </div>
        
        <div className={`rounded-xl overflow-hidden transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
          {activityFeed.slice(0, 4).map((activity, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 transition-colors duration-300 ${
                index !== 3 && (isLightMode ? 'border-b border-gray-100' : 'border-b border-gray-800')
              }`}
            >
              <div className={`p-2 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
                <activity.icon className="w-4 h-4 text-indigo-600" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
              
              <div className="text-right">
                <span className="text-sm font-semibold text-indigo-600">{activity.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default Dashboard;
