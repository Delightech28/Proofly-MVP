import { Camera, ArrowLeft, Edit3, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Address, Identity } from '@coinbase/onchainkit/identity';
import ProfileImage from "../assets/images/Delight.png";

function EditProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState({});
  const [formData, setFormData] = useState({
    fullName: "Okechukwu Delight",
    phone: "+234 916 385 4228",
    username: "@delightcodes"
  });

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
  
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-full cursor-pointer">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center mb-8 px-5">
        <div className="relative">
          <img
            src={ProfileImage}
            alt="avatar"
            className="w-32 h-32 rounded-full"
          />
          <div className="absolute bottom-0 right-0 bg-lime-400 p-2 rounded-full cursor-pointer">
            <Camera className="w-4 h-4 text-black" />
          </div>
        </div>
      </div>

      {/* User Information Container */}
      <div className="mx-5 mb-8">
        <div className="bg-[#1c1c1c] rounded-xl p-4 space-y-4">
          {/* Full name */}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-400">Full name</span>
            <div className="flex items-center gap-2">
              {isEditing.fullName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="bg-[#2a2a2a] text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-lime-400"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave('fullName')}
                    className="p-1 text-lime-400 hover:bg-lime-400 hover:text-black rounded transition"
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
                  <span className="text-sm text-white">{formData.fullName}</span>
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
            <span className="text-sm text-gray-400">Phone number</span>
            <div className="flex items-center gap-2">
              {isEditing.phone ? (
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-[#2a2a2a] text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-lime-400"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave('phone')}
                    className="p-1 text-lime-400 hover:bg-lime-400 hover:text-black rounded transition"
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
                  <span className="text-sm text-white">{formData.phone}</span>
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
            <span className="text-sm text-gray-400">Email</span>
            <span className="text-sm text-white">desolomon07@gmail.com</span>
          </div>
          
          {/* Username */}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-400">Username</span>
            <div className="flex items-center gap-2">
              {isEditing.username ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="bg-[#2a2a2a] text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-lime-400"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave('username')}
                    className="p-1 text-lime-400 hover:bg-lime-400 hover:text-black rounded transition"
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
                  <span className="text-sm text-white">{formData.username}</span>
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
          <div className="flex justify-between items-center py-2 border-t border-gray-700 pt-4">
            <span className="text-sm text-gray-400">Wallet Address</span>
            <Wallet>
              <ConnectWallet
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                style={{ backgroundColor: '#a3e635', color: '#111827' }}
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
        <button className="w-full bg-lime-400 text-black font-medium py-3 rounded-xl hover:bg-lime-500 transition cursor-pointer">
          Save Changes
        </button>

        {/* Delete Account Button */}
        <button className="w-full bg-[#1c1c1c] py-3 text-white font-medium rounded-xl hover:bg-[#2a2a2a] transition cursor-pointer">
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default EditProfile