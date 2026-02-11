
import React, { useState } from 'react';
import { UserRole, UserAccount } from '../types';

interface LoginGateProps {
  users: UserAccount[];
  onLogin: (role: UserRole) => void;
  onCancel: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ users, onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    // Simulasi Query SQL ke Vercel Postgres
    setTimeout(() => {
      const user = users.find(u => 
        (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && 
        u.password === password
      );

      if (user) {
        onLogin(user.role);
      } else {
        setError('Login gagal. Kredensial tidak ditemukan di database SQL pusat.');
      }
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[400] p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-slide-down border-4 border-white">
        <div className="p-10 md:p-14 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-white shadow-xl">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2zm0 5h16m-16 5h16" /></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Database Portal</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium italic">Otentikasi Staf via Vercel Postgres SQL.</p>

          <form onSubmit={handleSubmit} className="mt-12 space-y-5 text-left">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Staf Identifier</label>
              <input
                type="text"
                required
                className="w-full px-7 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SQL Pin</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-7 py-4 pr-16 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-800 tracking-[0.2em]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors">
                   {showPassword ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-pulse text-center">
                <p className="text-red-600 text-[11px] font-bold italic leading-relaxed">{error}</p>
              </div>
            )}
            
            <button type="submit" disabled={isVerifying} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl transition-all flex items-center justify-center relative">
              <span className={`transition-all ${isVerifying ? 'opacity-0' : 'opacity-100'}`}>Connect to SQL</span>
              {isVerifying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="ml-3 text-[10px] font-black uppercase tracking-widest">Querying...</span>
                </div>
              )}
            </button>
            <button type="button" onClick={onCancel} className="w-full py-4 text-slate-400 font-black text-[11px] uppercase tracking-[0.3em] hover:text-red-500 transition-colors">Batal</button>
          </form>
        </div>
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary DB: Vercel Postgres | Identity: Drive Assets</p>
        </div>
      </div>
    </div>
  );
};
