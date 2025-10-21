import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, BellOffIcon, LogOut, ChevronRight, Users2Icon, Settings2Icon, LanguagesIcon, HelpCircleIcon, FileTextIcon, GavelIcon, ArrowLeft } from "lucide-react";
import ProfileImage from "../assets/images/Delight.png";
import { useTheme } from "../contexts/ThemeContext";
function Settings(){
    const { isLightMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    return(
        <div className={`min-h-screen transition-colors duration-300 ${isLightMode ? 'bg-gray-50 text-gray-900' : 'bg-[#0e0e0e] text-white'}`}>
            {/* {Header} */}
            <div className="flex items-center justify-between px-5 pt-5 pb-6">
                <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-full cursor-pointer">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <h2 className="text-[20px] font-semibold">Settings</h2>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* {User Info} */}
            <div className="px-5">
                <button 
                    onClick={() => navigate('/edit-profile')}
                    className={`w-full flex items-center gap-3 mb-6 rounded-xl px-4 py-3 transition-colors duration-300 hover:opacity-80 cursor-pointer ${isLightMode ? 'bg-white shadow-md hover:shadow-lg' : 'bg-[#1c1c1c] hover:bg-[#2a2a2a]'}`}
                >
                <img src={ProfileImage} alt="avatar" className="w-14 h-14 rounded-full"/>
                <div className="flex-1 text-left">
                    <h3 className="font-semibold text-sm">Okechukwu Delight</h3>
                    <p className="text-gray-400 text-xs">@delightcodes</p>
                </div>
                <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}/>
                </button>
            </div>

            {/* {Settings List} */}
            <div className="px-5">
                <div className={`flex justify-between items-center rounded-t-3xl px-5 py-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
                    <div className="flex items-center gap-2">
                        <BellOffIcon className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}/>
                        <span className="text-sm">Pause notification</span>
                    </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked={false} className="sr-only peer" />
                                            <span className="w-11 h-6 bg-gray-700 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:bg-indigo-600 relative
                                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white">
                                            </span>
                                        </label>
                </div>
                <div className={`flex justify-between items-center rounded-b-3xl px-5 py-4 mb-3 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
                   <div className="flex items-center gap-2">
                    <Settings2Icon className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}/>
                    <span className="text-sm">General settings</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}/>
                </div>
                
                <div className={`flex justify-between items-center rounded-t-3xl px-5 py-4 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
                    <div className="flex items-center gap-2">
                        <Sun className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-yellow-500' : 'text-gray-300'}`}/>
                        <span className="text-sm">Light mode</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isLightMode} 
                            onChange={toggleTheme}
                            className="sr-only peer" 
                        />
                        <span className="w-11 h-6 bg-gray-700 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:bg-indigo-600 relative
                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white">
                        </span>
                    </label>
                </div>

                <div className={`px-5 py-4 text-sm flex justify-between items-center transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
                    <div className="flex items-center gap-2">
                    <LanguagesIcon className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}/>
                    <span>Language</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}/>
                </div>

                <div className={`rounded-b-3xl px-5 py-4 text-sm flex justify-between items-center mb-3 transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
                    <div className="flex items-center gap-2">
                    <Users2Icon className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}/>
                    <span>My Contact</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}/>
                </div>
  
                <div className={`rounded-t-3xl px-5 py-4 text-sm flex justify-between items-center transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
                   <div className="flex items-center gap-2">
                    <HelpCircleIcon className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}/>
                    <span>FAQ</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}/>
                </div>

                <div className={`px-5 py-4 text-sm flex justify-between items-center transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
                    <div className="flex items-center gap-2">
                    <FileTextIcon className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}/>
                    <span>Terms of Service</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}/>
                </div>

                <div className={`rounded-b-3xl px-5 py-4 text-sm flex justify-between items-center transition-colors duration-300 ${isLightMode ? 'bg-white shadow-sm' : 'bg-[#1c1c1c]'}`}>
                    <div className="flex items-center gap-2">
                    <GavelIcon className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}/>
                    <span>User Policy</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}/>
                </div>
            </div>

            {/* {Logout Button} */}
            <div className="px-5 mt-8">
                <button className={`w-full py-3 font-medium rounded-full flex items-center justify-center gap-2 transition-colors duration-300 ${isLightMode ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#ffffff] text-red-500'}`}>
                    <LogOut className="w-5 h-5"/>
                    Log Out
                </button>
            </div>
        </div>
    );
}

export default Settings