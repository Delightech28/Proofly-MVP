import { useState } from "react";
import { 
  Bell, 
  Sun, 
  Moon, 
  ArrowLeft,
  CheckCircle,
  Clock,
  Gift,
  Trophy,
  Star,
  Activity,
  Target,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileImage from "../assets/images/Delight.png";
import { useTheme } from "../contexts/ThemeContext";

function Notifications() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useTheme();

  const notifications = [
    {
      id: 1,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'You\'ve earned the "Step Master" badge for walking 10,000 steps 7 days in a row!',
      time: '2 minutes ago',
      icon: Trophy,
      color: 'text-yellow-400',
      unread: true
    },
    {
      id: 2,
      type: 'reward',
      title: 'Reward Available',
      message: 'You have $2.50 ready to claim from your recent activities.',
      time: '1 hour ago',
      icon: Gift,
      color: 'text-green-400',
      unread: true
    },
    {
      id: 3,
      type: 'task',
      title: 'Task Completed',
      message: 'Great job! You completed "Follow TechBrand on X" and earned 5 XP.',
      time: '3 hours ago',
      icon: CheckCircle,
      color: 'text-blue-400',
      unread: false
    },
    {
      id: 4,
      type: 'challenge',
      title: 'Challenge Update',
      message: 'You\'re 2 days into the "7-Day Streak Challenge". Keep it up!',
      time: '1 day ago',
      icon: Target,
      color: 'text-purple-400',
      unread: false
    },
    {
      id: 5,
      type: 'referral',
      title: 'Referral Bonus',
      message: 'Your friend @johndoe joined Proofly! You earned 10 XP.',
      time: '2 days ago',
      icon: Users,
      color: 'text-orange-400',
      unread: false
    },
    {
      id: 6,
      type: 'activity',
      title: 'Daily Summary',
      message: 'You walked 8,500 steps today and earned 4 XP. Great progress!',
      time: '3 days ago',
      icon: Activity,
      color: 'text-lime-400',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isLightMode ? 'bg-gray-50 text-gray-900' : 'bg-[#0e0e0e] text-white'}`}>
      {/* Header */}
      <div className={`px-4 py-4 border-b transition-colors duration-300 ${isLightMode ? 'border-gray-200' : 'border-gray-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-full">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-xs text-gray-400">{unreadCount} unread</p>
            </div>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
          >
            {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 py-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`mb-4 p-4 rounded-xl transition-colors duration-300 ${
              notification.unread 
                ? isLightMode 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-[#1c1c1c] border border-lime-400'
                : isLightMode 
                  ? 'bg-white border border-gray-200' 
                  : 'bg-[#1c1c1c] border border-gray-700'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`p-2 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
                <notification.icon className={`w-5 h-5 ${notification.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{notification.title}</h3>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-2">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>

              {/* Action Button */}
              {notification.type === 'reward' && (
                <button className="bg-lime-400 text-black text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-lime-500 transition">
                  Claim
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Empty State (if no notifications) */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No notifications</h3>
            <p className="text-sm text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Bottom Spacer for Navigation */}
      <div className="h-20"></div>
    </div>
  );
}

export default Notifications;
