import { ArrowLeft, Moon, Sun, Users, Send, Search, MessageSquare, Phone, Video, MoreVertical, Check, CheckCheck, X, Paperclip } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  increment,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLightMode, toggleTheme } = useTheme();
  const auth = getAuth();

  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid || null);
  const [activeChat, setActiveChat] = useState(location.state?.chatId || null); // null -> show list
  const [otherUser, setOtherUser] = useState(location.state?.otherUser || null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({
    0: [
      {
        id: 'ai-1',
        senderId: 0,
        content: "Hi! I'm here to help you with tasks, earning tips, and app features. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toLowerCase(),
        isRead: true
      }
    ]
  });
  
  // helper to format timestamps to time-only like "4:26 pm" (no seconds, lowercase)
  const formatTime = (val) => {
    if (!val) return '';
    try {
      let date;
      // Firestore Timestamp has toDate()
      if (typeof val.toDate === 'function') date = val.toDate();
      // Some code returns { seconds, nanoseconds }
      else if (val.seconds) date = new Date(val.seconds * 1000 + (val.nanoseconds || 0) / 1e6);
      else date = new Date(val);
      // Use hour:minute only and lowercase am/pm
      return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    } catch (e) {
      return String(val).toLowerCase();
    }
  };

  // UI & helper state
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // open a chat and mark unread count for current user as read (set to 0)
  const openChat = async (chatId) => {
    console.debug('Opening chat:', { chatId, currentUserId });
    setActiveChat(chatId);
    if (!chatId || chatId === 0) return;
    if (!currentUserId) return;
    try {
      const chatRef = doc(db, 'chats', chatId);
      // clear unread count for current user
      await updateDoc(chatRef, { [`unreadCounts.${currentUserId}`]: 0 });

      // mark messages as read for this user (messages sent by others and isRead == false)
      try {
        const msgsRef = collection(db, 'chats', chatId, 'messages');
        const q = query(msgsRef, where('isRead', '==', false), where('senderId', '!=', currentUserId));
        console.debug('Fetching unread messages to mark as read', { chatId, currentUserId });
        const snap = await getDocs(q);
        console.debug('Found unread messages:', snap.size);
        
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach(d => {
            console.debug('Marking message as read:', d.id, d.data());
            batch.update(d.ref, { isRead: true });
          });
          await batch.commit();
          console.debug('Batch update completed - messages marked as read');
        }
      } catch (e) {
        console.error('openChat mark messages read error', e);
        console.error(e); // Log the full error
      }
    } catch (e) {
      console.error('openChat update unread error', e);
    }
  };

  const sendMessage = async () => {
    const text = (message || '').trim();
    if (!text || !activeChat) return;

    if (activeChat === 0) {
      // local AI handling (simple echo)
      setMessages(prev => ({ ...prev, 0: [...(prev[0] || []), { id: 'ai-' + Date.now(), senderId: 0, content: text, timestamp: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toLowerCase(), isRead: true }] }));
      setMessage('');
      return;
    }

    try {
      const messagesRef = collection(db, 'chats', activeChat, 'messages');
      // include isDelivered so sender sees delivered state; receiver will see isRead=false
      const newMsgRef = await addDoc(messagesRef, { content: text, senderId: currentUserId, timestamp: serverTimestamp(), isRead: false, isDelivered: true });

      const chatRef = doc(db, 'chats', activeChat);
      // update last message/time and increment unreadCounts for other participants
      // fetch chat doc to get participants
      // update last message/time
      await updateDoc(chatRef, { lastMessage: { content: text, senderId: currentUserId }, lastMessageTime: serverTimestamp() });

      // increment unreadCounts for other participants (attempt best-effort)
      try {
        // read chat doc to get participants
        const chatDocSnap = await getDoc(chatRef);
        const chatData = chatDocSnap.exists() ? chatDocSnap.data() : null;
        if (chatData?.participants && Array.isArray(chatData.participants)) {
          const updates = {};
          chatData.participants.forEach(p => {
            if (p !== currentUserId) updates[`unreadCounts.${p}`] = increment(1);
          });
          if (Object.keys(updates).length) await updateDoc(chatRef, updates);
        }
      } catch (e) {
        // If we can't increment (rules), log and continue
        console.error('sendMessage increment unreadCounts error', e);
      }
      setMessage('');
    } catch (e) {
      console.error('sendMessage error', e);
    }
  };

  const handleAudioCall = () => {
    setShowDropdown(false);
    navigate('/audio-call', { state: { contactName: conversations.find(c => c.id === activeChat)?.user.name, contactId: activeChat } });
  };

  const handleVideoCall = () => {
    setShowDropdown(false);
    navigate('/video-call', { state: { contactName: conversations.find(c => c.id === activeChat)?.user.name, contactId: activeChat } });
  };

  // Filtered conversations (simple)
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (conv.user?.name || '').toLowerCase().includes(q) || (conv.user?.username || '').toLowerCase().includes(q);
  });

  // Active conversation helpers to avoid repeated lookups and guard against undefined
  const activeConv = conversations.find(c => c.id === activeChat) || null;
  const activeName = activeConv?.user?.name || otherUser?.name || 'Chat';
  const activeUser = activeConv?.user || otherUser || null;
  const activeIsOnline = !!activeConv?.user?.isOnline;
  const activeLastSeen = activeConv?.user?.lastSeen || otherUser?.lastSeen || null;

  // Real-time messages listener for the active chat
  useEffect(() => {
    if (!activeChat) return;
    if (activeChat === 0) return; // AI chat is local

    const messagesRef = collection(db, 'chats', activeChat, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsub = onSnapshot(q, snap => {
      const ms = snap.docs.map(d => {
        const data = d.data();
        const ts = formatTime(data.timestamp);
        return { id: d.id, ...data, timestamp: ts };
      });
      console.debug('Messages snapshot updated:', ms.length, 'messages. Sample read states:', 
        ms.slice(-3).map(m => ({ id: m.id, isRead: m.isRead, isDelivered: m.isDelivered }))
      );
      setMessages(prev => ({ ...prev, [activeChat]: ms }));
    }, err => console.error('messages onSnapshot error', err));

    return () => unsub();
  }, [activeChat]);

  // auth listener to keep currentUserId up-to-date
  useEffect(() => {
    const un = auth.onAuthStateChanged(u => setCurrentUserId(u?.uid || null));
    return () => un();
  }, [auth]);

  // Real-time listener: conversations for currentUser
  useEffect(() => {
    if (!currentUserId) {
      setConversations([]);
      return;
    }

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUserId), orderBy('lastMessageTime', 'desc'), limit(50));

    const unsub = onSnapshot(q, snap => {
      const chats = snap.docs.map(d => {
        const data = d.data();
        // determine the other participant
        const otherId = Array.isArray(data.participants) ? data.participants.find(p => p !== currentUserId) : null;
        const other = data.participantDetails?.[otherId] || { name: 'Unknown', avatar: null };
        return {
          id: d.id,
          user: { id: otherId, name: other.name || 'Unknown', avatar: other.avatar || null, isAI: false },
          lastMessage: data.lastMessage?.content || '',
          lastMessageTime: data.lastMessageTime || null,
          unreadCount: data.unreadCounts?.[currentUserId] || 0,
          typing: data.typing || {}
        };
      });

      // Ensure AI assistant at top
      const ai = {
        id: 0,
        user: { id: 0, name: 'Proofly AI Assistant', username: '@prooflyai', isAI: true },
        lastMessage: messages[0]?.[messages[0].length - 1]?.content || '',
        lastMessageTime: null,
        unreadCount: 0,
        typing: {}
      };

      setConversations([ai, ...chats]);
    }, err => console.error('chats onSnapshot error', err));

    return () => unsub();
  }, [currentUserId]);

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
                  onClick={() => openChat(conversation.id)}
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
                activeUser?.isAI 
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                  : (isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]')
              }`}>
                {activeUser?.isAI ? (
                  <span className="text-white font-bold text-sm">AI</span>
                ) : activeUser?.avatar ? (
                  <img src={activeUser.avatar} alt={activeUser.name || 'avatar'} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <Users className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span>{activeName}</span>
                  {activeConv?.unreadCount > 0 && (
                    <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">{activeConv.unreadCount}</span>
                  )}
                </h3>
                <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {activeIsOnline ? 'Online' : (activeLastSeen ? 'Last seen ' + activeLastSeen : 'Last seen: unknown')}
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
            {messages[activeChat]?.map((msg) => {
              const senderIdStr = String(msg.senderId ?? '');
              const meIdStr = String(currentUserId ?? '');
              const isAI = senderIdStr === '0';
              const isMine = !isAI && senderIdStr === meIdStr;

              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    isMine ? 'ml-auto bg-indigo-600 text-white' : (isLightMode ? 'bg-gray-200 text-gray-900' : 'bg-[#2a2a2a] text-white')
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    {isMine ? (
                      <div className="flex items-center justify-end mt-1 text-xs text-indigo-100">
                        <p className="text-xs mr-2">{msg.timestamp}</p>
                        <div className="flex items-center space-x-1">
                          {msg.isRead === true ? (
                            <CheckCheck className="w-3 h-3 text-blue-300" />
                          ) : msg.isDelivered === true ? (
                            <Check className="w-3 h-3 text-indigo-100" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-current"></div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={`flex items-center mt-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <p className="text-xs">{msg.timestamp}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
