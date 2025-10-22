import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Phone, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Users, MoreVertical, Maximize2, Minimize2 } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

function VideoCall() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLightMode } = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
          <h2 className="text-lg font-semibold">Video Call</h2>
          <p className={`text-xs transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {isConnected ? formatDuration(callDuration) : 'Connecting...'}
          </p>
        </div>

        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Video Call Interface */}
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video (Contact's Video) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isConnected ? (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto ${
                    contactId === 0 
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                      : (isLightMode ? 'bg-gray-100' : 'bg-[#2a2a2a]')
                  }`}>
                    {contactId === 0 ? (
                      <span className="text-white font-bold text-2xl">AI</span>
                    ) : (
                      <Users className="w-12 h-12 text-indigo-600" />
                    )}
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">{contactName}</h3>
                  <p className="text-gray-300 text-sm">
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">{contactName}</h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300 text-sm">Connecting...</span>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (Your Video) - Picture in Picture */}
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-1 mx-auto">
                  <span className="text-white text-xs font-bold">You</span>
                </div>
                <p className="text-white text-xs">You</p>
              </div>
            </div>
            {!isVideoOn && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Call Status Overlay */}
          {!isConnected && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-black/50 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">Connecting to video call...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call Controls - Fixed at bottom */}
        <div className={`px-4 py-6 border-t transition-colors duration-300 ${isLightMode ? 'border-gray-200 bg-white' : 'border-gray-800 bg-[#1c1c1c]'} sticky bottom-0`}>
          <div className="flex items-center justify-center gap-6">
            {/* Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-colors duration-300 ${
                isMuted 
                  ? 'bg-red-500 text-white' 
                  : (isLightMode ? 'bg-white shadow-md hover:bg-gray-50' : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]')
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Video Toggle Button */}
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-colors duration-300 ${
                !isVideoOn 
                  ? 'bg-red-500 text-white' 
                  : (isLightMode ? 'bg-white shadow-md hover:bg-gray-50' : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]')
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-4 rounded-full transition-colors duration-300 ${
                isSpeakerOn 
                  ? 'bg-indigo-500 text-white' 
                  : (isLightMode ? 'bg-white shadow-md hover:bg-gray-50' : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]')
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-4 rounded-full transition-colors duration-300 ${
                isLightMode ? 'bg-white shadow-md hover:bg-gray-50' : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
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
    </div>
  );
}

export default VideoCall;
