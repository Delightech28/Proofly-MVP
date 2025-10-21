import { House, Search, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    {
      path: '/dashboard',
      icon: House,
      label: 'Home',
      isActive: location.pathname === '/dashboard'
    },
    {
      path: '/search',
      icon: Search,
      label: 'Search',
      isActive: location.pathname === '/search'
    },
    {
      path: '/chat',
      icon: MessageSquare,
      label: 'Chat',
      isActive: location.pathname === '/chat'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      isActive: location.pathname === '/profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 flex justify-around py-3 z-50">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
            item.isActive 
              ? 'text-lime-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <item.icon className={`w-6 h-6 ${item.isActive ? 'text-lime-400' : 'text-gray-400'}`} />
          <span className="text-xs font-medium">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default BottomNavigation;
