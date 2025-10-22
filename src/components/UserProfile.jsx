import { ArrowLeft, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function UserProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLightMode } = useTheme();

  const contactName = location.state?.contactName || "Unknown User";
  const username = location.state?.username || "@unknown";
  const isAI = location.state?.isAI || false;

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
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>

        <div className="w-10"></div>
      </div>

      {/* Profile Body */}
      <div className="px-6 py-8">
        <div className="flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            isAI ? 'bg-gradient-to-br from-purple-500 to-blue-500' : (isLightMode ? 'bg-gray-200' : 'bg-[#1f1f1f]')
          }`}>
            {isAI ? (
              <span className="text-white font-bold text-2xl">AI</span>
            ) : (
              <Users className="w-10 h-10 text-indigo-600" />
            )}
          </div>
          <h3 className="mt-4 text-xl font-semibold">{contactName}</h3>
          <p className={`${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{username}</p>

          <div className={`mt-6 w-full rounded-2xl p-4 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
            <h4 className="font-semibold mb-2">About</h4>
            <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'} text-sm`}>
              This is a mock profile page for the selected user. You can extend this with more details like bio, recent activity, and shared media.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;


