import { ArrowLeft, Moon, Sun, CheckCircle, Clock, Star, Target, Users, Share2, Camera, Heart, MessageSquare, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import BottomNavigation from "./BottomNavigation";

function Tasks() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('available');

  const availableTasks = [
    {
      id: 1,
      title: "Follow a brand on X",
      description: "Follow @ProoflyApp on X (formerly Twitter) to stay updated with latest features",
      reward: 5,
      type: "social",
      icon: Share2,
      completed: false,
      progress: 0,
      maxProgress: 1,
      timeEstimate: "1 min",
      difficulty: "Easy"
    },
    {
      id: 2,
      title: "Share your achievement",
      description: "Share your latest XP milestone on social media",
      reward: 10,
      type: "social",
      icon: Share2,
      completed: false,
      progress: 0,
      maxProgress: 1,
      timeEstimate: "2 mins",
      difficulty: "Easy"
    },
    {
      id: 5,
      title: "Weekly challenge: 7-day streak",
      description: "Complete at least one task every day for 7 consecutive days",
      reward: 50,
      type: "challenge",
      icon: Award,
      completed: false,
      progress: 3,
      maxProgress: 7,
      timeEstimate: "7 days",
      difficulty: "Hard"
    }
  ];

  const completedTasks = [
    {
      id: 6,
      title: "Connect your wallet",
      description: "Link your crypto wallet to start earning blockchain rewards",
      reward: 10,
      type: "setup",
      icon: Star,
      completed: true,
      completedAt: "2 hours ago",
      rewardClaimed: true
    },
    {
      id: 7,
      title: "Complete your profile",
      description: "Add a profile picture and complete your bio information",
      reward: 5,
      type: "setup",
      icon: Camera,
      completed: true,
      completedAt: "1 day ago",
      rewardClaimed: true
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-900/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'Hard': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'social': return Share2;
      case 'fitness': return Target;
      case 'referral': return Users;
      case 'challenge': return Award;
      case 'setup': return Star;
      default: return Target;
    }
  };

  const renderTaskCard = (task, isCompleted = false) => {
    const TypeIcon = getTypeIcon(task.type);
    
    return (
      <div
        key={task.id}
        className={`rounded-xl p-4 mb-4 transition-colors duration-300 ${
          isCompleted 
            ? (isLightMode ? 'bg-green-50 border border-green-200' : 'bg-green-900/20 border border-green-800')
            : (isLightMode ? 'bg-white shadow-md' : 'bg-[#1c1c1c]')
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${
              isCompleted 
                ? 'bg-green-400 text-black' 
                : (isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]')
            }`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold text-sm transition-colors duration-300 ${
                isCompleted ? 'text-green-600' : (isLightMode ? 'text-gray-900' : 'text-white')
              }`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${getDifficultyColor(task.difficulty)}`}>
                  {task.difficulty}
                </span>
                <span className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {task.timeEstimate}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-lg font-bold transition-colors duration-300 ${
              isCompleted ? 'text-green-400' : 'text-lime-400'
            }`}>
              +{task.reward}
            </div>
            <div className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              points
            </div>
          </div>
        </div>

        <p className={`text-sm mb-3 transition-colors duration-300 ${
          isLightMode ? 'text-gray-600' : 'text-gray-300'
        }`}>
          {task.description}
        </p>

        {!isCompleted && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Progress
              </span>
              <span className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {task.progress}/{task.maxProgress}
              </span>
            </div>
            <div className={`w-full rounded-full h-2 transition-colors duration-300 ${isLightMode ? 'bg-gray-200' : 'bg-gray-700'}`}>
              <div 
                className="bg-lime-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((task.progress / task.maxProgress) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
            isLightMode ? 'text-green-600' : 'text-green-400'
          }`}>
            <CheckCircle className="w-4 h-4" />
            <span>Completed {task.completedAt}</span>
            {task.rewardClaimed && (
              <span className="ml-auto font-medium">✓ Reward Claimed</span>
            )}
          </div>
        )}

        {!isCompleted && (
          <button 
            onClick={() => {
              if (task.type === 'referral') {
                navigate('/referrals');
              }
              // Add more task type navigations here if needed
            }}
            className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors duration-300 ${
              task.progress >= task.maxProgress || task.type === 'referral'
                ? 'bg-lime-400 text-black hover:bg-lime-500 cursor-pointer'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
            disabled={task.progress < task.maxProgress && task.type !== 'referral'}
          >
            {task.progress >= task.maxProgress ? 'Claim Reward' : 'Do Task'}
          </button>
        )}
      </div>
    );
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
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Earn rewards by completing actions
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
        <div className={`rounded-xl p-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-md' : 'bg-[#1c1c1c]'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Progress</h3>
            <TrendingUp className="w-6 h-6 text-lime-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-lime-400">7</div>
              <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Completed Today
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">1420</div>
              <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Total Points Earned
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className={`flex rounded-lg p-1 transition-colors duration-300 ${isLightMode ? 'bg-gray-200' : 'bg-[#2a2a2a]'}`}>
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
            activeTab === 'available'
              ? 'bg-lime-400 text-black'
              : (isLightMode ? 'text-gray-600' : 'text-gray-400')
          }`}
        >
          Available ({availableTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-lime-400 text-black'
              : (isLightMode ? 'text-gray-600' : 'text-gray-400')
          }`}
        >
          Completed ({completedTasks.length})
        </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="px-4 pb-24">
        {activeTab === 'available' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Tasks</h3>
              <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {availableTasks.filter(task => task.progress >= task.maxProgress).length} ready to claim
              </div>
            </div>
            
            {availableTasks.map(task => renderTaskCard(task, false))}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Completed Tasks</h3>
              <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {completedTasks.reduce((sum, task) => sum + task.reward, 0)} points earned
              </div>
            </div>
            
            {completedTasks.map(task => renderTaskCard(task, true))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default Tasks;
