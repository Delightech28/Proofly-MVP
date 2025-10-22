import { ArrowLeft, Moon, Sun, Users, Share2, Copy, Mail, MessageSquare, Gift, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import BottomNavigation from "./BottomNavigation";

function Referrals() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const referralCode = "DELIGHT2024";
  const referralLink = "https://proofly.app/invite/DELIGHT2024";

  const invitedFriends = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "@sarahj",
      joinedDate: "2 days ago",
      status: "active",
      pointsEarned: 10
    },
    {
      id: 2,
      name: "Mike Chen",
      username: "@mikechen",
      joinedDate: "1 week ago",
      status: "active",
      pointsEarned: 10
    }
  ];

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
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
            <TrendingUp className="w-6 h-6 text-lime-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-lime-400">2</div>
              <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Friends Invited
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">20</div>
              <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Points Earned
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
                Earn +10 XP for each friend who joins
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
                value={referralCode}
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
                value={referralLink}
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
                    text: `Join me on Proofly and start earning rewards! Use my referral code: ${referralCode}`,
                    url: referralLink
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
            Invited: {invitedFriends.length}
          </div>
        </div>

        <div className="space-y-3">
          {invitedFriends.map((friend) => (
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
                  <h4 className="font-semibold text-sm">{friend.name}</h4>
                  <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {friend.username} • Joined {friend.joinedDate}
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
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default Referrals;
