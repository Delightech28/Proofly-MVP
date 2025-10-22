import { useState } from 'react'
import Google from "../assets/images/Google.png";
import X from "../assets/images/X.png";
function Auth(){
    const [isLogin, setIsLogin] = useState(true);
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
            <form className='space-y-4'>
                {!isLogin && (
                    <div className='flex gap-2'>
                        <input type="text" placeholder='First Name' className='w-1/2 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600'/>
                          <input type="text" placeholder='Last Name' className='w-1/2 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600'/>
                    </div>
                )}
                  <input type="email" placeholder='Email' className='w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600'/>
                  <input type="password" placeholder='Password' className='w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600'/>
                  {!isLogin && (
                    <input type="password" placeholder='Confirm Password' className='w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600'/>
                  )}
                  <button type='button' className='w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 cursor-pointer'>
                    {isLogin ? "Login" : "Register"}
                  </button>
                {isLogin && (
                    <div className='flex justify-between text-sm text-gray-600'>
                        <label className='flex items-center spaxe-x-2'>
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
                <button className='flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer'>
                    <img src={Google} alt="google" className='w-5 h-5 cursor-pointer'/>Google
                </button>
                 <button className='flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer'>
                    <img src={X} alt="facebook" className='w-5 h-5 cursor-pointer'/>X (Twitter)
                </button>
            </div>
           )}
             {!isLogin && (
                <div className='flex gap-3'>
                    <button className='flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer'>
                        <img src={Google} alt="google" className='w-5 h-5 cursor-pointer'/>Google
                    </button>
                    <button className='flex-1 border border-gray-300 rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer'>
                        <img src={X} alt="facebook" className='w-5 h-5 cursor-pointer'/>X (Twitter)
                    </button>
                </div>
             )}
        </div>
      </div>
    );
}

export default Auth