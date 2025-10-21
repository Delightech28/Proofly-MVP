import { ArrowLeft, Moon, Sun, Search as SearchIcon, Users, MessageCircle, UserPlus, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import BottomNavigation from "./BottomNavigation";

function Search() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const searchResults = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "@sarahj",
      bio: "Fitness enthusiast and crypto trader",
      followers: "2.5k",
      isFollowing: false,
      avatar: null
    },
    {
      id: 2,
      name: "Mike Chen",
      username: "@mikechen",
      bio: "Blockchain developer and DeFi enthusiast",
      followers: "1.8k",
      isFollowing: true,
      avatar: null
    },
    {
      id: 3,
      name: "Emma Davis",
      username: "@emmad",
      bio: "Digital artist and NFT creator",
      followers: "3.2k",
      isFollowing: false,
      avatar: null
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      username: "@alexr",
      bio: "Web3 entrepreneur and investor",
      followers: "5.1k",
      isFollowing: false,
      avatar: null
    },
    {
      id: 5,
      name: "Lisa Wang",
      username: "@lisaw",
      bio: "Crypto analyst and content creator",
      followers: "4.7k",
      isFollowing: true,
      avatar: null
    }
  ];

  const filteredResults = searchResults.filter(user => {
    // If there's a search query, filter by it
    if (searchQuery) {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.username.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeFilter === "following") return matchesSearch && user.isFollowing;
      if (activeFilter === "not-following") return matchesSearch && !user.isFollowing;
      return matchesSearch;
    }
    
    // If no search query, show users based on active filter
    if (activeFilter === "following") return user.isFollowing;
    if (activeFilter === "not-following") return !user.isFollowing;
    return true; // Show all users for "all" tab
  });

  const clearSearch = () => {
    setSearchQuery("");
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
          <h2 className="text-lg font-semibold">Search Users</h2>
          <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Find and connect with friends
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
        >
          {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-4">
        <div className={`relative transition-colors duration-300`}>
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none`}>
            <SearchIcon className={`h-5 w-5 transition-colors duration-300 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`block w-full pl-10 pr-10 py-3 border rounded-xl transition-colors duration-300 ${
              isLightMode 
                ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-lime-400 focus:ring-lime-400' 
                : 'bg-[#1c1c1c] border-gray-600 text-white placeholder-gray-400 focus:border-lime-400 focus:ring-lime-400'
            } focus:outline-none focus:ring-1`}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} rounded-r-xl cursor-pointer`}
            >
              <X className={`h-5 w-5 transition-colors duration-300 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-4">
        <div className={`flex rounded-lg p-1 transition-colors duration-300 ${isLightMode ? 'bg-gray-200' : 'bg-[#2a2a2a]'}`}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-lime-400 text-black'
                : (isLightMode ? 'text-gray-600' : 'text-gray-400')
            }`}
          >
            All ({searchResults.length})
          </button>
          <button
            onClick={() => setActiveFilter('following')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
              activeFilter === 'following'
                ? 'bg-lime-400 text-black'
                : (isLightMode ? 'text-gray-600' : 'text-gray-400')
            }`}
          >
            Following ({searchResults.filter(u => u.isFollowing).length})
          </button>
          <button
            onClick={() => setActiveFilter('not-following')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${
              activeFilter === 'not-following'
                ? 'bg-lime-400 text-black'
                : (isLightMode ? 'text-gray-600' : 'text-gray-400')
            }`}
          >
            Discover ({searchResults.filter(u => !u.isFollowing).length})
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="px-4 pb-24">
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {searchQuery ? (
                filteredResults.length > 0 ? `Found ${filteredResults.length} users` : 'No results found'
              ) : (
                activeFilter === 'following' ? `People You Follow (${filteredResults.length})` :
                activeFilter === 'not-following' ? `Discover Users (${filteredResults.length})` :
                `All Users (${filteredResults.length})`
              )}
            </h3>
            {searchQuery && filteredResults.length > 0 && (
              <div className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                for "{searchQuery}"
              </div>
            )}
          </div>

          {filteredResults.length > 0 ? (
            filteredResults.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors duration-300 ${
                  isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'
                  }`}>
                    <Users className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{user.name}</h4>
                    <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {user.username}
                    </p>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                      {user.bio}
                    </p>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {user.followers} followers
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className={`p-2 rounded-full transition-colors duration-300 cursor-pointer ${
                    isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
                  }`}>
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-300 cursor-pointer ${
                    user.isFollowing
                      ? (isLightMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-600 text-gray-300 hover:bg-gray-500')
                      : 'bg-lime-400 text-black hover:bg-lime-500'
                  }`}>
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <SearchIcon className={`w-12 h-12 mx-auto mb-3 transition-colors duration-300 ${isLightMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <p className={`text-lg font-medium transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {searchQuery ? 'No users found' : (
                  activeFilter === 'following' ? 'No people you follow' :
                  activeFilter === 'not-following' ? 'No users to discover' :
                  'No users available'
                )}
              </p>
              <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {searchQuery ? 'Try searching with different keywords' : (
                  activeFilter === 'following' ? 'Start following people to see them here' :
                  activeFilter === 'not-following' ? 'All users are being followed' :
                  'No users in the app yet'
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default Search;
