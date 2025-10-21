import { ArrowLeft, Moon, Sun, Send, MoreVertical, Phone, Video, Search, Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

function Chat() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useTheme();
  const [activeChat, setActiveChat] = useState(0); // Open AI chat by default
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
        isRead: true
      },
      {
        id: 2,
        senderId: 0, // Current user
        content: "Hi! Can you help me understand how to earn more points?",
        timestamp: "10:05 AM",
        isRead: true
      },
      {
        id: 3,
        senderId: 0, // AI Assistant
        content: "Absolutely! Here are the best ways to earn points:\n\n1. Complete daily tasks (5-15 points each)\n2. Invite friends (10 points per referral)\n3. Maintain streaks (bonus points)\n4. Complete challenges (up to 50 points)\n\nWould you like me to explain any of these in detail?",
        timestamp: "10:06 AM",
        isRead: true
      },
      {
        id: 4,
        senderId: 0, // AI Assistant
        content: "Hi! I'm here to help you with tasks, earning tips, and app features. How can I assist you today?",
        timestamp: "Just now",
        isRead: true
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
              <button className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}>
                <Phone className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}>
                <Video className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}>
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
                  <p className={`text-xs mt-1 ${
                    msg.senderId === 0 ? 'text-indigo-100' : (isLightMode ? 'text-gray-500' : 'text-gray-400')
                  }`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className={`px-4 py-3 border-t transition-colors duration-300 ${isLightMode ? 'border-gray-200 bg-white' : 'border-gray-800 bg-[#1c1c1c]'}`}>
            <div className="flex items-center gap-3">
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
