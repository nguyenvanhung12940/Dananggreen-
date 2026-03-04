/// <reference types="vite/client" />
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { EnvironmentalReport } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { UsersIcon } from './icons/UsersIcon';
import { FileUpIcon } from './icons/FileUpIcon';
import { XCircleIcon as AlertCircleIcon } from './icons/XCircleIcon';
import BulkImportModal from './BulkImportModal';

interface DashboardStats {
  total: number;
  byPriority: { priority: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byArea: { area: string; count: number }[];
  recentActivity: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DashboardViewProps {
  user?: any;
  reports: EnvironmentalReport[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, reports }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'looker'>('overview');

  const lookerUrl = import.meta.env.VITE_LOOKER_DASHBOARD_URL;
  const isAdmin = user && (user.role === 'admin' || user.role === 'environment_department');

  // Mock Leaderboard Data
  const leaderboard = [
      { name: 'Nguyễn Văn A', points: 1250, rank: 'Chiến binh Xanh', avatar: 'https://i.pravatar.cc/150?u=a' },
      { name: 'Trần Thị B', points: 980, rank: 'Người bảo vệ', avatar: 'https://i.pravatar.cc/150?u=b' },
      { name: 'Lê Văn C', points: 850, rank: 'Tình nguyện viên', avatar: 'https://i.pravatar.cc/150?u=c' },
      { name: 'Phạm Thị D', points: 720, rank: 'Tình nguyện viên', avatar: 'https://i.pravatar.cc/150?u=d' },
      { name: 'Hoàng Văn E', points: 600, rank: 'Thành viên mới', avatar: 'https://i.pravatar.cc/150?u=e' },
  ];

  const filteredReports = React.useMemo(() => {
    if (user && !isAdmin && user.area && user.area !== 'All') {
      return reports.filter((r: any) => r.area === user.area);
    }
    return reports;
  }, [reports, user, isAdmin]);

  const stats = React.useMemo(() => {
    const daNangDistricts = ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang', 'Hoàng Sa'];
    
    const regionCounts = filteredReports.reduce((acc: any, curr: any) => {
      const region = daNangDistricts.includes(curr.area) ? 'Đà Nẵng' : 'Quảng Nam';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});
    
    const byRegion = Object.keys(regionCounts).map(region => ({ region, count: regionCounts[region] }));

    const total = filteredReports.length;
    
    const statusCounts = filteredReports.reduce((acc: any, curr: any) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});
    const byStatus = Object.keys(statusCounts).map(status => ({ status, count: statusCounts[status] }));

    const priorityCounts = filteredReports.reduce((acc: any, curr: any) => {
        const priority = curr.aiAnalysis?.priority || curr.priority || 'Trung bình';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
    }, {});
    const byPriority = Object.keys(priorityCounts).map(priority => ({ priority, count: priorityCounts[priority] }));

    return {
        total,
        byStatus,
        byPriority,
        byRegion
    };
  }, [filteredReports]);

  useEffect(() => {
    fetch('/api/health').then(res => res.json()).then(setHealthStatus).catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 text-center">Không có dữ liệu.</div>;

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen pb-24 md:pb-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12 opacity-50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-100">
              <span className="text-2xl font-bold uppercase">{(user?.organizationName || user?.username || 'U').charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">{user?.organizationName || user?.username || 'Người dùng'}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full border border-teal-100 uppercase">
                  {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'environment_department' ? 'Cán bộ Môi trường' : 'Công dân Xanh'}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200 uppercase">
                  Khu vực: {user?.area || 'Toàn thành phố'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm đóng góp</p>
              <p className="text-2xl font-black text-teal-600">1,250</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tổng quan
              </button>
              {isAdmin && (
                <button 
                  onClick={() => setActiveTab('looker')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'looker' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Phân tích
                </button>
              )}
            </div>
            {isAdmin && (
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                title="Nhập dữ liệu Excel"
              >
                  <FileUpIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {healthStatus?.supabase === 'error' && isAdmin && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3 text-red-700">
          <div className="p-2 bg-red-100 rounded-lg">
             <AlertCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Lỗi kết nối Supabase</h4>
            <p className="text-xs mt-1 opacity-80">{healthStatus.supabaseError}</p>
            <div className="mt-3 flex space-x-2">
              <button 
                onClick={() => {
                  const sql = `-- 1. Xóa bảng cũ\nDROP TABLE IF EXISTS reports;\nDROP TABLE IF EXISTS users;\n\n-- 2. Tạo bảng users\nCREATE TABLE users (\n  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,\n  username TEXT UNIQUE NOT NULL,\n  password TEXT NOT NULL,\n  role TEXT NOT NULL,\n  area TEXT,\n  "organizationName" TEXT,\n  status TEXT DEFAULT 'active',\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- 3. Tạo bảng reports\nCREATE TABLE reports (\n  id TEXT PRIMARY KEY,\n  "mediaUrl" TEXT,\n  "mediaType" TEXT,\n  latitude DOUBLE PRECISION,\n  longitude DOUBLE PRECISION,\n  "userDescription" TEXT,\n  "issueType" TEXT,\n  description TEXT,\n  priority TEXT,\n  "solution" TEXT,\n  "isIssuePresent" INTEGER,\n  status TEXT,\n  timestamp TEXT,\n  area TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- 4. Tắt bảo mật\nALTER TABLE users DISABLE ROW LEVEL SECURITY;\nALTER TABLE reports DISABLE ROW LEVEL SECURITY;`;
                  navigator.clipboard.writeText(sql);
                  alert('Đã sao chép mã SQL! Hãy dán vào Supabase SQL Editor và nhấn Run.');
                }}
                className="text-[10px] bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm"
              >
                Sao chép mã SQL tạo bảng
              </button>
            </div>
          </div>
        </div>
      )}

      <BulkImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImportSuccess={() => {
          window.location.reload();
        }} 
      />

      {activeTab === 'overview' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <FileUpIcon className="w-5 h-5" />
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tổng báo cáo</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Đang xử lý</p>
              <p className="text-2xl font-black text-amber-500 mt-1">
                {stats.byStatus.find(s => s.status === 'Đang xử lý')?.count || 0}
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3">
                <AlertCircleIcon className="w-5 h-5" />
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Ưu tiên Cao</p>
              <p className="text-2xl font-black text-red-500 mt-1">
                {stats.byPriority.find(p => p.priority === 'Cao')?.count || 0}
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Đã hoàn thành</p>
              <p className="text-2xl font-black text-green-500 mt-1">
                {stats.byStatus.find(s => s.status === 'Đã xử lý')?.count || 0}
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-80">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center text-sm uppercase tracking-wider">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                Phân bố theo Khu vực
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(stats as any).byRegion}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-80">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center text-sm uppercase tracking-wider">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Trạng thái Xử lý
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.byStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="count"
                    stroke="none"
                  >
                    {stats.byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leaderboard & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leaderboard */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-1">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-800 flex items-center text-sm uppercase tracking-wider">
                          <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />
                          Bảng Xếp Hạng
                      </h3>
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">Tháng 3</span>
                  </div>
                  <div className="space-y-3">
                      {leaderboard.map((user, index) => (
                          <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all group">
                              <div className="flex items-center space-x-3">
                                  <div className={`w-6 h-6 flex items-center justify-center rounded-full font-black text-[10px] ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                                      {index + 1}
                                  </div>
                                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform" />
                                  <div>
                                      <p className="font-bold text-slate-800 text-xs">{user.name}</p>
                                      <p className="text-[10px] text-slate-500">{user.rank}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="font-black text-teal-600 text-sm">{user.points}</p>
                                  <p className="text-[10px] text-slate-400">điểm</p>
                              </div>
                          </div>
                      ))}
                  </div>
                  <button className="w-full mt-6 py-2.5 text-xs font-bold text-teal-600 bg-teal-50/50 hover:bg-teal-50 rounded-2xl transition-colors">
                      Xem tất cả cộng đồng
                  </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
                   <h3 className="font-bold text-slate-800 mb-6 flex items-center text-sm uppercase tracking-wider">
                      <UsersIcon className="w-5 h-5 text-blue-500 mr-2" />
                      Hoạt động Gần đây
                   </h3>
                   <div className="space-y-2">
                      {filteredReports.slice(0, 4).map((report) => (
                          <div key={report.id} className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                              <div className="relative flex-shrink-0">
                                  <img 
                                    src={report.mediaUrl} 
                                    alt="Report" 
                                    className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm"
                                    onError={(e) => {(e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'}}
                                  />
                                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold ${
                                      report.status === 'Báo cáo mới' ? 'bg-red-500' : 
                                      report.status === 'Đang xử lý' ? 'bg-amber-500' : 'bg-green-500'
                                  }`}>
                                      {report.status === 'Báo cáo mới' ? '!' : report.status === 'Đang xử lý' ? '...' : '✓'}
                                  </div>
                              </div>
                              <div className="flex-grow min-w-0">
                                  <div className="flex justify-between items-start">
                                      <h4 className="font-bold text-slate-800 text-xs truncate pr-2">{report.aiAnalysis?.issueType || 'Sự cố môi trường'}</h4>
                                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(report.timestamp).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{report.description || report.userDescription}</p>
                                  <div className="flex items-center mt-1.5 space-x-2">
                                      <span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold uppercase">
                                          {report.area || 'Chưa xác định'}
                                      </span>
                                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                          (report.aiAnalysis?.priority) === 'Cao' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                      }`}>
                                          {report.aiAnalysis?.priority || 'Trung bình'}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      ))}
                      {filteredReports.length === 0 && (
                          <div className="text-center py-10 text-slate-400 text-sm">Chưa có hoạt động nào.</div>
                      )}
                   </div>
                   <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors">
                      Xem tất cả báo cáo của tôi
                   </button>
              </div>
          </div>

          {/* Heatmap */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center text-sm uppercase tracking-wider">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Bản đồ Rủi ro Môi trường
            </h3>
            <div className="flex-grow rounded-2xl overflow-hidden relative z-0 border border-slate-100">
               <MapContainer center={[15.85, 108.3]} zoom={9} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {filteredReports.map((report) => (
                  <CircleMarker 
                    key={report.id}
                    center={[report.latitude, report.longitude]}
                    radius={(report.aiAnalysis?.priority) === 'Cao' ? 12 : 6}
                    pathOptions={{ 
                        color: (report.aiAnalysis?.priority) === 'Cao' ? '#ef4444' : ((report.aiAnalysis?.priority) === 'Trung bình' ? '#f59e0b' : '#10b981'),
                        fillColor: (report.aiAnalysis?.priority) === 'Cao' ? '#ef4444' : ((report.aiAnalysis?.priority) === 'Trung bình' ? '#f59e0b' : '#10b981'),
                        fillOpacity: 0.5
                    }}
                  >
                    <Popup>
                      <div className="text-xs p-1">
                        <p className="font-bold text-slate-800">{report.aiAnalysis?.issueType || 'Sự cố môi trường'}</p>
                        <p className="text-slate-500 mt-1">Mức độ: <span className="font-bold">{report.aiAnalysis?.priority || 'Trung bình'}</span></p>
                        <p className="text-slate-400 mt-0.5">{new Date(report.timestamp).toLocaleString()}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[700px] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center text-sm uppercase tracking-wider">
              <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Phân tích Looker
            </h3>
            <a 
              href={lookerUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-teal-600 font-bold hover:underline flex items-center"
            >
              Mở trong tab mới
              <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          
          {lookerUrl ? (
            <iframe
              src={lookerUrl}
              className="w-full flex-grow border-0 rounded-2xl"
              title="Looker Dashboard"
              allowFullScreen
            />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="bg-teal-100 p-4 rounded-full mb-4">
                <svg className="w-12 h-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Chưa cấu hình Looker</h4>
              <p className="text-slate-500 max-w-md mb-6">
                Bạn cần cung cấp URL Dashboard Looker Studio hoặc Looker Embed trong biến môi trường <code>VITE_LOOKER_DASHBOARD_URL</code>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardView;
