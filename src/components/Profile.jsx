import { Settings, Sun, Heart, MessageCircle, Camera } from "lucide-react";
function Profile() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">
     <div className="flex justify-between items-center px-5 pt-5">
        <h1 className="text-lg font-semibold">My Profile</h1>
        <div className="flex items-center gap-3">
            <Sun className="w-5 h-5 text-gray-300 cursor-pointer" />
            <Settings className="w-5 h-5 text-gray-300 cursor-pointer" />
        </div>
     </div>

     <div className="flex flex-col items-center mt-6">
        <div className="relative">
          <img src="" alt="avatar" className="w-20 h-20 rounded-full"/>
          <div className="absolute bottom-0 right-0 bg-lime-400 p-[3px] rounded-full">
            <Camera className="w-3 h-3 text-black"/>
           </div>
     </div>
        <h2 className="text-lg font-semibold mt-2">Okechukwu Delight</h2>
        <p className="text-gray-400 text-sm">10.2k followers - 142 following</p>
    </div>

    <div className="flex justify-center gap-3 mt-6">
        <button className="bg-lime-400 text-black">

        </button>
    </div>
   </div>
  );
}

export default Profile;