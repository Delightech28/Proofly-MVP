import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useFirebase from '../hooks/useFirebase'
import Google from "../assets/images/Google.png";
import X from "../assets/images/X.png";
import useToast from '../hooks/useToast'

function Auth(){
    const [isLogin, setIsLogin] = useState(true);
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')

    const { signUp, signIn } = useFirebase()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(e){
    e.preventDefault()
                setIsSubmitting(true)
                try {
                    if(isLogin){
                        await signIn(email, password)
                        showToast({ title: 'Signed in', description: `Welcome back, ${email}`, variant: 'success' })
                        // redirect to dashboard after successful login
                        navigate('/dashboard')
                    } else {
                            if(password !== confirm){
                                    showToast({ title: 'Password mismatch', description: 'Please make sure your passwords match', variant: 'error' })
                                    return
                            }
                            const displayName = `${firstName} ${lastName}`.trim()
                            await signUp(email, password, { displayName, firstName, lastName })
                            showToast({ title: 'Account created', description: 'Your account was created successfully.', variant: 'success' })
                            // redirect user to verification page after signup
                            navigate('/verify')
                            // clear sensitive fields
                            setPassword('')
                            setConfirm('')
                    }
                } catch (err) {
                            const raw = err?.code || err?.message || String(err)
                            // map a few common Firebase auth codes to friendly messages
                            const code = err?.code || ''
                                    const friendly = (() => {
                                        if (code.includes('missing-password') || /missing-password/i.test(raw)) return 'Password is required.'
                                        if (code.includes('invalid-email') || /invalid email/i.test(raw)) return 'Please enter a valid email address.'
                                        if (code.includes('weak-password') || /weak-password/i.test(raw)) return 'Password is too weak; use at least 6 characters.'
                                        if (code.includes('user-not-found')) return 'No account found for that email.'
                                        if (code.includes('wrong-password')) return 'Incorrect password. Please try again.'
                                        if (code.includes('invalid-credential') || /invalid credential/i.test(raw) || /invalid-credentials/i.test(raw)) return 'Invalid credentials. Please check your email and password.'
                                        if (code.includes('email-already') || /already-in-use/i.test(raw) || /email.*in.*use/i.test(raw)) return 'An account with that email already exists.'
                                        return err?.message || String(err)
                                    })()
                            // professional toast
                            showToast({ title: 'Authentication error', description: friendly, variant: 'error', duration: 7000 })
                }
                finally {
                    setIsSubmitting(false)
                }
    }

    return(
        <div className='w-full h-[100dvh] min-h-[100dvh] flex items-center justify-center bg-indigo-600 px-4'>
            <div className='w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl'>
                <div className='mb-6'>
                    {isLogin ? (
                        <>
                        <h2 className='text-xl font-semibold text-gray-900'>Welcome back! Sign in to your account</h2>
                        <p className='text-sm text-gray-500 mt-1'>Sign in to access your account and continue your workflow.</p>
                        </>
                    ) : (
                        <>
                        <h2 className='text-xl font-semibold text-gray-900'>Sign up now to access your personal account</h2>
                        <p className='text-sm text-gray-500 mt-1'>Create your account and simplify your workflow instantly.</p>
                        </>
                    )}
                </div>

                <div className='flex mb-6 border border-gray-200 rounded-xl overflow-hidden'>
                    <button onClick={() => setIsLogin(true)} className={`w-1/2 py-2 text-sm font-semibold transition-all cursor-pointer ${isLogin ? "bg-indigo-600 text-white" : "bg-transparent text-gray-600"}`}>
                        Login
                    </button>
                    <button onClick={() => setIsLogin(false)} className={`w-1/2 py-2 text-sm font-semibold transition-all cursor-pointer ${!isLogin ? "bg-indigo-600 text-white" : "bg-transparent text-gray-600"}`}>
                        Sign Up
                    </button>
                </div>

                <form className='space-y-4' onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className='flex gap-2'>
                            <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} type="text" placeholder='First Name' className='w-1/2 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600'/>
                            <input value={lastName} onChange={(e)=>setLastName(e.target.value)} type="text" placeholder='Last Name' className='w-1/2 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600'/>
                        </div>
                    )}
                    <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder='Email' className='w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600'/>
                    <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder='Password' className='w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600'/>
                    {!isLogin && (
                        <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" placeholder='Confirm Password' className='w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600'/>
                    )}
                    <button type='submit' disabled={isSubmitting} className={`w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}>
                        {isSubmitting ? (isLogin ? 'Signing in...' : 'Registering...') : (isLogin ? 'Login' : 'Register')}
                    </button>

                    {isLogin && (
                        <div className='flex justify-between text-sm text-gray-600'>
                            <label className='flex items-center space-x-2'>
                                <input type="checkbox" className='accent-purple-600'/> <span className='mx-1'> Remember Me</span>
                            </label>
                            <button type='button' className='text-indigo-600 font-medium cursor-pointer'>
                                Forget Password?
                            </button>
                        </div>
                    )}
                </form>
                        {isLogin && (
                        <div className='flex items-center gap-2 my-6'>
                                <div className='h-px flex-1 bg-gray-200'></div>
                                <span className='text-xs text-gray-500'>or login with</span>
                                    <div className='h-px flex-1 bg-gray-200'></div>
                        </div>
                         )}
             {!isLogin && (
                <div className='flex items-center gap-2 my-6'>
                <div className='h-px flex-1 bg-gray-200'></div>
                <span className='text-xs text-gray-500'>or sign up with</span>
                  <div className='h-px flex-1 bg-gray-200'></div>
            </div>
             )}

              {isLogin && (
            <div className='flex gap-3'>
                <button onClick={() => showToast({ title: "Not a vailable", description: "Social sign-in isn't working right now.", variant: 'error' })} className='flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer'>
                    <img src={Google} alt="google" className='w-5 h-5 cursor-pointer'/>Google
                </button>
                 <button onClick={() => showToast({ title: "Not available", description: "Social sign-in isn't working right now.", variant: 'error' })} className='flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer'>
                    <img src={X} alt="facebook" className='w-5 h-5 cursor-pointer'/>X (Twitter)
                </button>
            </div>
           )}
             {!isLogin && (
                <div className='flex gap-3'>
                    <button onClick={() => showToast({ title: "Not available", description: "Social sign-in isn't working right now.", variant: 'error' })} className='flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer'>
                        <img src={Google} alt="google" className='w-5 h-5 cursor-pointer'/>Google
                    </button>
                    <button onClick={() => showToast({ title: "Not available", description: "Social sign-in isn't working right now.", variant: 'error' })} className='flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer'>
                        <img src={X} alt="facebook" className='w-5 h-5 cursor-pointer'/>X (Twitter)
                    </button>
                </div>
             )}
        </div>
      </div>
    );
}

export default Auth