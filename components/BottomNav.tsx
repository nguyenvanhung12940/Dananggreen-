
import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { MapIcon } from './icons/MapIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { SOSIcon } from './icons/SOSIcon';
import { UserIcon } from './icons/UserIcon';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: any) => void;
  isLoggedIn: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, isLoggedIn }) => {
  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: <HomeIcon className="w-6 h-6" /> },
    { id: 'map', label: 'Sự cố', icon: <MapIcon className="w-6 h-6" /> },
    { id: 'environmentalMap', label: 'Bản đồ Xanh', icon: <GlobeIcon className="w-6 h-6" /> },
    { id: 'sos', label: 'SOS', icon: <SOSIcon className="w-6 h-6" /> },
    { id: isLoggedIn ? 'dashboard' : 'login', label: isLoggedIn ? 'Cá nhân' : 'Đăng nhập', icon: <UserIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1 z-[1000] flex justify-around items-center safe-area-bottom">
      {navItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 ${
              isActive ? 'text-teal-600' : 'text-gray-400'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-teal-50' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-teal-700' : 'text-gray-500'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
