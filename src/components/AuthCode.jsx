import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion";
import CheckMark from "../assets/images/checkmark.svg"
function AuthCode(){
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [showModal, setShowModal] = useState(false);
    const inputs = useRef([]);

    const handleChange = (value, index) => {
        if (isNaN(value)) return; //Only numbers
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        //Move to next input automatically
        if (value && index < 5){
            inputs.current[index + 1].focus();
        }
    };

    const handleVerify = () => {
        setShowModal(true);
    }

    const handlekeyDown = (e, index) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };
    return(
        <div className="min-h-screen flex items-center justify-center bg-[#f3f4fa] px-4">
            <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-xl text-center">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-10 h-10 flex item-center justify-center rounded-full bg-indigo-100 mb-2">
                        <img src={CheckMark} alt="Check Mark" className="w-8 h-8 mt-1"/>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Authentication</h2>
                    <p className="text-sm text-gray-500">Enter the code we sent you on your Gmail App</p>
                </div>

                <div className="flex justify-center gap-3 mb-6">
                    {code.map((digit, index) => (
                        <input type="text" 
                        key={index}
                        maxLength={1}
                        value={digit}
                        ref={(el) => (inputs.current[index] = el)}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handlekeyDown(e, index)}
                        className="w-12 h-12 text-center text-xl font-semibold  border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"/>
                  ) )}
                </div>
                <p className="text-sm text-gray-500 mb-4">Didn't get the code?{" "}
                <button className="text-indigo-600 font-medium hover:underline cursor-pointer">Resend code</button>
                </p>

                <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition cursor-pointer" onClick={handleVerify}>
                    Verify account
                </button>

                <p className="mt-5 text-sm text-gray-500">
                    Can't access your Gmail App?{" "}
                <button className="text-indigo-600 hover:underline cursor-pointer">Contact Support</button>
                </p>
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-2xl p-8 text-center z-20">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-indigo-100 flex items-center justify-center rounded-full mb-4">
                                <img src={CheckMark} alt="Check Mark" className="w-14 h-14"/>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Completed</h3>
                            <p className="text-sm text-gray-500 mb-5">Your account has been successfully verified.</p>
                            <button onClick={() => setShowModal(false)} className="bg-indigo-600 text-white py-3 px-8 rounded-xl font-medium hover:bg-indigo-300 transition cursor-pointer">
                                Continue
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AuthCode