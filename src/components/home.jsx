import { Link } from 'react-router-dom'

function Home(){
    return(
        <div className="bg-[#0F172A] w-full h-screen flex flex-col items-center justify-center relative ">
            <h1 className="font-extrabold text-8xl text-[#8B5CF6] mt-[-100px]">Proofly</h1>

            <p className="text-white text-2xl font-san absolute bottom-25 text-center left-0 right-0">Earn from every action.</p>
            <Link to="/auth" className="bg-[#7554A1] absolute bottom-6 text-white h-[50px] w-75 cursor-pointer rounded-md text-center flex items-center justify-center">
               Get Started
            </Link>
        </div>
    )
}

export default Home 