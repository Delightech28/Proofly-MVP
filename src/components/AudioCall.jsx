import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Phone, Mic, MicOff, Volume2, VolumeX, Users, MoreVertical } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

function AudioCall() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLightMode } = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const contactName = location.state?.contactName || "Unknown Contact";
  const contactId = location.state?.contactId || 0;

  // Simulate call connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    navigate(-1);
  };

  return (
    <div className={`h-screen overflow-hidden transition-colors duration-300 ${isLightMode ? 'bg-gray-50 text-gray-900' : 'bg-[#0e0e0e] text-white'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-4 border-b transition-colors duration-300 ${isLightMode ? 'border-gray-200' : 'border-gray-800'}`}>
        <button 
          onClick={() => navigate(-1)} 
          className={`p-2 rounded-full transition-colors duration-300 ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold">Audio Call</h2>
          <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {isConnected ? formatDuration(callDuration) : 'Connecting...'}
          </p>
        </div>

        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Call Interface */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-8">
        {/* Contact Avatar */}
        <div className="mb-8">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-colors duration-300 ${
            contactId === 0 
              ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
              : (isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]')
          }`}>
            {contactId === 0 ? (
              <span className="text-white font-bold text-4xl">AI</span>
            ) : (
              <Users className="w-16 h-16 text-indigo-600" />
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold mb-2">{contactName}</h3>
          <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>

        {/* Call Status */}
        {!isConnected && (
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                Connecting to call...
              </span>
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="flex items-center gap-6">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-colors duration-300 ${
              isMuted 
                ? 'bg-red-500 text-white' 
                : (isLightMode ? 'bg-white shadow-md hover:bg-gray-50' : 'bg-[#1c1c1c] hover:bg-[#2a2a2a]')
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full transition-colors duration-300 ${
              isSpeakerOn 
                ? 'bg-indigo-500 text-white' 
                : (isLightMode ? 'bg-white shadow-md hover:bg-gray-50' : 'bg-[#1c1c1c] hover:bg-[#2a2a2a]')
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
          >
            <Phone className="w-6 h-6 rotate-45" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default AudioCall;
