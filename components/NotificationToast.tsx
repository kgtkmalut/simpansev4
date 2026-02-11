
import React, { useEffect } from 'react';

interface NotificationToastProps {
  message: string;
  type: 'email' | 'success';
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (type === 'email') {
    return (
      <div className="fixed bottom-6 right-6 z-[250] animate-bounce-in max-w-sm w-full">
        <div className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Simpanse Mail Service</p>
            </div>
            <span className="text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 uppercase tracking-widest">Live Auto</span>
          </div>
          <div className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Automated Delivery</p>
                <p className="text-sm font-black text-emerald-400">Pesan Berhasil Terkirim</p>
              </div>
            </div>
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 mb-6">
              <p className="text-[11px] leading-relaxed text-slate-300 font-medium italic">
                "{message}"
              </p>
            </div>
            <div className="flex space-x-3">
               <div className="flex-1 py-3 bg-emerald-600/20 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center border border-emerald-400/20">
                 System Verified ✓
               </div>
               <button onClick={onClose} className="px-5 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-bounce-in">
      <div className="flex items-center p-4 rounded-2xl shadow-xl border bg-emerald-600 border-emerald-400 text-white">
        <div className="mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Berhasil</p>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
