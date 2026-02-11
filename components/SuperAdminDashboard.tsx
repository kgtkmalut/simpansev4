import React, { useState } from 'react';
import { UserRole, UserAccount } from '../types';
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      case 'SuperAdmin': return '- Kontrol Penuh Pengguna\n- Pengaturan Branding Sistem\n- Manajemen Katalog';
      case 'Admin': return '- Manajemen Master Barang\n- Monitoring Log\n- Ekspor CSV';
      case 'Verificator': return '- Otoritas Persetujuan\n- Review Validitas Data';
      default: return '- Akses Katalog Utama';
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (isAdding) {
      setIsSending(true);
      const newUser = { ...editingUser, id: 'U' + Math.random().toString(36).substr(2, 5).toUpperCase() };
      const facilities = getRoleFacilities(newUser.role);
      const baseMessage = `Halo ${newUser.name}, akun SIMPANSE aktif. Login: ${newUser.username} / Pass: ${newUser.password}`;

      try {
        // Solusi Error TS2339 & TS2304
        const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(
          `Buat draf email aktivasi sistem: Penerima: ${newUser.name}. Info: "${baseMessage}". Fasilitas: ${facilities}. Instansi: KGTK Maluku Utara.`
        );
        
        console.log(`[SIMPANSE MAIL SERVICE] Result:`, result.response.text());
        await new Promise(resolve => setTimeout(resolve, 1500));
        setNotification({ message: `User ${newUser.name} terdaftar!`, type: 'success' });
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
      setNotification({ message: 'Profil diperbarui.', type: 'success' });
      setEditingUser(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus akses pengguna ini?')) {
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
          <p className="text-slate-500 text-sm font-medium">Data tersimpan di <span className="text-blue-600 font-bold underline">Lokal (Local Storage)</span>.</p>
        </div>
        <button 
          disabled={isSending}
          onClick={() => {
            setIsAdding(true);
            setEditingUser({ id: '', name: '', username: '', email: '', role: 'Admin', password: 'STAF' + Math.floor(100 + Math.random() * 900) });
          }}
          className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSending ? 'Sinkronisasi...' : '+ Daftarkan Staf Baru'}
        </button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="mb-8 relative w-full md:max-w-md">
          <input 
            type="text" 
            placeholder="Cari staf..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl bg-blue-600 text-white">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-3 py-1.5 rounded-xl border border-slate-100">{user.role}</span>
              </div>
              <h3 className="text-lg font-black text-slate-800 truncate">{user.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 mb-6 truncate">@{user.username}</p>
              <div className="flex space-x-2">
                <button onClick={() => { setIsAdding(false); setEditingUser(user); }} className="flex-1 py-3 bg-white border border-slate-200 text-blue-600 text-[10px] font-black uppercase rounded-xl">Edit</button>
                <button onClick={() => handleDelete(user.id)} className="px-4 py-3 bg-red-50 text-red-500 rounded-xl">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl animate-slide-down">
            <form onSubmit={handleSaveUser} className="p-10 space-y-6">
              <h3 className="text-xl font-black text-slate-800 mb-4">{isAdding ? 'Registrasi Baru' : 'Edit Akses'}</h3>
              <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} placeholder="Nama Lengkap..." />
              <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} placeholder="Username..." />
              <input type="email" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} placeholder="Email..." />
              <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}>
                <option value="Admin">Admin</option>
                <option value="Verificator">Verifikator</option>
                <option value="SuperAdmin">Super Admin</option>
              </select>
              <div className="pt-8 flex space-x-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase">Batal</button>
                <button type="submit" disabled={isSending} className="flex-[2] py-4 bg-blue-600 text-white text-[10px] font-black uppercase rounded-2xl shadow-xl">
                  {isSending ? 'SINKRONISASI...' : 'SIMPAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
