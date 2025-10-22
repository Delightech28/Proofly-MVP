import { Camera, ArrowLeft, Edit3, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Address, Identity } from '@coinbase/onchainkit/identity';
import ProfileImage from "../assets/images/Delight.png";

function EditProfile() {
  const navigate = useNavigate();
  const { isLightMode } = useTheme();
  const [isEditing, setIsEditing] = useState({});
  const [formData, setFormData] = useState({
    fullName: "Okechukwu Delight",
    phone: "+234 916 385 4228",
    username: "@delightcodes"
  });

  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [usernameMessage, setUsernameMessage] = useState('');

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleSave = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    // Here you would typically save to backend
    console.log(`Saved ${field}:`, formData[field]);
  };

  const handleCancel = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    // Reset to original value if needed
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextUrl = URL.createObjectURL(file);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(nextUrl);
    // TODO: upload to backend here if needed
  };

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    if (!isEditing.username) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    const candidateRaw = formData.username || '';
    const candidate = candidateRaw.replace(/^@/, '').trim().toLowerCase();

    setUsernameStatus('checking');
    setUsernameMessage('');

    const handle = setTimeout(() => {
      // simple validations
      if (candidate.length < 3) {
        setUsernameStatus('unavailable');
        setUsernameMessage('Must be at least 3 characters');
        return;
      }

      if (!/^[a-z0-9_]+$/.test(candidate)) {
        setUsernameStatus('unavailable');
        setUsernameMessage('Only lowercase letters, numbers, and underscores allowed');
        return;
      }

      // mock taken list
      const taken = ['john', 'jane', 'delightcodes'];
      if (taken.includes(candidate)) {
        setUsernameStatus('unavailable');
        setUsernameMessage('Username is already taken');
        return;
      }

      setUsernameStatus('available');
      setUsernameMessage('Available');
    }, 500);

    return () => clearTimeout(handle);
  }, [formData.username, isEditing.username]);
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isLightMode ? 'bg-gray-50 text-gray-900' : 'bg-[#0e0e0e] text-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className={`p-2 rounded-full cursor-pointer transition-colors duration-300 ${isLightMode ? 'bg-gray-200 text-gray-800' : 'bg-gray-900 text-white'}`}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center mb-8 px-5">
        <div className="relative">
          <img
            src={avatarPreviewUrl || ProfileImage}
            alt="avatar"
            className="w-32 h-32 rounded-full"
          />
          <div onClick={handleOpenFilePicker} className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer">
            <Camera className="w-4 h-4 text-black" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* User Information Container */}
      <div className="mx-5 mb-8">
        <div className={`rounded-xl p-4 space-y-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
          {/* Full name */}
          <div className="flex justify-between items-center py-2">
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Full name</span>
            <div className="flex items-center gap-2">
              {isEditing.fullName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`text-sm px-2 py-1 rounded border focus:outline-none transition-colors duration-300 ${isLightMode ? 'bg-white text-gray-900 border-gray-300 focus:border-indigo-600' : 'bg-[#2a2a2a] text-white border-gray-600 focus:border-indigo-600'}`}
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave('fullName')}
                    className="p-1 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel('fullName')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{formData.fullName}</span>
                  <button
                    onClick={() => handleEdit('fullName')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Phone number */}
          <div className="flex justify-between items-center py-2">
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Phone number</span>
            <div className="flex items-center gap-2">
              {isEditing.phone ? (
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`text-sm px-2 py-1 rounded border focus:outline-none transition-colors duration-300 ${isLightMode ? 'bg-white text-gray-900 border-gray-300 focus:border-indigo-600' : 'bg-[#2a2a2a] text-white border-gray-600 focus:border-indigo-600'}`}
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave('phone')}
                    className="p-1 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel('phone')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{formData.phone}</span>
                  <button
                    onClick={() => handleEdit('phone')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Email */}
          <div className="flex justify-between items-center py-2">
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Email</span>
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>desolomon07@gmail.com</span>
          </div>
          
          {/* Username */}
          <div className="flex justify-between items-center py-2">
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Username</span>
            <div className="flex items-center gap-2">
              {isEditing.username ? (
                <div className="flex items-start gap-2">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`text-sm px-2 py-1 rounded border focus:outline-none transition-colors duration-300 ${isLightMode ? 'bg-white text-gray-900 border-gray-300 focus:border-indigo-600' : 'bg-[#2a2a2a] text-white border-gray-600 focus:border-indigo-600'}`}
                      autoFocus
                    />
                    <span className={`mt-1 text-xs ${usernameStatus === 'checking' ? (isLightMode ? 'text-gray-500' : 'text-gray-400') : usernameStatus === 'available' ? 'text-indigo-600' : 'text-red-500'}`}>
                      {usernameStatus === 'idle' ? '' : usernameStatus === 'checking' ? 'Checking availability…' : usernameMessage}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSave('username')}
                    disabled={usernameStatus !== 'available'}
                    className={`p-1 rounded transition ${usernameStatus !== 'available' ? 'opacity-50 cursor-not-allowed text-indigo-600' : 'text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel('username')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{formData.username}</span>
                  <button
                    onClick={() => handleEdit('username')}
                    className="p-1 text-gray-400 hover:bg-gray-600 rounded transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Wallet Connection */}
          <div className={`flex justify-between items-center py-2 pt-4 ${isLightMode ? 'border-t border-gray-200' : 'border-t border-gray-700'}`}>
            <span className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Wallet Address</span>
            <Wallet>
              <ConnectWallet
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${isLightMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity hasCopyAddressOnClick>
                  <Address />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 space-y-4">
        {/* Save Changes Button */}
        <button className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition cursor-pointer">
          Save Changes
        </button>

        {/* Delete Account Button */}
        <button className={`w-full py-3 font-medium rounded-xl transition cursor-pointer ${isLightMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default EditProfile