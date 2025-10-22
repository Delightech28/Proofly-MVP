import { Link } from 'react-router-dom'
import Mascot from '../assets/images/mascot.png'

function Home(){
    return(
        <div className="w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-indigo-600 flex flex-col items-center justify-between px-6 pt-8 pb-[calc(env(safe-area-inset-bottom)+16px)] font-sans relative">
            {/* Top spacer (status bar area feel) */}
            <div className="h-6" />

            {/* Content */}
            <div className="w-full flex-1 flex flex-col items-center justify-start gap-6 mt-4">
                <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-center max-w-sm">
                    Earn from every actions
                </h1>

                {/* Illustration: Mascot image (no background, larger) */}
                <div className="w-100 h-100 flex items-center justify-center">
                    <img src={Mascot} alt="Mascot" className="w-full h-full object-contain" />
                </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col items-center">
                <Link 
                    to="/auth" 
                    className="w-full max-w-sm h-12 bg-white text-gray-900 font-semibold rounded-2xl flex items-center justify-center shadow-md"
                >
                    Get started
                </Link>
            </div>
        </div>
    )
}

export default Home