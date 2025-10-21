import { useState } from "react";
import { 
  ArrowLeft,
  Sun, 
  Moon,
  Activity,
  CheckCircle,
  Trophy,
  Target,
  Users,
  Gift,
  Clock,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import { useTheme } from "../contexts/ThemeContext";

function RecentActivity() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useTheme();
  const [filter, setFilter] = useState('all');

  const allActivities = [
    { type: 'steps', message: 'You walked 8,200 steps today', points: '+4 points', time: '2 hours ago', icon: Activity, date: 'Today' },
    { type: 'task', message: 'Task completed: Followed brand on X', points: '+2 points', time: '4 hours ago', icon: CheckCircle, date: 'Today' },
    { type: 'badge', message: 'New badge unlocked: Consistency Hero', points: '🏅', time: '1 day ago', icon: Trophy, date: 'Yesterday' },
    { type: 'challenge', message: 'Challenge completed: 3-day streak', points: '+15 points', time: '2 days ago', icon: Target, date: '2 days ago' },
    { type: 'referral', message: 'Friend joined: @johndoe', points: '+10 points', time: '3 days ago', icon: Users, date: '3 days ago' },
    { type: 'reward', message: 'Reward claimed: $2.50', points: '💰', time: '4 days ago', icon: Gift, date: '4 days ago' },
    { type: 'steps', message: 'You walked 9,500 steps', points: '+5 points', time: '5 days ago', icon: Activity, date: '5 days ago' },
    { type: 'task', message: 'Task completed: Survey participation', points: '+3 points', time: '6 days ago', icon: CheckCircle, date: '6 days ago' },
    { type: 'challenge', message: 'Challenge started: Weekly goals', points: '🎯', time: '1 week ago', icon: Target, date: '1 week ago' },
    { type: 'badge', message: 'Badge earned: Early Bird', points: '🏅', time: '1 week ago', icon: Trophy, date: '1 week ago' }
  ];

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'steps', label: 'Steps' },
    { id: 'task', label: 'Tasks' },
    { id: 'badge', label: 'Badges' },
    { id: 'challenge', label: 'Challenges' },
    { id: 'referral', label: 'Referrals' }
  ];

  const filteredActivities = filter === 'all' 
    ? allActivities 
    : allActivities.filter(activity => activity.type === filter);

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = activity.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

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
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <p className="text-xs text-gray-400">{filteredActivities.length} activities</p>
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

      {/* Filter Tabs */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors duration-300 ${
                filter === option.id
                  ? 'bg-lime-400 text-black'
                  : isLightMode
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-[#2a2a2a] text-gray-300'
              }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="px-4 pb-24">
        {Object.entries(groupedActivities).map(([date, activities]) => (
          <div key={date} className="mb-6">
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-400">{date}</h3>
            </div>

            {/* Activities for this date */}
            <div className={`rounded-xl overflow-hidden transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 transition-colors duration-300 ${
                    index !== activities.length - 1 && (isLightMode ? 'border-b border-gray-100' : 'border-b border-gray-800')
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'}`}>
                    <activity.icon className="w-4 h-4 text-lime-400" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm font-semibold text-lime-400">{activity.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No activities found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filter or check back later!</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default RecentActivity;
