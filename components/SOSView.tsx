
import React, { useEffect, useState } from 'react';
import { FloodIcon } from './icons/FloodIcon';
import { LandslideIcon } from './icons/LandslideIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { LocationIcon } from './icons/LocationIcon';
import { SOSIcon } from './icons/SOSIcon';
import { authorities, Authority } from '../authorities';
import { findNearestAuthority } from '../services/locationUtils';

interface SOSViewProps {
  onClose: () => void;
}

const SOSView: React.FC<SOSViewProps> = ({ onClose }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestAuthority, setNearestAuthority] = useState<Authority | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          setNearestAuthority(findNearestAuthority(lat, lng));
        },
        (err) => {
          console.warn("SOS GPS Error:", err);
          // Retry with low accuracy if high accuracy fails
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              setLocation({ lat, lng });
              setNearestAuthority(findNearestAuthority(lat, lng));
            },
            (retryErr) => {
               setError("Không thể lấy vị trí. Vui lòng bật GPS.");
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setError("Trình duyệt không hỗ trợ định vị.");
    }
  }, []);

  // Hàm tạo link SMS cho offline mode
  const getSMSLink = (type: string) => {
    const phone = nearestAuthority ? nearestAuthority.phone : "0347885360"; // Mặc định nếu không tìm thấy
    const locStr = location ? `${location.lat.toFixed(5)},${location.lng.toFixed(5)}` : "Khong xac dinh";
    const body = `SOS: Toi dang gap nguy hiem boi ${type} tai toa do ${locStr}. Can ho tro gap!`;
    // Sử dụng giao thức sms: để mở ứng dụng tin nhắn native
    return `sms:${phone}?body=${encodeURIComponent(body)}`;
  };
  
  const getCallLink = () => `tel:112`; // Số cứu nạn cứu hộ

  return (
    <div className="fixed inset-0 bg-red-600 z-50 flex flex-col text-white overflow-y-auto">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 animate-pulse">
            <SOSIcon className="w-10 h-10 text-white" />
            <h1 className="text-3xl font-black tracking-wider">KHẨN CẤP / SOS</h1>
        </div>
        <button 
            onClick={onClose}
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
        >
            <XMarkIcon className="w-8 h-8" />
        </button>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6 space-y-8 text-center">
        
        {/* Trạng thái vị trí & Ban quản lý gần nhất */}
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/20 px-6 py-4 rounded-2xl flex items-center space-x-3">
                <LocationIcon className="w-8 h-8 text-blue-300" />
                <div className="text-left">
                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Tọa độ của bạn</p>
                    {location ? (
                        <p className="font-mono text-lg font-bold">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
                    ) : (
                        <p className="font-bold text-red-200 text-sm">{error || "Đang định vị..."}</p>
                    )}
                </div>
            </div>

            <div className="bg-white/10 px-6 py-4 rounded-2xl flex items-center space-x-3 border border-white/10">
                <div className="p-2 bg-brand-500 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="text-left">
                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Ban quản lý gần nhất</p>
                    {nearestAuthority ? (
                        <>
                            <p className="font-bold text-lg leading-tight">{nearestAuthority.name}</p>
                            <p className="text-sm font-mono text-brand-200">{nearestAuthority.phone}</p>
                        </>
                    ) : (
                        <p className="italic text-sm opacity-60">Đang tìm kiếm...</p>
                    )}
                </div>
            </div>
        </div>

        <p className="text-lg font-medium max-w-md">
            Sử dụng tính năng này khi bạn gặp nguy hiểm hoặc mất kết nối Internet. Hệ thống sẽ chuyển sang gửi tin nhắn SMS/Gọi điện thoại.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            <a 
                href={getSMSLink("NGAP LUT")}
                className="bg-white text-red-600 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center hover:scale-105 transition-transform active:scale-95"
            >
                <FloodIcon className="w-20 h-20 mb-4" />
                <span className="text-2xl font-black uppercase">Báo tin Ngập lụt</span>
                <span className="text-sm mt-2 text-gray-500 font-semibold">(Gửi SMS tọa độ)</span>
            </a>

            <a 
                href={getSMSLink("SAT LO DAT")}
                className="bg-white text-red-600 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center hover:scale-105 transition-transform active:scale-95"
            >
                <LandslideIcon className="w-20 h-20 mb-4" />
                <span className="text-2xl font-black uppercase">Báo tin Sạt lở</span>
                <span className="text-sm mt-2 text-gray-500 font-semibold">(Gửi SMS tọa độ)</span>
            </a>
        </div>
        
        <div className="w-full max-w-2xl pt-8 border-t border-white/30 mt-4">
             <a 
                href={getCallLink()}
                className="w-full bg-yellow-400 text-red-900 rounded-2xl p-6 font-bold text-2xl shadow-lg flex items-center justify-center space-x-3 hover:bg-yellow-300 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5z" clipRule="evenodd" />
                </svg>
                <span>GỌI KHẨN CẤP 112</span>
            </a>
        </div>
      </div>
      
      <div className="p-4 text-center text-white/70 text-sm">
        DA NANG GREEN Emergency System
      </div>
    </div>
  );
};

export default SOSView;
