import { useState, useRef, useEffect } from "react"
import useFirebase from '../hooks/useFirebase'
import useToast from '../hooks/useToast'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import sha256Hex from '../lib/sha256'
import { db } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from "framer-motion";
import CheckMark from "../assets/images/checkmark.svg"
function AuthCode(){
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [showModal, setShowModal] = useState(false);
    const inputs = useRef([]);
    const [shake, setShake] = useState(false);
    const [resendSeconds, setResendSeconds] = useState(0);
    const resendTimerRef = useRef(null);
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        return () => {
            if (resendTimerRef.current) {
                clearInterval(resendTimerRef.current)
                resendTimerRef.current = null
            }
        }
    }, [])

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

        const { user } = useFirebase()
        const { showToast } = useToast()
        const navigate = useNavigate()

        // use shared sha256 helper (falls back to JS impl if WebCrypto unavailable)

        const handleVerify = async () => {
                setIsVerifying(true)
                // build code
                const entered = code.join('')
                if (entered.length !== 6) {
                    showToast({ title: 'Invalid code', description: 'Please enter the 6-digit verification code.', variant: 'error' })
                    // clear inputs, trigger shake and focus the first digit so the user can re-enter quickly
                    try {
                        setCode(["", "", "", "", "", ""])
                        setShake(true)
                        setTimeout(() => setShake(false), 550)
                        setTimeout(() => inputs.current[0]?.focus(), 60)
                    } catch { /* ignore */ }
                    setIsVerifying(false)
                    return
                }
                if (!user?.uid) {
                    showToast({ title: 'Not signed in', description: 'Please sign in or complete signup first.', variant: 'error' })
                    setIsVerifying(false)
                    return
                }
                try {
                    const udoc = await getDoc(doc(db, 'users', user.uid))
                    if (!udoc.exists()) throw new Error('Profile not found')
                    const data = udoc.data()
                    if (data?.is_verified) {
                        showToast({ title: 'Already verified', description: 'Your account is already verified.', variant: 'info' })
                        navigate('/')
                        setIsVerifying(false)
                        return
                    }
                    const now = Date.now()
                    if (!data?.verification_code_hash || !data?.verification_expires) throw new Error('No verification code found. Please resend.')
                    if (now > data.verification_expires) throw new Error('Verification code has expired. Please resend a new code.')
                    const enteredHash = await sha256Hex(entered)
                    if (enteredHash !== data.verification_code_hash) {
                        showToast({ title: 'Invalid code', description: 'The code you entered is incorrect. Please check your email and try again.', variant: 'error' })
                        // clear inputs, trigger shake and focus the first digit so the user can retry quickly
                        try {
                            setCode(["", "", "", "", "", ""])
                            setShake(true)
                            setTimeout(() => setShake(false), 550)
                            setTimeout(() => inputs.current[0]?.focus(), 60)
                        } catch { /* ignore */ }
                        setIsVerifying(false)
                        return
                    }
                    // mark verified
                    await updateDoc(doc(db, 'users', user.uid), { is_verified: true, verification_code_hash: null, verification_expires: null })
                    setShowModal(true)
                } catch (e) {
                    showToast({ title: 'Verification error', description: e?.message || String(e), variant: 'error' })
                } finally {
                    setIsVerifying(false)
                }
        }

    // Resend handler with 60s cooldown
    const handleResend = async () => {
        if (resendSeconds > 0 || isResending) return
        setIsResending(true)
        try {
            if (!user?.uid) throw new Error('Not signed in')
            const newCode = Math.floor(100000 + Math.random() * 900000).toString()
            const hashHex = await sha256Hex(newCode)
            const expiresAt = Date.now() + 1000 * 60 * 15
            await updateDoc(doc(db, 'users', user.uid), { verification_code_hash: hashHex, verification_expires: expiresAt })
            // attempt to trigger EmailJS send by calling EmailJS REST API (configuration via env vars in FirebaseContext signUp)
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            if (serviceId && templateId && publicKey) {
                await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service_id: serviceId,
                        template_id: templateId,
                        user_id: publicKey,
                        template_params: { to_email: user.email, code: newCode }
                    })
                })
            }
            showToast({ title: 'Code resent', description: 'A new verification code was sent to your email.', variant: 'success' })

            // start 60s cooldown
            setResendSeconds(60)
            resendTimerRef.current = setInterval(() => {
                setResendSeconds((s) => {
                    if (s <= 1) {
                        clearInterval(resendTimerRef.current)
                        resendTimerRef.current = null
                        return 0
                    }
                    return s - 1
                })
            }, 1000)
        } catch (e) {
            showToast({ title: 'Resend failed', description: e?.message || String(e), variant: 'error' })
        } finally {
            setIsResending(false)
        }
    }

    const handleContinue = () => {
        setIsRedirecting(true)
        setShowModal(false)
        navigate('/dashboard')
    }

    const handlekeyDown = (e, index) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };
    return(
        <div className="w-full h-[100dvh] min-h-[100dvh] flex items-center justify-center bg-[#f3f4fa] px-4">
            <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-xl text-center">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-10 h-10 flex item-center justify-center rounded-full bg-indigo-100 mb-2">
                        <img src={CheckMark} alt="Check Mark" className="w-8 h-8 mt-1"/>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Authentication</h2>
                    <p className="text-sm text-gray-500">Enter the code we sent you on your Gmail App</p>
                </div>

                                <motion.div className="flex justify-center gap-3 mb-6" animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }} transition={{ duration: 0.55 }}>
                                        {code.map((digit, index) => (
                                                <input type="text" 
                                                key={index}
                                                maxLength={1}
                                                value={digit}
                                                ref={(el) => (inputs.current[index] = el)}
                                                onChange={(e) => handleChange(e.target.value, index)}
                                                inputMode="numeric" pattern="[0-9]*" autoComplete="one-time-code"
                                                onKeyDown={(e) => handlekeyDown(e, index)}
                                                className="w-12 h-12 text-center text-xl font-semibold  border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"/>
                                    ) )}
                                </motion.div>
                <p className="text-sm text-gray-500 mb-4">Didn't get the code?{' '}
                    <button
                        onClick={handleResend}
                        disabled={resendSeconds > 0 || isResending}
                        className={`text-indigo-600 font-medium hover:underline ${resendSeconds > 0 || isResending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {isResending ? 'Resending...' : (resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend code')}
                    </button>
                </p>

                <button disabled={isVerifying} className={`w-full bg-indigo-600 text-white py-3 rounded-xl font-medium ${isVerifying ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-700 cursor-pointer'}`} onClick={handleVerify}>
                    {isVerifying ? 'Verifying...' : 'Verify account'}
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
                            <button onClick={handleContinue} disabled={isRedirecting} className={`bg-indigo-600 text-white py-3 px-8 rounded-xl font-medium ${isRedirecting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-300 cursor-pointer'} `}>
                                {isRedirecting ? 'Redirecting...' : 'Continue'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AuthCode