import { Settings, House, Search, MessageSquare, User, Heart, MessageCircle, Camera, Star, 
  Activity, ListTodo, Award
 } from "lucide-react";
 import { Link } from "react-router-dom";
import ProfileImage from "../assets/images/Delight.png";
import PostImage from "../assets/images/download (2).jpg";
function Profile() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-5">
        <h1 className="text-[20px] font-semibold">My Profile</h1>
        <div className="flex items-center gap-4">
           <div className="px-2 py-1.5 border border-gray-500 rounded-full flex gap-1 cursor-pointer">
           <Star className="w-5 h-5 text-gray-400" /> 
          <p className="text-gray-400 text-sm">10.2k XP</p>
          </div>
          <div className="p-2 border border-gray-500 rounded-full cursor-pointer">
        <Link to="/settings">
        <Settings className="w-5 h-5 text-gray-300" />
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

        <h2 className="text-lg font-semibold mt-2">Okechukwu Delight</h2>
        <p className="text-gray-400 text-sm">10.2k followers - 142 following</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mt-6">
        <button className="bg-indigo-600 text-black font-medium px-3 py-1.5 rounded-full text-sm flex gap-1 cursor-pointer">
          <Activity className="w-5 h-5 text-white-400" /> 
          Actions
        </button>
        <button className="bg-[#1c1c1c] px-4 py-1.5 rounded-full text-sm text-gray-300 flex gap-1 cursor-pointer">
          <ListTodo className="w-5 h-5 text-white-400" /> 
          Tasks
        </button>
        <button className="bg-[#1c1c1c] px-4 py-1.5 rounded-full text-sm text-gray-300 flex gap-1 cursor-pointer">
          <Award className="w-5 h-5 text-white-400" /> 
          Badges
        </button>
      </div>

      {/* Post */}
      <div className="bg-[#1c1c1c] mx-4 mt-6 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <img src={ProfileImage} alt="post-author" className="w-10 h-10 rounded-full" />
          <div>
            <h3 className="font-semibold text-sm">Okechukwu Delight</h3>
            <p className="text-xs text-gray-400">3h ago</p>
          </div>
        </div>

        <p className="text-sm mb-3">Beautiful landscape</p>
        <img src={PostImage} alt="landscape" className="rounded-xl w-full" />

        {/* Post Action */}
        <div className="flex items-center mt-3 text-gray-400 text-sm gap-2">
          <div className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-full cursor-pointer">
            <MessageCircle className="w-5 h-5 text-white" /> <span className="text-white">12</span>
          </div>
          <div className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-full cursor-pointer">
            <Heart className="w-4 h-4 text-white" /> <span className="text-white">40</span>
          </div>
        </div>
      </div>

      {/* Spacer to ensure content doesn't hide behind bottom nav */}
      <div className="h-24" />

      {/* Bottom Nav */}
      <div className="fixed bottom-0 w-full bg-[#1a1a1a] border-t border-gray-800 flex justify-around py-3">
        <div>
         <House className="w-6 h-6 text-gray-400 text-center mx-1.5" />
        <button className="text-gray-400 text-sm">Home</button>
        </div>
        <div>
        <Search className="w-6 h-6 text-gray-400 text-center mx-1.5" />
        <button className="text-gray-400 text-sm">Search</button>
        </div>
        <div>
        <MessageSquare className="w-6 h-6 text-gray-400 text-center mx-1.5" />
        <button className="text-gray-400 text-sm">Chats</button>
        </div>
        <div>
          <User className="w-6 h-6 text-white-400 text-center mx-1.5" />
        <button className="text-white-600 text-sm">Profile</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;