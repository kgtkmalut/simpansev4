
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Catalog } from './components/Catalog';
import { LoanForm } from './components/LoanForm';
import { AdminDashboard } from './components/AdminDashboard';
import { ItemManagement } from './components/ItemManagement';
import { VerificatorDashboard } from './components/VerificatorDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { SuperAdminSettings } from './components/SuperAdminSettings';
import { LoginGate } from './components/LoginGate';
import { NotificationToast } from './components/NotificationToast';
import { LoanDetailModal } from './components/LoanDetailModal';
import { BorrowerGate } from './components/BorrowerGate';
import { INITIAL_ITEMS } from './constants';
import { Item, Loan, ViewType, ItemStatus, UserRole, SystemConfig, LoanStatus, UserAccount } from './types';

// Konfigurasi Infrastruktur Cloud
const CLOUD_CONFIG = {
  dbType: 'Vercel Postgres',
  backupFolderId: '1dX7v97MpowyYvkUbP19v8MIgKCXrOp2W',
  assetStore: 'Google Drive'
};

const DEFAULT_CONFIG: SystemConfig = {
  appName: 'SIMPANSE',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/2619/2619018.png',
  contactPhone: '082292313876',
  contactEmail: 'kgtkmalut@gmail.com',
  contactWebsite: 'https://kgtkmalut.id',
  socialFB: 'https://facebook.com/kantorgtkmalt',
  socialIG: 'https://instagram.com/kgtk_malut',
  socialYT: 'https://youtube.com/@KGTKMalukuUtara',
  secondaryLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_of_the_Ministry_of_Education_and_Culture_of_the_Republic_of_Indonesia.svg/1200px-Logo_of_the_Ministry_of_Education_and_Culture_of_the_Republic_of_Indonesia.svg.png',
  sliders: [
    { id: 's1', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1920&h=700', title: 'Manajemen Aset Digital', transition: 'fade' },
    { id: 's2', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1920&h=700', title: 'Kemudahan Peminjaman', transition: 'zoom' }
  ]
};

const INITIAL_USERS: UserAccount[] = [
  { id: 'u1', name: 'Admin Utama', username: 'admin', email: 'admin@simpanse.id', role: 'Admin', password: 'admin123' },
  { id: 'u2', name: 'Tim Verifikasi', username: 'verify', email: 'verify@simpanse.id', role: 'Verificator', password: 'verify123' },
  { id: 'u3', name: 'Super Admin', username: 'super', email: 'super@simpanse.id', role: 'SuperAdmin', password: 'super123' }
];

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewType>('catalog');
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showBorrowerGate, setShowBorrowerGate] = useState(false);
  const [prefilledBorrowerData, setPrefilledBorrowerData] = useState<Partial<Loan> | null>(null);
  const [viewingLoan, setViewingLoan] = useState<Loan | null>(null);
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionInput, setRejectionInput] = useState('');
  const [notification, setNotification] = useState<{message: string, type: 'email' | 'success'} | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('Borrower');
  const [showLogin, setShowLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Status Infrastruktur (Background Only)
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'syncing'>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');
  
  const [sessionEmail, setSessionEmail] = useState<string>('');
  const [sessionNIK, setSessionNIK] = useState<string>('');
  const [sessionName, setSessionName] = useState<string>('');

  // 1. Inisialisasi dari Database
  useEffect(() => {
    const fetchFromDatabase = async () => {
      setDbStatus('syncing');
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const pgData = localStorage.getItem('vercel_pg_data');
        if (pgData) {
          const db = JSON.parse(pgData);
          setItems(db.items || INITIAL_ITEMS);
          setLoans(db.loans || []);
          setUsers(db.users || INITIAL_USERS);
          setSystemConfig(db.config || DEFAULT_CONFIG);
        }
        setDbStatus('connected');
        setLastSyncTime(new Date().toLocaleTimeString());
      } catch (error) {
        setDbStatus('error');
      }
    };
    fetchFromDatabase();
  }, []);

  // 2. Background Sync
  useEffect(() => {
    const persistData = async () => {
      if (dbStatus === 'syncing') return;
      const dbDump = { items, loans, users, config: systemConfig, updatedAt: new Date().toISOString() };
      localStorage.setItem('vercel_pg_data', JSON.stringify(dbDump));
      setLastSyncTime(new Date().toLocaleTimeString());
    };
    const timer = setTimeout(persistData, 2000);
    return () => clearTimeout(timer);
  }, [items, loans, users, systemConfig]);

  const filteredDisplayLoans = useMemo(() => {
    if (userRole === 'Borrower') {
      if (!sessionEmail) return [];
      return loans.filter(l => l.borrowerEmail.toLowerCase() === sessionEmail.toLowerCase());
    }
    return loans;
  }, [loans, userRole, sessionEmail]);

  const submitLoan = useCallback((formData: any, status: 'Pending' | 'Queued') => {
    setSessionEmail(formData.borrowerEmail);
    setSessionNIK(formData.borrowerNIK);
    setSessionName(formData.borrowerName);

    const now = new Date();
    const newLoan: Loan = {
      id: 'TRX' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      ...formData,
      status: status,
      createdAt: now.toISOString()
    };

    setLoans(prev => [newLoan, ...prev.filter(l => 
      !(l.itemId === formData.itemId && 
        l.borrowerEmail.toLowerCase() === formData.borrowerEmail.toLowerCase() && 
        (l.status === 'Queued' || l.status === 'Rejected'))
    )]);

    setNotification({ message: 'Data pengajuan telah tersimpan.', type: 'success' });
    setSelectedItem(null);
    setPrefilledBorrowerData(null);
    setView('my-loans');
  }, []);

  const handleAdminVerify = useCallback((loanId: string) => {
    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: 'Verified' } : l));
    setNotification({ message: `Data berhasil diverifikasi.`, type: 'success' });
  }, []);

  const handleAction = useCallback((loanId: string, status: LoanStatus) => {
    if (status === 'Rejected') {
      setRejectionModalId(loanId);
      setRejectionInput('');
      return;
    }
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status } : l));
    if (status === 'Approved') {
      setItems(prev => prev.map(i => i.id === loan.itemId ? { ...i, availableQuantity: Math.max(0, i.availableQuantity - (loan.quantity || 1)), status: i.availableQuantity - (loan.quantity || 1) > 0 ? ItemStatus.READY : ItemStatus.OUT_OF_STOCK } : i));
    }
    setNotification({ message: `Pembaruan status berhasil.`, type: 'success' });
  }, [loans]);

  const submitRejection = () => {
    if (!rejectionModalId || !rejectionInput.trim()) return;
    setLoans(prev => prev.map(l => l.id === rejectionModalId ? { ...l, status: 'Rejected', rejectionReason: rejectionInput } : l));
    setNotification({ message: 'Peminjaman ditolak.', type: 'success' });
    setRejectionModalId(null);
  };

  const handleReturnItem = useCallback((loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: 'Returned' } : l));
    setItems(prev => prev.map(i => i.id === loan.itemId ? { ...i, availableQuantity: Math.min(i.totalQuantity, i.availableQuantity + (loan.quantity || 1)), status: ItemStatus.READY } : i));
    setNotification({ message: 'Item tersedia kembali.', type: 'success' });
  }, [loans]);

  const handleExportCSV = useCallback(() => {
    if (loans.length === 0) return;
    const headers = ['ID', 'Peminjam', 'NIK', 'Aset', 'Status', 'Tgl Pinjam', 'Tgl Kembali'];
    const rows = loans.map(l => [l.id, l.borrowerName, l.borrowerNIK, l.itemName, l.status, l.startDate, l.endDate]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LAPORAN_SIMPANSE_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [loans]);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setShowLogin(false);
    setIsSidebarOpen(false);
    if (role === 'Admin') setView('admin-tracking');
    else if (role === 'Verificator') setView('verificator-approval');
    else if (role === 'SuperAdmin') setView('super-admin-users');
  };

  const isStaff = userRole !== 'Borrower';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-x-hidden">
      {/* BACKGROUND SYNC LINE */}
      <div className={`fixed top-0 left-0 right-0 h-1 z-[300] transition-all duration-700 ${
        dbStatus === 'syncing' ? 'bg-blue-400 animate-pulse' : 'bg-transparent'
      }`} />

      <Sidebar 
        currentView={currentView} 
        setView={(v) => { setView(v); setIsSidebarOpen(false); }} 
        userRole={userRole}
        appName={systemConfig.appName}
        logoUrl={systemConfig.logoUrl}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { 
          setUserRole('Borrower'); 
          setSessionEmail(''); 
          setView('catalog'); 
        }}
        onLoginClick={() => { setShowLogin(true); setIsSidebarOpen(false); }}
      />
      
      {/* MOBILE TOP NAV */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center space-x-3">
          <img src={systemConfig.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="font-black text-blue-600 text-lg tracking-tighter">{systemConfig.appName}</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </div>

      <main className={`flex-1 transition-all duration-300 lg:ml-64 min-h-screen flex flex-col`}>
        {/* DESKTOP TOP BAR */}
        <div className="hidden lg:flex justify-between items-center p-5 bg-white/70 backdrop-blur-md border-b border-slate-100 px-8">
           <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sistem Aktif & Terhubung</p>
           </div>
           
           <div className="flex items-center space-x-6">
              <span className="text-[9px] font-black text-slate-400 uppercase">Update Terakhir: {lastSyncTime}</span>
              <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-100 rounded-full transition-all text-blue-500" title="Muat Ulang Data">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
           </div>
        </div>

        <div className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-10">
          {currentView === 'catalog' && (
            <Catalog 
              items={items} 
              onBorrow={(item) => { setSelectedItem(item); setShowBorrowerGate(true); }} 
              userLoans={loans.filter(l => l.borrowerEmail.toLowerCase() === sessionEmail.toLowerCase() && l.status === 'Queued')}
              sliders={systemConfig.sliders}
            />
          )}

          {currentView === 'my-loans' && (
            <div className="space-y-8 animate-slide-down">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-yellow-400 pb-8 gap-4">
                  <div>
                    <h2 className="text-4xl font-black text-blue-600 tracking-tight">Status Peminjaman</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M3 9a9 9 0 0018 0V9a9 9 0 00-18 0v0zm6 12h6" /></svg>
                      {isStaff ? 'Monitoring Aset' : `Sesi: ${sessionName || 'Guest'}`}
                    </p>
                  </div>
                  {!isStaff && sessionName && (
                    <button onClick={() => { setSessionEmail(''); setSessionNIK(''); setSessionName(''); setView('catalog'); }} className="px-6 py-3 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100">Keluar Sesi</button>
                  )}
               </div>

               {filteredDisplayLoans.length === 0 ? (
                 <div className="bg-white p-16 md:p-32 rounded-[4rem] text-center border-4 border-dashed border-slate-100 shadow-sm">
                   <h3 className="text-2xl font-black text-slate-800 mb-2">Riwayat Kosong</h3>
                   <p className="text-slate-400 max-w-sm mx-auto mb-10 font-medium italic">Anda belum memiliki transaksi peminjaman yang terdaftar.</p>
                   <button onClick={() => setView('catalog')} className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl">Cari Aset</button>
                 </div>
               ) : (
                 <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left min-w-[900px]">
                        <thead>
                          <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-10 py-6">Aset</th>
                            <th className="px-10 py-6">Waktu</th>
                            <th className="px-10 py-6 text-center">Status</th>
                            <th className="px-10 py-6 text-right">Opsi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDisplayLoans.map(loan => (
                            <tr key={loan.id} className="hover:bg-blue-50/20 transition-all group">
                              <td className="px-10 py-8">
                                <div className="text-lg font-black text-slate-800">{loan.itemName}</div>
                                <div className="flex items-center space-x-3 mt-1.5">
                                   <span className="text-[10px] text-blue-500 font-bold uppercase">{loan.quantity} Unit</span>
                                   <span className="text-[10px] text-slate-400 font-bold">ID: {loan.id}</span>
                                </div>
                              </td>
                              <td className="px-10 py-8">
                                <span className="text-xs font-bold text-slate-600">{loan.startDate} s/d {loan.endDate}</span>
                              </td>
                              <td className="px-10 py-8 text-center">
                                <span className={`px-6 py-2 text-[10px] font-black uppercase rounded-[2rem] tracking-widest shadow-sm inline-block ${
                                  loan.status === 'Approved' ? 'bg-emerald-500 text-white' : 
                                  loan.status === 'Rejected' ? 'bg-red-500 text-white' : 
                                  loan.status === 'Verified' ? 'bg-blue-600 text-white' : 'bg-amber-400 text-blue-900'
                                }`}>{loan.status}</span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                <button onClick={() => setViewingLoan(loan)} className="px-6 py-3 bg-slate-50 hover:bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 transition-all">Lihat Detail</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
               )}
            </div>
          )}

          {currentView === 'admin-tracking' && <AdminDashboard loans={loans} onVerify={handleAdminVerify} onAction={handleAction} onReturn={handleReturnItem} onExport={handleExportCSV} onViewDetail={setViewingLoan} />}
          {currentView === 'admin-items' && <ItemManagement items={items} onUpdateItems={setItems} />}
          {currentView === 'verificator-approval' && <VerificatorDashboard loans={loans} onAction={handleAction} onViewDetail={setViewingLoan} />}
          {currentView === 'super-admin-users' && <SuperAdminDashboard users={users} onUpdateUsers={setUsers} setNotification={setNotification} />}
          {currentView === 'super-admin-settings' && <SuperAdminSettings config={systemConfig} onUpdateConfig={setSystemConfig} />}
        </div>

        {/* REFINED FOOTER */}
        <footer className="bg-white border-t-8 border-yellow-400 p-10 md:p-16 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center space-x-4">
                 <img src={systemConfig.logoUrl} className="w-14 h-14 object-contain" alt="SIMPANSE" />
                 <div>
                    <h4 className="text-2xl font-black text-blue-600 tracking-tighter leading-none">{systemConfig.appName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sistem Peminjaman Aset</p>
                 </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-2">
                <a href={systemConfig.socialFB} target="_blank" rel="noreferrer" title="Facebook" className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33c-3.6,0-4.6,2.7-4.6,4.5v2.46h-3v4h3v12h5v-12h3.85Z"/></svg>
                </a>
                <a href={systemConfig.socialIG} target="_blank" rel="noreferrer" title="Instagram" className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all shadow-sm border border-slate-100">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2.16c3.2,0,3.58.01,4.85.07,1.17.05,1.81.25,2.23.41a3.71,3.71,0,0,1,1.38.9,3.71,3.71,0,0,1,.9,1.38c.16.42.36,1.06.41,2.23s.07,1.65.07,4.85-.01,3.58-.07,4.85-.25,1.81-.41,2.23a3.71,3.71,0,0,1-.9,1.38,3.71,3.71,0,0,1-1.38.9c-.42.16-1.06.36-2.23.41s-1.65.07-4.85.07-3.58-.01-4.85-.07-1.81-.25-2.23-.41a3.71,3.71,0,0,1-1.38-.9,3.71,3.71,0,0,1-.9-1.38c-.16-.42-.36-1.06-.41-2.23s-.07-1.65-.07-4.85.01-3.58.07-4.85.25-1.81.41-2.23a3.71,3.71,0,0,1 .9-1.38,3.71,3.71,0,0,1,1.38-.9c.42-.16,1.06-.36,2.23-.41s1.65-.07,4.85-.07M12,0C8.74,0,8.33.01,7.05.07c-1.28.06-2.15.26-2.92.56a5.57,5.57,0,0,0-2,.3,5.57,5.57,0,0,0-2,2c-.3.77-.5,1.64-.56,2.92C0,8.33,0,8.74,0,12s.01,3.67.07,4.95c.06,1.28.26,2.15.56,2.92a5.57,5.57,0,0,0,1.3,2,5.57,5.57,0,0,0,2,1.3c.77.3,1.64.5,2.92.56,1.28.06,1.69.07,4.95.07s3.67-.01,4.95-.07c1.28-.06,2.15-.26,2.92-.56a6.2,6.2,0,0,0,3.3-3.3c.3-.77.5-1.64.56-2.92.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.92a5.57,5.57,0,0,0-1.3-2,5.57,5.57,0,0,0-2-1.3c-.77-.3-1.64-.5-2.92-.56C15.67.01,15.26,0,12,0Z"/><path d="M12,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84Zm0,10.16A4,4,0,1,1,16,12,4,4,0,0,1,12,16Z"/><circle cx="18.41" cy="5.59" r="1.44"/></svg>
                </a>
                <a href={systemConfig.socialYT} target="_blank" rel="noreferrer" title="YouTube" className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-slate-100">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5,6.19a3,3,0,0,0-2.1-2.1C19.55,3.54,12,3.54,12,3.54s-7.55,0-9.4.55a3,3,0,0,0-2.1,2.1C0,8.05,0,12,0,12s0,3.95.5,5.81a3,3,0,0,0,2.1,2.1C4.45,20.46,12,20.46,12,20.46s7.55,0,9.4-.55a3,3,0,0,0,2.1-2.1C24,15.95,24,12,24,12S24,8.05,23.5,6.19ZM9.54,15.57V8.43L15.82,12Z"/></svg>
                </a>
                <a href={systemConfig.contactWebsite} target="_blank" rel="noreferrer" title="Website Resmi" className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Hubungi Kami</h4>
              <ul className="space-y-3">
                 <li className="flex items-center text-sm font-bold text-slate-600">
                    <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {systemConfig.contactPhone}
                 </li>
                 <li className="flex items-center text-sm font-bold text-slate-600">
                    <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                    {systemConfig.contactEmail}
                 </li>
              </ul>
            </div>

            <div className="col-span-1 flex flex-col items-center md:items-end justify-center">
              <img src={systemConfig.secondaryLogoUrl} className="w-24 h-24 object-contain opacity-20 grayscale" alt="Footer Logo" />
              <div className="mt-8 text-center md:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">© {new Date().getFullYear()} KGTK MALUKU UTARA</p>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {showBorrowerGate && selectedItem && (
        <BorrowerGate allLoans={loans} onSelectNew={() => setShowBorrowerGate(false)} onSelectReturning={(data) => { setShowBorrowerGate(false); setPrefilledBorrowerData(data); }} onCancel={() => { setShowBorrowerGate(false); setSelectedItem(null); }} />
      )}

      {selectedItem && !showBorrowerGate && (
        <LoanForm item={selectedItem} allLoans={loans} prefillData={prefilledBorrowerData} onSubmit={submitLoan} onCancel={() => { setSelectedItem(null); setPrefilledBorrowerData(null); }} />
      )}

      {viewingLoan && <LoanDetailModal loan={viewingLoan} onClose={() => setViewingLoan(null)} />}
      
      {rejectionModalId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[350] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-12 animate-slide-down border-4 border-white">
            <h3 className="text-3xl font-black text-red-600 mb-6 tracking-tight">Otoritas Penolakan</h3>
            <textarea required rows={4} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl mb-10 font-bold outline-none focus:border-red-500 transition-all text-slate-800" placeholder="Alasan penolakan..." value={rejectionInput} onChange={(e) => setRejectionInput(e.target.value)} />
            <div className="flex space-x-4">
              <button onClick={() => setRejectionModalId(null)} className="flex-1 py-5 text-[11px] font-black uppercase text-slate-400">Batalkan</button>
              <button disabled={!rejectionInput.trim()} onClick={submitRejection} className="flex-[2] py-5 bg-red-600 text-white rounded-[2rem] text-[11px] font-black uppercase shadow-2xl disabled:opacity-50 transition-all">Konfirmasi</button>
            </div>
          </div>
        </div>
      )}

      {showLogin && <LoginGate users={users} onLogin={handleLogin} onCancel={() => setShowLogin(false)} />}
      {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default App;
