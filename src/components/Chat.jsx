import { ArrowLeft, Moon, Sun, Send, MoreVertical, Phone, Video, Search, Users, MessageSquare, X, Paperclip, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

function Chat() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useTheme();
  const [activeChat, setActiveChat] = useState(0); // Open AI chat by default
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const conversations = [
    {
      id: 0, // AI Chat - pinned at top
      user: {
        id: 0,
        name: "Proofly AI Assistant",
        username: "@prooflyai",
        avatar: null,
        isOnline: true,
        lastSeen: "Always online",
        isAI: true
      },
      lastMessage: "Hi! I'm here to help you with tasks, earning tips, and app features. How can I assist you today?",
      timestamp: "Just now",
      unreadCount: 0,
      isTyping: false,
      isPinned: true
    },
    {
      id: 1,
      user: {
        id: 1,
        name: "Sarah Johnson",
        username: "@sarahj",
        avatar: null,
        isOnline: true,
        lastSeen: "Online"
      },
      lastMessage: "Thanks for the referral! I'm loving the app",
      timestamp: "2 min ago",
      unreadCount: 2,
      isTyping: false
    },
    {
      id: 2,
      user: {
        id: 2,
        name: "Mike Chen",
        username: "@mikechen",
        avatar: null,
        isOnline: false,
        lastSeen: "2 hours ago"
      },
      lastMessage: "How do I complete the daily steps challenge?",
      timestamp: "1 hour ago",
      unreadCount: 0,
      isTyping: false
    },
    {
      id: 3,
      user: {
        id: 3,
        name: "Emma Davis",
        username: "@emmad",
        avatar: null,
        isOnline: true,
        lastSeen: "Online"
      },
      lastMessage: "Great job on the 7-day streak! 🎉",
      timestamp: "3 hours ago",
      unreadCount: 1,
      isTyping: true
    },
    {
      id: 4,
      user: {
        id: 4,
        name: "Alex Rodriguez",
        username: "@alexr",
        avatar: null,
        isOnline: false,
        lastSeen: "1 day ago"
      },
      lastMessage: "Let's collaborate on the referral program",
      timestamp: "Yesterday",
      unreadCount: 0,
      isTyping: false
    }
  ];

  const messages = {
    0: [ // AI Chat messages
      {
        id: 1,
        senderId: 0, // AI Assistant
        content: "Welcome to Proofly! I'm your AI assistant here to help you maximize your earnings and complete tasks efficiently.",
        timestamp: "10:00 AM",
        isRead: true,
        isDelivered: true
      },
      {
        id: 2,
        senderId: 0, // Current user
        content: "Hi! Can you help me understand how to earn more points?",
        timestamp: "10:05 AM",
        isRead: true,
        isDelivered: true
      },
      {
        id: 3,
        senderId: 0, // AI Assistant
        content: "Absolutely! Here are the best ways to earn points:\n\n1. Complete daily tasks (5-15 points each)\n2. Invite friends (10 points per referral)\n3. Maintain streaks (bonus points)\n4. Complete challenges (up to 50 points)\n\nWould you like me to explain any of these in detail?",
        timestamp: "10:06 AM",
        isRead: true,
        isDelivered: true
      },
      {
        id: 4,
        senderId: 0, // Current user
        content: "Yes, tell me more about the daily tasks!",
        timestamp: "10:07 AM",
        isRead: true,
        isDelivered: true
      },
      {
        id: 5,
        senderId: 0, // AI Assistant
        content: "Great question! Daily tasks are your bread and butter for earning points:\n\n• Morning check-in: 5 points\n• Complete your profile: 10 points\n• Share a post: 8 points\n• Engage with 3 posts: 6 points\n• Invite a friend: 15 points\n\nThese reset every 24 hours, so consistency is key! 💪",
        timestamp: "10:08 AM",
        isRead: true,
        isDelivered: true
      },
      {
        id: 6,
        senderId: 0, // Current user
        content: "That's awesome! What about the referral program?",
        timestamp: "10:10 AM",
        isRead: true,
        isDelivered: true
      },
      {
        id: 7,
        senderId: 0, // AI Assistant
        content: "The referral program is fantastic! Here's how it works:\n\n🎯 You get 10 points for each friend who joins\n🎯 Your friend gets 5 bonus points when they sign up\n🎯 You both get 20 points when they complete their first task\n🎯 Special bonus: 50 points when you refer 5 friends!\n\nShare your unique link and watch your points grow! 🚀",
        timestamp: "10:11 AM",
        isRead: true,
        isDelivered: true
      },
      {
        id: 8,
        senderId: 0, // Current user
        content: "Perfect! I'm going to start with the daily tasks today. Any tips for staying consistent?",
        timestamp: "10:13 AM",
        isRead: true,
        isDelivered: true
      },
      {
        id: 9,
        senderId: 0, // AI Assistant
        content: "Excellent mindset! Here are my top tips for consistency:\n\n⏰ Set a daily reminder for the same time each day\n📱 Keep the app easily accessible on your phone\n🎯 Start small - even 5 minutes daily makes a difference\n📊 Track your streak and celebrate milestones\n👥 Join challenges with friends for accountability\n\nRemember: Small consistent actions lead to big rewards! You've got this! 💪✨",
        timestamp: "10:14 AM",
        isRead: true,
        isDelivered: true
      },
      {
        id: 10,
        senderId: 0, // AI Assistant
        content: "Hi! I'm here to help you with tasks, earning tips, and app features. How can I assist you today?",
        timestamp: "Just now",
        isRead: true,
        isDelivered: true
      }
    ],
    1: [
      {
        id: 1,
        senderId: 1,
        content: "Hey! I saw you joined Proofly through my referral link",
        timestamp: "10:30 AM",
        isRead: true
      },
      {
        id: 2,
        senderId: 0, // Current user
        content: "Welcome to the app! How are you liking it so far?",
        timestamp: "10:32 AM",
        isRead: true
      },
      {
        id: 3,
        senderId: 1,
        content: "It's amazing! The earning system is so intuitive",
        timestamp: "10:35 AM",
        isRead: true
      },
      {
        id: 4,
        senderId: 1,
        content: "Thanks for the referral! I'm loving the app",
        timestamp: "2 min ago",
        isRead: false
      }
    ],
    2: [
      {
        id: 1,
        senderId: 2,
        content: "Hi! I'm new to the app and need some help",
        timestamp: "9:15 AM",
        isRead: true
      },
      {
        id: 2,
        senderId: 0,
        content: "Of course! What do you need help with?",
        timestamp: "9:16 AM",
        isRead: true
      },
      {
        id: 3,
        senderId: 2,
        content: "How do I complete the daily steps challenge?",
        timestamp: "1 hour ago",
        isRead: true
      }
    ]
  };

  const filteredConversations = conversations.filter(conv => {
    // Always show AI chat at top
    if (conv.isPinned) return true;
    
    // Filter other conversations based on search
    return conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.user.username.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => {
    // Keep pinned chat at top
    if (a.isPinned) return -1;
    if (b.isPinned) return 1;
    return 0;
  });

  const sendMessage = () => {
    if (message.trim() && activeChat) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', message, 'to chat:', activeChat);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAudioCall = () => {
    setShowDropdown(false);
    navigate('/audio-call', { 
      state: { 
        contactName: conversations.find(c => c.id === activeChat)?.user.name,
        contactId: activeChat
      } 
    });
  };

  const handleVideoCall = () => {
    setShowDropdown(false);
    navigate('/video-call', { 
      state: { 
        contactName: conversations.find(c => c.id === activeChat)?.user.name,
        contactId: activeChat
      } 
    });
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Here you would typically upload the file and send it
      console.log('File selected:', file.name);
    }
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
          <h2 className="text-lg font-semibold">Messages</h2>
          <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {activeChat ? 'Chat with ' + conversations.find(c => c.id === activeChat)?.user.name : 'Your conversations'}
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
        >
          {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {!activeChat ? (
        // Conversations List
        <div className="flex-1">
          {/* Search Bar */}
          <div className="px-4 py-4">
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none`}>
                <Search className={`h-5 w-5 transition-colors duration-300 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl transition-colors duration-300 ${
                  isLightMode 
                    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-indigo-600' 
                    : 'bg-[#1c1c1c] border-gray-600 text-white placeholder-gray-400 focus:border-indigo-600 focus:ring-indigo-600'
                } focus:outline-none focus:ring-1`}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="px-4 pb-24">
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setActiveChat(conversation.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-colors duration-300 cursor-pointer ${
                    isLightMode ? 'bg-white shadow-sm hover:bg-gray-50' : 'bg-[#1c1c1c] hover:bg-[#2a2a2a]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      conversation.user.isAI 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                        : (isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]')
                    }`}>
                      {conversation.user.isAI ? (
                        <span className="text-white font-bold text-lg">AI</span>
                      ) : (
                        <Users className="w-6 h-6 text-indigo-600" />
                      )}
                    </div>
                    {conversation.user.isOnline && !conversation.user.isAI && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                    {conversation.user.isAI && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-purple-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm truncate">{conversation.user.name}</h3>
                      <div className="flex items-center gap-2">
                        {conversation.isTyping && (
                          <span className="text-xs text-indigo-600">typing...</span>
                        )}
                        <span className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {conversation.timestamp}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-sm truncate transition-colors duration-300 ${
                        conversation.unreadCount > 0 
                          ? (isLightMode ? 'text-gray-900 font-medium' : 'text-white font-medium')
                          : (isLightMode ? 'text-gray-600' : 'text-gray-400')
                      }`}>
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredConversations.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${isLightMode ? 'text-gray-300' : 'text-gray-600'}`} />
                <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </h3>
                <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {searchQuery ? 'Try searching with different keywords' : 'Start a conversation with someone!'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Chat Interface
        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Chat Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-300 ${isLightMode ? 'border-gray-200 bg-white' : 'border-gray-800 bg-[#1c1c1c]'}`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveChat(null)}
                className={`p-1 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                conversations.find(c => c.id === activeChat)?.user.isAI 
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                  : (isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]')
              }`}>
                {conversations.find(c => c.id === activeChat)?.user.isAI ? (
                  <span className="text-white font-bold text-sm">AI</span>
                ) : (
                  <Users className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-sm">
                  {conversations.find(c => c.id === activeChat)?.user.name}
                </h3>
                <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {conversations.find(c => c.id === activeChat)?.user.isOnline ? 'Online' : 'Last seen ' + conversations.find(c => c.id === activeChat)?.user.lastSeen}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAudioCall}
                className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
                title="Audio Call"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button 
                onClick={handleVideoCall}
                className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
                title="Video Call"
              >
                <Video className="w-5 h-5" />
              </button>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
                  title="More Options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {showDropdown && (
                  <div className={`absolute right-0 top-12 w-48 rounded-lg shadow-lg border transition-colors duration-300 ${
                    isLightMode 
                      ? 'bg-white border-gray-200' 
                      : 'bg-[#1c1c1c] border-gray-700'
                  }`}>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          const user = conversations.find(c => c.id === activeChat)?.user;
                          navigate('/user-profile', { state: { contactName: user?.name, username: user?.username, isAI: user?.isAI } });
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors duration-300 flex items-center gap-3 ${
                          isLightMode 
                            ? 'hover:bg-gray-50 text-gray-700' 
                            : 'hover:bg-[#2a2a2a] text-gray-300'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        View Profile
                      </button>
                      <button
                        className={`w-full px-4 py-2 text-left text-sm transition-colors duration-300 flex items-center gap-3 ${
                          isLightMode 
                            ? 'hover:bg-gray-50 text-gray-700' 
                            : 'hover:bg-[#2a2a2a] text-gray-300'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Clear Chat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-4">
            {messages[activeChat]?.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === 0 ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.senderId === 0
                    ? 'bg-indigo-600 text-white'
                      : (isLightMode ? 'bg-gray-200 text-gray-900' : 'bg-[#2a2a2a] text-white')
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <div className={`flex items-center justify-between mt-1 ${
                    msg.senderId === 0 ? 'text-indigo-100' : (isLightMode ? 'text-gray-500' : 'text-gray-400')
                  }`}>
                    <p className="text-xs">{msg.timestamp}</p>
                    {msg.senderId === 0 && (
                      <div className="flex items-center">
                        {msg.isRead ? (
                          <CheckCheck className="w-3 h-3 text-blue-300" />
                        ) : msg.isDelivered ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-current"></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input - Fixed at bottom */}
          <div className={`px-4 py-3 border-t transition-colors duration-300 sticky bottom-0 ${isLightMode ? 'border-gray-200 bg-white' : 'border-gray-800 bg-[#1c1c1c]'}`}>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
            
            {/* Selected file preview (images) */}
            {selectedFile && selectedFile.type?.startsWith('image/') && (
              <div className={`mb-2 p-2 rounded-lg ${
                isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]'
              }`}>
                <div className="relative inline-block">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected preview"
                    className="max-h-40 rounded-lg object-contain"
                  />
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleFileSelect}
                className={`p-3 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
                title="Attach File"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                  className={`w-full px-4 py-3 border rounded-2xl resize-none transition-colors duration-300 ${
                    isLightMode 
                    ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-indigo-600' 
                    : 'bg-[#2a2a2a] border-gray-600 text-white placeholder-gray-400 focus:border-indigo-600 focus:ring-indigo-600'
                  } focus:outline-none focus:ring-1`}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className={`p-3 rounded-full transition-colors duration-300 cursor-pointer ${
                  message.trim()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : (isLightMode ? 'bg-gray-300 text-gray-500' : 'bg-gray-600 text-gray-400')
                }`}
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Chat;
