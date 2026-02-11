
import React from 'react';
import { ViewType, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  userRole: UserRole;
  appName: string;
  logoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, setView, userRole, appName, logoUrl, 
  isOpen, onClose, onLogout, onLoginClick 
}) => {
  const getNavItems = () => {
    const common = [
      { id: 'catalog', label: 'Katalog Aset', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      { id: 'my-loans', label: 'Peminjaman Saya', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    ];

    if (userRole === 'Admin') return [
      ...common,
      { id: 'admin-items', label: 'Master Barang', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
      { id: 'admin-tracking', label: 'Log Transaksi', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2' }
    ];

    if (userRole === 'Verificator') return [
      ...common,
      { id: 'verificator-approval', label: 'Otoritas Verifikasi', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
    ];

    if (userRole === 'SuperAdmin') return [
      ...common,
      { id: 'super-admin-users', label: 'Manajemen Staf', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
      { id: 'super-admin-settings', label: 'Konfigurasi Sistem', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
    ];

    return common;
  };

  return (
    <>
      {/* Background Overlay for Mobile Drawer */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-[80] 
        transition-transform duration-300 transform 
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
        lg:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="p-8 border-b border-slate-100 flex flex-col items-center text-center relative bg-gradient-to-b from-slate-50 to-white">
          <button 
            onClick={onClose} 
            className="lg:hidden absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
            title="Tutup Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={logoUrl} alt="App Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain mb-6 drop-shadow-lg" />
          <h1 className="text-xl font-black text-blue-600 tracking-tighter leading-none">{appName}</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mt-2">Sistem Peminjaman Aset</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {getNavItems().map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center px-5 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                currentView === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                  : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer / User Info */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white p-4 rounded-2xl mb-6 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Otoritas</p>
                <p className="text-[11px] font-black text-blue-600 uppercase tracking-tighter">{userRole}</p>
              </div>
            </div>
          </div>
          
          {userRole === 'Borrower' ? (
            <button 
              onClick={onLoginClick} 
              className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              Masuk Portal Staf
            </button>
          ) : (
            <button 
              onClick={onLogout} 
              className="w-full py-4 bg-white border-2 border-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span>Keluar Sesi</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
