
import React, { useState } from 'react';
import { UserRole, UserAccount } from '../types';
import { GoogleGenAI } from "@google/genai";

interface SuperAdminDashboardProps {
  users: UserAccount[];
  onUpdateUsers: (users: UserAccount[]) => void;
  setNotification: (notif: {message: string, type: 'email' | 'success'} | null) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ users, onUpdateUsers, setNotification }) => {
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getFriendlyRoleName = (role: UserRole): string => {
    switch (role) {
      case 'SuperAdmin': return 'Super Admin';
      case 'Admin': return 'Admin';
      case 'Verificator': return 'Verifikator';
      default: return 'User';
    }
  };

  const getRoleFacilities = (role: UserRole): string => {
    switch (role) {
      case 'SuperAdmin': return '- Kontrol Penuh Pengguna\n- Pengaturan Branding Sistem\n- Manajemen Katalog & Otoritas Verifikasi';
      case 'Admin': return '- Manajemen Master Barang\n- Monitoring Log Transaksi Real-time\n- Ekspor Laporan CSV Terpusat';
      case 'Verificator': return '- Otoritas Persetujuan Peminjaman Akhir\n- Review Validitas Data Pengguna';
      default: return '- Akses Katalog Aset Utama';
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (isAdding) {
      setIsSending(true);
      const newUser = { ...editingUser, id: 'U' + Math.random().toString(36).substr(2, 5).toUpperCase() };
      
      const roleName = getFriendlyRoleName(newUser.role);
      const facilities = getRoleFacilities(newUser.role);

      const baseMessage = `Halo ${newUser.name}, akun SIMPANSE Anda aktif. Login: ${newUser.username} / Pass: ${newUser.password}`;

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Buat draf email aktivasi sistem formal: Penerima: ${newUser.name}. Info: "${baseMessage}". Fasilitas: ${facilities}. Instansi: KGTK Maluku Utara.`,
        });
        
        console.log(`[SIMPANSE MAIL SERVICE] Sending to ${newUser.email}:`, response.text);

        await new Promise(resolve => setTimeout(resolve, 1500));

        setNotification({ 
          message: `User ${newUser.name} terdaftar! Akun ini tersimpan di BROWSER INI.`, 
          type: 'success' 
        });

        onUpdateUsers([...users, newUser]);
      } catch (err) {
        onUpdateUsers([...users, newUser]);
        setNotification({ message: 'User terdaftar (Sync Manual).', type: 'success' });
      } finally {
        setIsSending(false);
        setEditingUser(null);
        setIsAdding(false);
      }
    } else {
      onUpdateUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setNotification({ message: 'Profil pengguna diperbarui.', type: 'success' });
      setEditingUser(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus akses pengguna ini secara permanen?')) {
      onUpdateUsers(users.filter(u => u.id !== id));
      setNotification({ message: 'Pengguna dihapus.', type: 'success' });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-slide-down">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Staf & Hak Akses</h2>
          <p className="text-slate-500 text-sm font-medium">Data saat ini tersimpan secara <span className="text-blue-600 font-bold underline">Lokal (Local Storage)</span>.</p>
        </div>
        <button 
          disabled={isSending}
          onClick={() => {
            setIsAdding(true);
            setEditingUser({ id: '', name: '', username: '', email: '', role: 'Admin', password: 'STAF' + Math.floor(100 + Math.random() * 900) });
          }}
          className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSending ? 'Sinkronisasi...' : '+ Daftarkan Staf Baru'}
        </button>
      </div>

      <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-200 flex items-start space-x-4 shadow-sm">
        <div className="p-3 bg-amber-200 rounded-xl text-amber-700">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
           <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest">Informasi Sinkronisasi Perangkat</h4>
           <p className="text-[11px] text-amber-700 mt-1 font-medium leading-relaxed">
             Sistem ini menggunakan penyimpanan browser. User yang Anda buat di PC ini <span className="font-black">TIDAK AKAN</span> muncul di Ponsel/Tablet lain kecuali Anda menghubungkan sistem ke database cloud (Firebase/Supabase). Untuk demonstrasi vercel.app, harap gunakan perangkat yang sama.
           </p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="mb-8 relative w-full md:max-w-md">
          <input 
            type="text" 
            placeholder="Cari staf..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${
                  user.role === 'SuperAdmin' ? 'bg-purple-600 text-white' : 
                  user.role === 'Verificator' ? 'bg-yellow-400 text-blue-900' : 'bg-blue-600 text-white'
                }`}>
                  {user.name[0].toUpperCase()}
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">{user.role}</span>
              </div>
              
              <h3 className="text-lg font-black text-slate-800 truncate">{user.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 mb-6 truncate">@{user.username} • {user.email}</p>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => { setIsAdding(false); setEditingUser(user); }}
                  className="flex-1 py-3 bg-white border border-slate-200 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all"
                >
                  Edit Akses
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="px-4 py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[150] p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-down border-4 border-white my-8">
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{isAdding ? 'Registrasi Staf Baru' : 'Pengaturan Hak Akses'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status Penyimpanan: LOKAL BROWSER</p>
              </div>
              <button disabled={isSending} onClick={() => setEditingUser(null)} className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-10 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Staf</label>
                <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} placeholder="Masukkan Nama..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold lowercase" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value.replace(/\s+/g, '')})} placeholder="ID Login..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} placeholder="Email Staf..." />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Level Otoritas</label>
                <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black appearance-none" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}>
                  <option value="Admin">Administrator (Inventaris & Log)</option>
                  <option value="Verificator">Verifikator (Persetujuan Akhir)</option>
                  <option value="SuperAdmin">Super Admin (Kontrol Sistem)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi Awal</label>
                <input required className="w-full px-6 py-4 bg-blue-50 border-2 border-blue-100 rounded-2xl outline-none font-black text-blue-600" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} />
              </div>

              <div className="pt-8 flex space-x-4">
                <button type="button" disabled={isSending} onClick={() => setEditingUser(null)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl">Batal</button>
                <button type="submit" disabled={isSending} className="flex-[2] py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center">
                  {isSending ? 'Menyinkronkan...' : (isAdding ? 'Daftarkan Akun' : 'Simpan Profil')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
