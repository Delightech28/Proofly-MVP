import { Sun, BellOffIcon, LogOut, ChevronRight, Users2Icon, Settings2Icon, LanguagesIcon, HelpCircleIcon, FileTextIcon, GavelIcon } from "lucide-react";
import ProfileImage from "../assets/images/Delight.png";
function Settings(){
    return(
        <div className="min-h-screen bg-[#0e0e0e] text-white p-5">
            {/* {Header} */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-[20px] font-semibold">Settings</h2>
            </div>

            {/* {User Info} */}
            <div className="flex items-center gap-3 mb-6 bg-[#1c1c1c] rounded-xl px-4 py-3">
                <img src={ProfileImage} alt="avatar" className="w-14 h-14 rounded-full"/>
                <div>
                    <h3 className="font-semibold text-sm">Okechukwu Delight</h3>
                    <p className="text-gray-400 text-xs">@delightcodes</p>
                </div>
                {/* <ChevronRight className="w-5 h-5 text-gray-400"/> */}
            </div>

            {/* {Settings List} */}
            <div className="">
                <div className="flex justify-between items-center bg-[#1c1c1c] rounded-t-3xl px-5 py-4">
                    <div className="flex items-center gap-2">
                        <BellOffIcon className="w-5 h-5 text-gray-300"/>
                        <span className="text-sm">Pause notification</span>
                    </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked={false} className="sr-only peer" />
                                            <span className="w-11 h-6 bg-gray-700 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:bg-indigo-600 relative
                                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white">
                                            </span>
                                        </label>
                </div>
                <div className="flex justify-between items-center bg-[#1c1c1c] rounded-b-3xl px-5 py-4 mb-3">
                   <div className="flex items-center gap-2">
                    <Settings2Icon className="w-5 h-5 text-gray-300"/>
                    <span className="text-sm">General settings</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400"/>
                </div>
                
                <div className="flex justify-between items-center bg-[#1c1c1c] rounded-t-3xl px-5 py-4">
                    <div className="flex items-center gap-2">
                        <Sun className="w-5 h-5 text-gray-300"/>
                        <span className="text-sm">Light mode</span>
                    </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked={false} className="sr-only peer" />
                                            <span className="w-11 h-6 bg-gray-700 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:bg-indigo-600 relative
                                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white">
                                            </span>
                                        </label>
                </div>

                <div className="bg-[#1c1c1c] px-5 py-4 text-sm flex justify-between items-center">
                    <div className="flex items-center gap-2">
                    <LanguagesIcon className="w-5 h-5 text-gray-300"/>
                    <span>Language</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400"/>
                </div>

                <div className="bg-[#1c1c1c] rounded-b-3xl px-5 py-4 text-sm flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                    <Users2Icon className="w-5 h-5 text-gray-300"/>
                    <span>My Contact</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400"/>
                </div>
  
                <div className="bg-[#1c1c1c] rounded-t-3xl px-5 py-4 text-sm flex justify-between items-center">
                   <div className="flex items-center gap-2">
                    <HelpCircleIcon className="w-5 h-5 text-gray-300"/>
                    <span>FAQ</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400"/>
                </div>

                <div className="bg-[#1c1c1c] px-5 py-4 text-sm flex justify-between items-center">
                    <div className="flex items-center gap-2">
                    <FileTextIcon className="w-5 h-5 text-gray-300"/>
                    <span>Terms of Service</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400"/>
                </div>

                <div className="bg-[#1c1c1c] rounded-b-3xl px-5 py-4 text-sm flex justify-between items-center">
                    <div className="flex items-center gap-2">
                    <GavelIcon className="w-5 h-5 text-gray-300"/>
                    <span>User Policy</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400"/>
                </div>
            </div>

            {/* {Logout Button} */}
            <div className="mt-8">
                <button className="w-full bg-[#ffffff] py-3 text-red-500 font-medium rounded-full flex items-center justify-center gap-2">
                    <LogOut className="w-5 h-5"/>
                    Log Out
                </button>
            </div>
        </div>
    );
}

export default Settings