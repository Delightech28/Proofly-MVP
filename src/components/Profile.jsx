import { Settings, House, Search, MessageSquare, User, Heart, MessageCircle, Camera, Star, 
  Activity, ListTodo, Award
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react'
import ProfileImage from "../assets/images/Delight.png";
import PostImage from "../assets/images/download (2).jpg";
import BottomNavigation from "./BottomNavigation";
import { useTheme } from "../contexts/ThemeContext";
import useFirebase from '../hooks/useFirebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
function Profile() {
  const { isLightMode } = useTheme();
  const navigate = useNavigate();
  const { user } = useFirebase();
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const loadCounts = async () => {
      if (!user?.uid) {
        setFollowersCount(0)
        setFollowingCount(0)
        return
      }
      try {
        const d = await getDoc(doc(db, 'users', user.uid))
        if (!mounted) return
        if (d.exists()) {
          const data = d.data()
          setFollowersCount(data.followersCount ?? 0)
          setFollowingCount(data.followingCount ?? 0)
        } else {
          setFollowersCount(0)
          setFollowingCount(0)
        }
      } catch (e) {
        console.error('Failed to load profile counts', e)
        if (mounted) {
          setFollowersCount(0)
          setFollowingCount(0)
        }
      }
    }
    loadCounts()
    return () => { mounted = false }
  }, [user?.uid])
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isLightMode ? 'bg-gray-50 text-gray-900' : 'bg-[#0e0e0e] text-white'} flex flex-col`}>
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-5">
        <h1 className="text-[20px] font-semibold">My Profile</h1>
        <div className="flex items-center gap-4">
           <div className={`px-2 py-1.5 border rounded-full flex gap-1 cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-500'}`}>
           <Star className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`} /> 
          <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>10.2k XP</p>
          </div>
          <div className={`p-2 border rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-500'}`}>
        <Link to="/settings">
        <Settings className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`} />
        </Link>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center mt-6">
        <div className="relative">
          <img src={ProfileImage} alt="avatar" className="w-20 h-20 rounded-full" />
          <div className="absolute bottom-0 right-0 bg-indigo-600 p-[3px] rounded-full">
            <Camera className="w-3 h-3 text-black" />
          </div>
        </div>

  <h2 className="text-lg font-semibold mt-2">{user?.displayName || 'Your name'}</h2>
  <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>{followersCount} followers - {followingCount} following</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mt-6">
        <button className="bg-indigo-600 text-white font-medium px-3 py-1.5 rounded-full text-sm flex gap-1 cursor-pointer">
          <Activity className="w-5 h-5 text-white" /> 
          Actions
        </button>
        <button 
          onClick={() => navigate('/tasks')}
          className={`px-4 py-1.5 rounded-full text-sm flex gap-1 cursor-pointer transition-colors duration-300 ${isLightMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-[#1c1c1c] text-gray-300 hover:bg-[#2a2a2a]'}`}
        >
          <ListTodo className="w-5 h-5 text-current" /> 
          Tasks
        </button>
        <button className={`px-4 py-1.5 rounded-full text-sm flex gap-1 cursor-pointer transition-colors duration-300 ${isLightMode ? 'bg-gray-200 text-gray-700' : 'bg-[#1c1c1c] text-gray-300'}`}>
          <Award className="w-5 h-5 text-current" /> 
          Badges
        </button>
      </div>

      {/* Posts Grid */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Post 1 */}
          <div className={`rounded-2xl p-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-md' : 'bg-[#1c1c1c]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <img src={ProfileImage} alt="post-author" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-semibold text-sm">{user?.displayName || 'Your name'}</h3>
                <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>3h ago</p>
              </div>
            </div>

            <p className="text-sm mb-3">Beautiful landscape</p>
            <img src={PostImage} alt="landscape" className="rounded-xl w-full" />

            {/* Post Action */}
            <div className={`flex items-center mt-3 text-sm gap-2 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <MessageCircle className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>12</span>
              </div>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <Heart className={`w-4 h-4 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>40</span>
              </div>
            </div>
          </div>

          {/* Post 2 */}
          <div className={`rounded-2xl p-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-md' : 'bg-[#1c1c1c]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <img src={ProfileImage} alt="post-author" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-semibold text-sm">{user?.displayName || 'Your name'}</h3>
                <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>5h ago</p>
              </div>
            </div>

            <p className="text-sm mb-3">Amazing sunset view</p>
            <img src={PostImage} alt="sunset" className="rounded-xl w-full" />

            {/* Post Action */}
            <div className={`flex items-center mt-3 text-sm gap-2 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <MessageCircle className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>8</span>
              </div>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <Heart className={`w-4 h-4 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>25</span>
              </div>
            </div>
          </div>

          {/* Post 3 */}
          <div className={`rounded-2xl p-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-md' : 'bg-[#1c1c1c]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <img src={ProfileImage} alt="post-author" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-semibold text-sm">{user?.displayName || 'Your name'}</h3>
                <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>1d ago</p>
              </div>
            </div>

            <p className="text-sm mb-3">City lights at night</p>
            <img src={PostImage} alt="city" className="rounded-xl w-full" />

            {/* Post Action */}
            <div className={`flex items-center mt-3 text-sm gap-2 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <MessageCircle className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>15</span>
              </div>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <Heart className={`w-4 h-4 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>67</span>
              </div>
            </div>
          </div>

          {/* Post 4 */}
          <div className={`rounded-2xl p-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-md' : 'bg-[#1c1c1c]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <img src={ProfileImage} alt="post-author" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-semibold text-sm">{user?.displayName || 'Your name'}</h3>
                <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>2d ago</p>
              </div>
            </div>

            <p className="text-sm mb-3">Mountain adventure</p>
            <img src={PostImage} alt="mountain" className="rounded-xl w-full" />

            {/* Post Action */}
            <div className={`flex items-center mt-3 text-sm gap-2 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <MessageCircle className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>22</span>
              </div>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <Heart className={`w-4 h-4 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>89</span>
              </div>
            </div>
          </div>

          {/* Post 5 */}
          <div className={`rounded-2xl p-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-md' : 'bg-[#1c1c1c]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <img src={ProfileImage} alt="post-author" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-semibold text-sm">{user?.displayName || 'Your name'}</h3>
                <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>3d ago</p>
              </div>
            </div>

            <p className="text-sm mb-3">Ocean waves</p>
            <img src={PostImage} alt="ocean" className="rounded-xl w-full" />

            {/* Post Action */}
            <div className={`flex items-center mt-3 text-sm gap-2 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <MessageCircle className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>6</span>
              </div>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <Heart className={`w-4 h-4 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>34</span>
              </div>
            </div>
          </div>

          {/* Post 6 */}
          <div className={`rounded-2xl p-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-md' : 'bg-[#1c1c1c]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <img src={ProfileImage} alt="post-author" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-semibold text-sm">{user?.displayName || 'Your name'}</h3>
                <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>4d ago</p>
              </div>
            </div>

            <p className="text-sm mb-3">Forest path</p>
            <img src={PostImage} alt="forest" className="rounded-xl w-full" />

            {/* Post Action */}
            <div className={`flex items-center mt-3 text-sm gap-2 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <MessageCircle className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>18</span>
              </div>
              <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'border-gray-300' : 'border-gray-300'}`}>
                <Heart className={`w-4 h-4 transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`} /> <span className={`transition-colors duration-300 ${isLightMode ? 'text-gray-700' : 'text-white'}`}>52</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default Profile;