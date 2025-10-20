import { Settings, Sun, Heart, MessageCircle, Camera } from "lucide-react";

function Profile() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-5">
        <h1 className="text-lg font-semibold">My Profile</h1>
        <div className="flex items-center gap-3">
          <Sun className="w-5 h-5 text-gray-300 cursor-pointer" />
          <Settings className="w-5 h-5 text-gray-300 cursor-pointer" />
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center mt-6">
        <div className="relative">
          <img src="" alt="avatar" className="w-20 h-20 rounded-full" />
          <div className="absolute bottom-0 right-0 bg-lime-400 p-[3px] rounded-full">
            <Camera className="w-3 h-3 text-black" />
          </div>
        </div>

        <h2 className="text-lg font-semibold mt-2">Okechukwu Delight</h2>
        <p className="text-gray-400 text-sm">10.2k followers - 142 following</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mt-6">
        <button className="bg-lime-400 text-black font-medium px-4 py-1.5 rounded-full text-sm">
          Feed
        </button>
        <button className="bg-[#1c1c1c] px-4 py-1.5 rounded-full text-sm text-gray-300">
          Challenge
        </button>
        <button className="bg-[#1c1c1c] px-4 py-1.5 rounded-full text-sm text-gray-300">
          Badge
        </button>
      </div>

      {/* Post */}
      <div className="bg-[#1c1c1c] mx-4 mt-6 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <img src="" alt="post-author" className="w-10 h-10 rounded-full" />
          <div>
            <h3 className="font-semibold text-sm">Okechukwu Delight</h3>
            <p className="text-xs text-gray-400">3h ago</p>
          </div>
        </div>

        <p className="text-sm mb-3">Beautiful landscape</p>
        <img src="" alt="landscape" className="rounded-xl w-full" />

        {/* Post Action */}
        <div className="flex justify-between items-center mt-3 text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" /> <span>12</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> <span>40</span>
          </div>
        </div>
      </div>

      {/* Spacer to ensure content doesn't hide behind bottom nav */}
      <div className="h-24" />

      {/* Bottom Nav */}
      <div className="fixed bottom-0 w-full bg-[#1a1a1a] border-t border-gray-800 flex justify-around py-3">
        <button className="text-lime-400">Home</button>
        <button className="text-gray-400">Search</button>
        <button className="text-gray-400">Chats</button>
        <button className="text-lime-400 font-medium">Profile</button>
      </div>
    </div>
  );
}

export default Profile;