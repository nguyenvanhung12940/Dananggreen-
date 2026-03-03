
import React, { useState, useCallback, useEffect } from 'react';
import * as L from 'leaflet';
import { analyzeEnvironmentalImage, askAIAboutEnvironment } from './services/geminiService';
import { saveOfflineReport, getOfflineReports, deleteOfflineReport, compressImage } from './services/offlineService';
import { EnvironmentalReport, AIAnalysis, ReportStatus, ChatMessage, ToastMessage, EducationalTopic, EnvironmentalPOI } from './types';
import MainMapView from './components/MainMapView';
import ReportForm from './components/ReportForm';
import ReportDetailModal from './components/ReportDetailModal';
import HomeView from './components/HomeView';
import ThankYouView from './components/ThankYouView';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import ToastContainer from './components/ToastContainer';
import { LogoIcon } from './components/icons/LogoIcon';
import { TrophyIcon } from './components/icons/TrophyIcon';
import EducationDetailModal from './components/EducationDetailModal';
import EnvironmentalMapView from './components/EnvironmentalMapView';
import SOSView from './components/SOSView';
import OfflineReportsModal from './components/OfflineReportsModal';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import BottomNav from './components/BottomNav';
import { SOSIcon } from './components/icons/SOSIcon';
import { CloudIcon } from './components/icons/CloudIcon';

// Dữ liệu mẫu tĩnh (Static Data) - Chỉ dùng để hiển thị khi người dùng chưa nhập gì
const initialReports: EnvironmentalReport[] = [
  {
    id: 'rep-static-1',
    mediaUrl: 'https://picsum.photos/seed/trash1/800/600',
    mediaType: 'image',
    latitude: 16.047,
    longitude: 108.220,
    userDescription: 'Rác thải nhựa tràn lan tại vỉa hè đường Bạch Đằng.',
    description: 'Phát hiện rác thải nhựa tập trung nhiều tại khu vực công cộng.',
    status: 'Báo cáo mới',
    timestamp: new Date(),
    area: 'Hải Châu',
    aiAnalysis: {
      issueType: 'Xả rác không đúng nơi quy định',
      description: 'Rác thải nhựa tập trung nhiều tại khu vực công cộng.',
      priority: 'Trung bình',
      solution: 'Cần đội vệ sinh môi trường thu gom trong ngày.',
      isIssuePresent: true
    }
  },
  {
    id: 'rep-static-2',
    mediaUrl: 'https://picsum.photos/seed/flood1/800/600',
    mediaType: 'image',
    latitude: 15.986,
    longitude: 108.067,
    userDescription: 'Nước dâng cao gây ngập úng cục bộ tại các tuyến đường liên thôn.',
    description: 'Tình trạng ngập lụt do mưa lớn kéo dài.',
    status: 'Đang xử lý',
    timestamp: new Date(),
    area: 'Hòa Vang',
    aiAnalysis: {
      issueType: 'Ngập lụt',
      description: 'Tình trạng ngập lụt do mưa lớn kéo dài.',
      priority: 'Cao',
      solution: 'Cảnh báo người dân và chuẩn bị phương án di dời nếu cần.',
      isIssuePresent: true
    }
  },
  {
    id: 'rep-static-3',
    mediaUrl: 'https://picsum.photos/seed/landslide1/800/600',
    mediaType: 'image',
    latitude: 15.567,
    longitude: 108.483,
    userDescription: 'Sạt lở đất tại khu vực đồi núi gần khu dân cư.',
    description: 'Sạt lở đất đá sau bão, gây nguy hiểm cho giao thông.',
    status: 'Đã xử lý',
    timestamp: new Date(),
    area: 'Tam Kỳ',
    aiAnalysis: {
      issueType: 'Sạt lở đất',
      description: 'Sạt lở đất đá sau bão, gây nguy hiểm cho giao thông.',
      priority: 'Cao',
      solution: 'Đã dọn dẹp hiện trường và gia cố taluy.',
      isIssuePresent: true
    }
  }
];

// Dữ liệu các điểm môi trường quan trọng (POIs)
const environmentalPOIs: EnvironmentalPOI[] = [
  {
    id: 'poi-1',
    type: 'NatureReserve',
    name: 'Khu bảo tồn thiên nhiên Sơn Trà',
    description: 'Một công viên quốc gia đa dạng sinh học, là nơi sinh sống của loài Voọc chà vá chân nâu quý hiếm. Nơi tuyệt vời để đi bộ đường dài và tìm hiểu về thiên nhiên.',
    latitude: 16.1333,
    longitude: 108.2833,
  },
  {
    id: 'poi-2',
    type: 'RecyclingCenter',
    name: 'Trung tâm Tái chế Đà Nẵng Xanh',
    description: 'Tiếp nhận các vật liệu có thể tái chế như nhựa, giấy, kim loại và thủy tinh. Giúp giảm thiểu rác thải và bảo vệ tài nguyên.',
    latitude: 16.031,
    longitude: 108.182,
  },
  {
    id: 'poi-3',
    type: 'CommunityCleanup',
    name: 'Điểm tập kết dọn dẹp Bãi biển Mỹ Khê',
    description: 'Điểm hẹn hàng tuần cho các tình nguyện viên tham gia các hoạt động làm sạch bãi biển, giữ gìn vẻ đẹp cho một trong những bãi biển đẹp nhất hành tinh.',
    latitude: 16.0585,
    longitude: 108.248,
  },
  {
    id: 'poi-4',
    type: 'WaterStation',
    name: 'Trạm nước uống công cộng Cầu Rồng',
    description: 'Trạm nạp nước miễn phí giúp giảm thiểu việc sử dụng chai nhựa dùng một lần. Hãy mang theo chai cá nhân của bạn!',
    latitude: 16.0615,
    longitude: 108.2275,
  },
  {
    id: 'poi-5',
    type: 'RiskPoint',
    name: 'Điểm nguy cơ ngập lụt - Hòa Vang',
    description: 'Khu vực thấp trũng, thường xuyên xảy ra ngập lụt khi có mưa lớn kéo dài. Cần theo dõi sát sao mực nước.',
    latitude: 15.985,
    longitude: 108.152,
  },
  {
    id: 'poi-6',
    type: 'RiskPoint',
    name: 'Điểm nguy cơ sạt lở - Bán đảo Sơn Trà',
    description: 'Đoạn đường có độ dốc lớn, kết cấu địa chất yếu, dễ xảy ra sạt lở đất đá trong mùa mưa bão.',
    latitude: 16.125,
    longitude: 108.275,
  },
  {
    id: 'poi-7',
    type: 'RiskPoint',
    name: 'Khu vực ô nhiễm không khí cao - KCN Hòa Khánh',
    description: 'Nơi tập trung nhiều nhà máy sản xuất, chỉ số AQI thường xuyên ở mức cảnh báo. Khuyến nghị đeo khẩu trang khi di chuyển qua đây.',
    latitude: 16.068,
    longitude: 108.145,
  },
];

const App: React.FC = () => {
  const [reports, setReports] = useState<EnvironmentalReport[]>(initialReports);
  const [view, setView] = useState<'home' | 'map' | 'form' | 'thankYou' | 'environmentalMap' | 'sos' | 'login' | 'dashboard'>('home');
  const [previousView, setPreviousView] = useState<'home' | 'map' | 'environmentalMap'>('home');
  const [selectedReport, setSelectedReport] = useState<EnvironmentalReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [lastAwardedPoints, setLastAwardedPoints] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedEducationTopic, setSelectedEducationTopic] = useState<EducationalTopic | null>(null);
  const [mapViewState, setMapViewState] = useState({
    center: [15.85, 108.3] as [number, number],
    zoom: 10,
  });
  
  // Auth State
  const [user, setUser] = useState<any>(null);

  // State cho Trợ lý AI nổi
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      content: 'Xin chào! Tôi là Trợ lý AI của DA NANG GREEN. Tôi có thể giúp gì cho bạn hôm nay?',
      suggestions: [
        "Cách phân loại rác đúng cách?",
        "Báo cáo một điểm xả rác trái phép.",
        "Một số mẹo tiết kiệm nước là gì?",
      ]
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Offline Mode State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  // Auto Monitoring Mode State
  const [isAutoMonitoring, setIsAutoMonitoring] = useState<boolean>(false);

  // Load user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch reports from API
  const fetchReports = async () => {
    if (!isOnline) return;
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        const parsedData = data.map((report: any) => ({
          ...report,
          timestamp: new Date(report.timestamp)
        }));
        setReports(parsedData);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  useEffect(() => {
    fetchReports();
    
    // Setup WebSocket for real-time updates
    if (isOnline) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}`);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_REPORT') {
            addToast(`Có báo cáo mới tại ${data.report.area}`, 'success');
            const newReport = { ...data.report, timestamp: new Date(data.report.timestamp) };
            setReports(prev => [newReport, ...prev]);
          } else if (data.type === 'REPORT_UPDATED') {
            setReports(prev => prev.map(r => r.id === data.id ? { ...r, status: data.status } : r));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.warn('WebSocket error (this is normal in some preview environments):', error);
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    }
  }, [isOnline]);

  // Effect to handle online/offline status and sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('Đã kết nối lại Internet. Đang đồng bộ dữ liệu...', 'success');
      syncOfflineReports();
      fetchReports(); // Refresh data
    };

    const handleOffline = () => {
      setIsOnline(false);
      addToast('Mất kết nối Internet. Chế độ Offline đã được kích hoạt.', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for pending reports
    updatePendingReportsCount();

    // Fetch approximate location via IP immediately on load (No permission needed)
    const fetchApproximateLocation = async () => {
      try {
        // Only fetch if we don't have a precise location yet
        if (!userLocation) {
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const data = await response.json();
                if (data.latitude && data.longitude) {
                    // Check if the location is within reasonable bounds of Vietnam to avoid VPN weirdness
                    if (data.latitude > 8 && data.latitude < 24 && data.longitude > 102 && data.longitude < 110) {
                        setUserLocation({ latitude: data.latitude, longitude: data.longitude });
                        // Don't show toast for IP location to keep it subtle, 
                        // or maybe a small info toast: "Đang hiển thị khu vực của bạn (theo IP)"
                    }
                }
            }
        }
      } catch (error) {
        console.warn("Could not fetch IP location:", error);
      }
    };
    
    fetchApproximateLocation();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto Monitoring Mode Effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isAutoMonitoring) {
      addToast('Đã bật Chế độ Giám sát Tự động. Hệ thống sẽ cập nhật dữ liệu mỗi 10 giây.', 'success');
      
      const generateMockReport = () => {
        const districts = [
          // Đà Nẵng
          { name: 'Hải Châu', lat: 16.047, lng: 108.220, province: 'Đà Nẵng' },
          { name: 'Thanh Khê', lat: 16.061, lng: 108.180, province: 'Đà Nẵng' },
          { name: 'Sơn Trà', lat: 16.091, lng: 108.261, province: 'Đà Nẵng' },
          { name: 'Ngũ Hành Sơn', lat: 16.002, lng: 108.249, province: 'Đà Nẵng' },
          { name: 'Liên Chiểu', lat: 16.059, lng: 108.138, province: 'Đà Nẵng' },
          { name: 'Cẩm Lệ', lat: 15.998, lng: 108.191, province: 'Đà Nẵng' },
          { name: 'Hòa Vang', lat: 15.986, lng: 108.067, province: 'Đà Nẵng' },
          // Quảng Nam
          { name: 'Tam Kỳ', lat: 15.567, lng: 108.483, province: 'Quảng Nam' },
          { name: 'Hội An', lat: 15.883, lng: 108.333, province: 'Quảng Nam' },
          { name: 'Điện Bàn', lat: 15.883, lng: 108.233, province: 'Quảng Nam' },
          { name: 'Bắc Trà My', lat: 15.283, lng: 108.217, province: 'Quảng Nam' },
          { name: 'Duy Xuyên', lat: 15.817, lng: 108.250, province: 'Quảng Nam' },
          { name: 'Đại Lộc', lat: 15.883, lng: 107.983, province: 'Quảng Nam' },
          { name: 'Đông Giang', lat: 15.950, lng: 107.750, province: 'Quảng Nam' },
          { name: 'Hiệp Đức', lat: 15.550, lng: 108.083, province: 'Quảng Nam' },
          { name: 'Nam Giang', lat: 15.617, lng: 107.517, province: 'Quảng Nam' },
          { name: 'Nam Trà My', lat: 15.017, lng: 108.083, province: 'Quảng Nam' },
          { name: 'Nông Sơn', lat: 15.650, lng: 107.967, province: 'Quảng Nam' },
          { name: 'Núi Thành', lat: 15.417, lng: 108.617, province: 'Quảng Nam' },
          { name: 'Phú Ninh', lat: 15.517, lng: 108.417, province: 'Quảng Nam' },
          { name: 'Phước Sơn', lat: 15.350, lng: 107.783, province: 'Quảng Nam' },
          { name: 'Quế Sơn', lat: 15.633, lng: 108.150, province: 'Quảng Nam' },
          { name: 'Tây Giang', lat: 15.917, lng: 107.450, province: 'Quảng Nam' },
          { name: 'Thăng Bình', lat: 15.717, lng: 108.367, province: 'Quảng Nam' },
          { name: 'Tiên Phước', lat: 15.483, lng: 108.267, province: 'Quảng Nam' }
        ];

        const district = districts[Math.floor(Math.random() * districts.length)];
        // Thêm độ lệch ngẫu nhiên nhỏ cho tọa độ
        const lat = district.lat + (Math.random() - 0.5) * 0.04;
        const lng = district.lng + (Math.random() - 0.5) * 0.04;

        const issueTypes: AIAnalysis['issueType'][] = [
          'Xả rác không đúng nơi quy định',
          'Ngập lụt',
          'Sạt lở đất',
          'Cần chăm sóc cây xanh',
          'Khác'
        ];
        const issueType = issueTypes[Math.floor(Math.random() * issueTypes.length)];
        
        const researchSnippets = [
          "Dữ liệu cảm biến cho thấy sự thay đổi bất thường.",
          "Nghiên cứu thực địa ghi nhận tình trạng ô nhiễm cục bộ.",
          "Phân tích hình ảnh vệ tinh phát hiện biến đổi bề mặt.",
          "Báo cáo từ hệ thống giám sát tự động IoT.",
          "Kết quả quan trắc môi trường định kỳ.",
          "Dữ liệu từ trạm quan trắc khí tượng thủy văn khu vực.",
          "Phân tích từ mô hình dự báo rủi ro thiên tai."
        ];
        const snippet = researchSnippets[Math.floor(Math.random() * researchSnippets.length)];

        const priority = (Math.random() > 0.7 ? 'Cao' : (Math.random() > 0.4 ? 'Trung bình' : 'Thấp')) as AIAnalysis['priority'];
        
        const imageKeywords: Record<string, string> = {
          'Xả rác không đúng nơi quy định': 'trash,waste,pollution',
          'Ngập lụt': 'flood,water,rain',
          'Sạt lở đất': 'landslide,mud,mountain',
          'Cần chăm sóc cây xanh': 'tree,garden,nature',
          'Khác': 'environment,city,landscape'
        };

        const keyword = `${imageKeywords[issueType] || 'environment'},vietnam`;
        const seed = Math.floor(Math.random() * 1000);
        // Use loremflickr with 'vietnam' tag for better context
        const imageUrl = `https://loremflickr.com/800/600/${keyword}?lock=${seed}`;

        const newReport: EnvironmentalReport = {
          id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          mediaUrl: imageUrl,
          mediaType: 'image',
          latitude: lat,
          longitude: lng,
          userDescription: `Phát hiện ${issueType.toLowerCase()} tại ${district.name}. ${snippet}`,
          description: `Phát hiện ${issueType.toLowerCase()} tại ${district.name}. ${snippet}`,
          status: 'Báo cáo mới',
          timestamp: new Date(),
          area: district.name,
          aiAnalysis: {
            issueType: issueType,
            description: `Phát hiện ${issueType.toLowerCase()} tại ${district.name}. ${snippet}`,
            priority: priority,
            solution: priority === 'Cao' ? 'Cử đội ứng phó khẩn cấp ngay lập tức.' : 'Lên lịch kiểm tra và xử lý trong 48 giờ tới.',
            isIssuePresent: true
          }
        };

        setReports(prev => [newReport, ...prev]);
        addToast(`Phát hiện sự cố: ${issueType} tại ${district.name}`, 'warning');
      };

      // Generate first report immediately
      generateMockReport();
      
      // Then every 10 seconds
      intervalId = setInterval(generateMockReport, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoMonitoring]);

  const updatePendingReportsCount = () => {
    getOfflineReports().then(reports => {
      setPendingReportsCount(reports.length);
      if (navigator.onLine && reports.length > 0) {
        syncOfflineReports();
      }
    });
  };

  const syncOfflineReports = async () => {
    try {
      const offlineReports = await getOfflineReports();
      if (offlineReports.length === 0) return;

      // Send to server
      for (const report of offlineReports) {
        try {
          const response = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
          });
          
          if (response.ok) {
            await deleteOfflineReport(report.id);
          } else {
            console.error(`Failed to sync report ${report.id}: ${response.statusText}`);
          }
        } catch (err) {
          console.error(`Error syncing report ${report.id}:`, err);
        }
      }

      setPendingReportsCount(0);
      addToast(`Đã đồng bộ ${offlineReports.length} báo cáo offline thành công!`, 'success');
      fetchReports();

    } catch (error) {
      console.error("Sync failed:", error);
      addToast('Đồng bộ thất bại. Vui lòng thử lại sau.', 'error');
    }
  };

  // Effect để tải điểm từ localStorage khi render lần đầu
  useEffect(() => {
    try {
      const savedPoints = localStorage.getItem('daNangGreenUserPoints');
      if (savedPoints) {
        setUserPoints(parseInt(savedPoints, 10) || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải điểm từ localStorage:", error);
    }
  }, []);

  // Effect để theo dõi vị trí của người dùng liên tục với độ chính xác cao
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Trình duyệt không hỗ trợ định vị");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`Vị trí cập nhật: ${latitude}, ${longitude} (Độ chính xác: ${accuracy}m)`);
        
        setUserLocation({ latitude, longitude });
        
        // Cập nhật tâm bản đồ nếu chưa có vị trí hoặc độ chính xác tốt
        setMapViewState(prev => {
          // Nếu chưa có tâm bản đồ thực sự (đang ở mặc định), thì cập nhật
          if (prev.center[0] === 15.85 && prev.center[1] === 108.3) {
            return { ...prev, center: [latitude, longitude] };
          }
          return prev;
        });
      },
      (error) => {
        let errorMsg = "";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Người dùng từ chối cấp quyền định vị.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Thông tin vị trí không khả dụng.";
            break;
          case error.TIMEOUT:
            errorMsg = "Hết thời gian chờ lấy vị trí.";
            break;
          default:
            errorMsg = "Lỗi định vị không xác định.";
        }
        console.warn("Lỗi định vị:", errorMsg);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 30000, 
        maximumAge: 0 
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []); // Chạy một lần khi mount, watchPosition sẽ tự lo phần cập nhật

  // Effect để lưu điểm vào localStorage mỗi khi chúng thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('daNangGreenUserPoints', userPoints.toString());
    } catch (error) {
      console.error("Lỗi khi lưu điểm vào localStorage:", error);
    }
  }, [userPoints]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  // ĐÃ XÓA: useEffect tạo báo cáo giả tự động

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const handleStartNewReport = (currentView: 'home' | 'map' | 'environmentalMap') => {
    setPreviousView(currentView);
    setView('form');
  };

  const handleAddNewReport = async (
    mediaFile: File,
    userDescription: string,
    coords: { latitude: number; longitude: number },
    aiAnalysis: AIAnalysis // Nhận kết quả phân tích đã được xác thực
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Compress image first (for both online and offline)
      const compressedMediaUrl = await compressImage(mediaFile);
      
      const newReport: EnvironmentalReport = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mediaUrl: compressedMediaUrl,
        mediaType: mediaFile.type.startsWith('video') ? 'video' : 'image',
        latitude: coords.latitude,
        longitude: coords.longitude,
        userDescription,
        description: aiAnalysis.description,
        aiAnalysis, // Sử dụng trực tiếp kết quả phân tích
        status: 'Báo cáo mới',
        timestamp: new Date(),
      };

      if (!isOnline) {
        // Save to IndexedDB if offline
        await saveOfflineReport(newReport);
        setPendingReportsCount(prev => prev + 1);
        addToast('Đã lưu báo cáo vào bộ nhớ tạm. Sẽ tự động gửi khi có mạng.', 'success');
        
        // SMS Fallback Prompt
        if (window.confirm("Bạn đang offline. Bạn có muốn gửi tin nhắn SMS khẩn cấp kèm tọa độ GPS đến tổng đài không?")) {
            const smsBody = `SOS! Su co moi truong tai: ${coords.latitude},${coords.longitude}. Mo ta: ${userDescription}`;
            window.open(`sms:1022?body=${encodeURIComponent(smsBody)}`);
        }

      } else {
        // Online: Send to API
        // Check payload size for Vercel (approx 4.5MB limit)
        const payloadSize = JSON.stringify(newReport).length;
        if (payloadSize > 4 * 1024 * 1024) {
          addToast('Dữ liệu quá lớn (vượt quá 4MB). Vui lòng chọn ảnh/video nhỏ hơn hoặc nén lại.', 'error');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReport),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = response.status === 413 ? 'Dữ liệu quá lớn cho máy chủ.' : (errorData.message || `Lỗi máy chủ (${response.status})`);
          throw new Error(message);
        }
        
        // Tặng điểm cho báo cáo mới
        const pointsAwarded = 10;
        setUserPoints(prevPoints => prevPoints + pointsAwarded);
        setLastAwardedPoints(pointsAwarded);
        
        addToast('Báo cáo đã được gửi thành công!', 'success');
        fetchReports(); // Refresh list
      }
      
      setView('thankYou');
      setIsLoading(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
      setError(`Lỗi khi tạo báo cáo: ${errorMessage}`);
      setIsLoading(false);
      console.error(err);
    }
  };
  
  const handleUpdateReportStatus = async (reportId: string) => {
     const statusCycle: Record<ReportStatus, ReportStatus> = {
      'Báo cáo mới': 'Đang xử lý',
      'Đang xử lý': 'Đã xử lý',
      'Đã xử lý': 'Báo cáo mới',
    };
    
    const currentReport = reports.find(r => r.id === reportId);
    if (!currentReport) return;

    const newStatus = statusCycle[currentReport.status];

    try {
        const response = await fetch(`/api/reports/${reportId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
            setReports(prevReports =>
                prevReports.map(report =>
                  report.id === reportId
                    ? { ...report, status: newStatus }
                    : report
                )
              );
              setSelectedReport(prev => prev ? {...prev, status: newStatus} : null);
              addToast('Cập nhật trạng thái báo cáo thành công!');
        }
    } catch (error) {
        addToast('Lỗi cập nhật trạng thái', 'error');
    }
  };

  const handleExternalAnalysis = async (reportId: string, mediaUrl: string) => {
    try {
      const response = await fetch('/api/external-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, data: mediaUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Lỗi khi gọi mô hình ngoài');
      }

      return await response.json();
    } catch (error: any) {
      addToast(error.message || 'Lỗi kết nối mô hình ngoài', 'error');
      throw error;
    }
  };

  const handleSelectReport = (report: EnvironmentalReport | null) => {
    setSelectedReport(report);
  };

  const handleChatSubmit = async (userMessage: string) => {
    if (!userMessage.trim() || isChatLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      const aiResponse = await askAIAboutEnvironment(userMessage, userLocation);
      const newAiMessage: ChatMessage = {
        role: 'model',
        content: aiResponse.text,
        groundingChunks: aiResponse.groundingChunks,
      };
      setChatMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', content: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau." };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      { 
        role: 'model', 
        content: 'Xin chào! Tôi là Trợ lý AI của DA NANG GREEN. Tôi có thể giúp gì cho bạn hôm nay?',
        suggestions: [
          "Cách phân loại rác đúng cách?",
          "Báo cáo một điểm xả rác trái phép.",
          "Một số mẹo tiết kiệm nước là gì?",
        ]
      }
    ]);
  };

  const handleNavigateFromThankYou = (destination: 'home' | 'map') => {
    setView(destination);
    setLastAwardedPoints(0); // Đặt lại điểm để thông báo không hiển thị lại
  };

  const handleSelectReportAndNavigateToMap = (report: EnvironmentalReport) => {
    setView('map');
    // Đặt báo cáo được chọn sẽ làm cho modal xuất hiện trên chế độ xem bản đồ
    setSelectedReport(report);
  };

  const handleSelectEducationTopic = (topic: EducationalTopic) => {
    setSelectedEducationTopic(topic);
  };

  const handleCloseEducationModal = () => {
    setSelectedEducationTopic(null);
  };

  const handleMapViewChange = useCallback((center: L.LatLng, zoom: number) => {
    setMapViewState({ center: [center.lat, center.lng], zoom });
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('home');
  };

  const renderContent = () => {
    switch(view) {
      case 'home':
        return <HomeView 
                  reports={reports} 
                  onNavigateToMap={() => setView('map')} 
                  onStartNewReport={() => handleStartNewReport('home')}
                  onSelectReportAndNavigateToMap={handleSelectReportAndNavigateToMap}
                  onSelectEducationTopic={handleSelectEducationTopic}
                  onNavigateToEnvironmentalMap={() => setView('environmentalMap')}
                  onNavigateToSOS={() => setView('sos')}
                />;
      case 'map':
        return <MainMapView 
                  reports={reports} 
                  userLocation={userLocation}
                  onSelectReport={handleSelectReport} 
                  onNavigateHome={() => setView('home')}
                  onStartNewReport={() => handleStartNewReport('map')}
                  selectedReport={selectedReport}
                  initialViewState={mapViewState}
                  onViewChange={handleMapViewChange}
                />;
      case 'form':
        return <ReportForm
                  onSubmit={handleAddNewReport}
                  onCancel={() => { setView(previousView); setError(null); }}
                  isLoading={isLoading}
                  error={error}
                  isOnline={isOnline}
                  initialCoords={userLocation}
                />;
      case 'thankYou':
        return <ThankYouView
                  awardedPoints={lastAwardedPoints}
                  onNavigateHome={() => handleNavigateFromThankYou('home')}
                  onNavigateToMap={() => handleNavigateFromThankYou('map')}
                />;
      case 'environmentalMap':
        return <EnvironmentalMapView
                  reports={reports}
                  pois={environmentalPOIs}
                  userLocation={userLocation}
                  onNavigateHome={() => setView('home')}
                  onSelectReport={handleSelectReport}
                  onStartReport={() => handleStartNewReport('environmentalMap')}
                  selectedReport={selectedReport}
                  initialViewState={mapViewState}
                />;
      case 'sos':
        return <SOSView onClose={() => setView('home')} />;
      case 'login':
        return <LoginView onLogin={handleLogin} />;
      case 'dashboard':
        return <DashboardView user={user} reports={reports} />;
      default:
        return <HomeView 
                  reports={reports} 
                  onNavigateToMap={() => setView('map')} 
                  onStartNewReport={() => handleStartNewReport('home')}
                  onSelectReportAndNavigateToMap={handleSelectReportAndNavigateToMap}
                  onSelectEducationTopic={handleSelectEducationTopic}
                   onNavigateToEnvironmentalMap={() => setView('environmentalMap')}
                   onNavigateToSOS={() => setView('sos')}
                />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50 via-slate-50 to-white selection:bg-teal-100 selection:text-teal-900">
       <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      {/* Header - Ẩn trên mobile khi ở chế độ xem bản đồ */}
      {!(view === 'map' || view === 'environmentalMap') && (
        <header className="bg-white/80 backdrop-blur-md shadow-sm z-20 sticky top-0 border-b border-slate-100 transition-all duration-300">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setView('home')}>
               <div className="transform transition-transform group-hover:scale-105 duration-300">
                  <LogoIcon className="w-10 h-10 drop-shadow-sm" />
               </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-teal-700">
                DA NANG <span className="text-teal-600">GREEN</span>
              </h1>
            </div>
            
             <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Offline Indicator */}
                {!isOnline && (
                  <button 
                    onClick={() => setIsOfflineModalOpen(true)}
                    className="flex items-center space-x-1 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold animate-pulse hover:bg-amber-200 transition-colors"
                  >
                    <CloudIcon className="w-4 h-4" />
                    <span className="hidden xs:inline">Offline ({pendingReportsCount})</span>
                  </button>
                )}
                {isOnline && pendingReportsCount > 0 && (
                   <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold">
                    <CloudIcon className="w-4 h-4 animate-bounce" />
                    <span className="hidden xs:inline">Đang đồng bộ...</span>
                  </div>
                )}

                {/* SOS Button - Ẩn trên mobile vì đã có BottomNav */}
                <button
                  onClick={() => setView('sos')}
                  className="hidden md:flex w-10 h-10 bg-red-600 text-white rounded-full items-center justify-center animate-pulse hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 transform hover:scale-105"
                  title="SOS"
                >
                  <SOSIcon className="w-6 h-6" />
                </button>

                {/* Auth Controls - Ẩn trên mobile vì đã có BottomNav */}
                <div className="hidden md:flex items-center space-x-3">
                  {user ? (
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setView('dashboard')}
                        className="text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors"
                      >
                        Dashboard
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setView('login')}
                      className="text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors bg-slate-100 px-3 py-1.5 rounded-full"
                    >
                      Cán bộ
                    </button>
                  )}
                </div>

                {/* Auto Monitoring Toggle */}
                <button
                  onClick={() => setIsAutoMonitoring(!isAutoMonitoring)}
                  className={`hidden lg:flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isAutoMonitoring 
                      ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 animate-pulse' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Tự động giám sát và cập nhật báo cáo mỗi 10s"
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${isAutoMonitoring ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                  {isAutoMonitoring ? 'Giám sát: Bật' : 'Giám sát: Tắt'}
                </button>

                <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 text-amber-900 font-bold px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm shadow-sm">
                    <TrophyIcon className="w-4 h-4 sm:w-5 h-5 text-amber-500" />
                    <span className="hidden xs:inline">Điểm:</span>
                    <span>{userPoints}</span>
                </div>
              </div>
          </div>
        </header>
      )}
      
      <main className={`flex-grow relative flex flex-col ${view === 'map' || view === 'environmentalMap' ? 'h-[calc(100vh-64px)] md:h-screen' : ''} pb-16 md:pb-0`}>
         {renderContent()}
        
        {selectedReport && (
          <ReportDetailModal
            report={selectedReport}
            onClose={() => handleSelectReport(null)}
            onUpdateStatus={handleUpdateReportStatus}
            onExternalAnalysis={handleExternalAnalysis}
          />
        )}

        {selectedEducationTopic && (
          <EducationDetailModal
            topic={selectedEducationTopic}
            onClose={handleCloseEducationModal}
          />
        )}

        <OfflineReportsModal 
          isOpen={isOfflineModalOpen}
          onClose={() => setIsOfflineModalOpen(false)}
          onReportsChanged={updatePendingReportsCount}
        />
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav 
        activeView={view} 
        onNavigate={setView} 
        isLoggedIn={!!user} 
      />

      {/* Trợ lý AI nổi */}
      <FloatingAIAssistant
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(prev => !prev)}
        messages={chatMessages}
        isLoading={isChatLoading}
        onSubmit={handleChatSubmit}
        onClearChat={handleClearChat}
      />
    </div>
  );
};

export default App;
