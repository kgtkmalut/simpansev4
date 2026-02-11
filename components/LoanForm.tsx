
import React, { useState, useRef, useEffect } from 'react';
import { Item, BorrowerType, Loan } from '../types';

interface LoanFormProps {
  item: Item;
  allLoans: Loan[];
  prefillData?: Partial<Loan> | null;
  onSubmit: (formData: any, status: 'Pending' | 'Queued') => void;
  onCancel: () => void;
}

export const LoanForm: React.FC<LoanFormProps> = ({ item, allLoans, prefillData, onSubmit, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [borrowCount, setBorrowCount] = useState(0);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  
  const [formData, setFormData] = useState({
    borrowerName: '',
    borrowerNIK: '',
    borrowerAddress: '',
    idCardPhoto: '',
    borrowerType: 'Pribadi' as BorrowerType,
    instanceName: '',
    instanceAddress: '',
    instancePhone: '',
    instanceEmail: '',
    borrowerEmail: '',
    borrowerPhone: '',
    purpose: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    quantity: 1,
    termsAccepted: false
  });

  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        ...prefillData,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        purpose: '',
        termsAccepted: false
      }));
      setIsAutoFilled(true);
      if (prefillData.signature) {
        setTimeout(() => drawSignatureFromData(prefillData.signature!), 500);
      }
      
      const history = allLoans.filter(l => 
        l.borrowerEmail.toLowerCase() === prefillData.borrowerEmail?.toLowerCase() && 
        l.itemId === item.id && 
        (l.status === 'Approved' || l.status === 'Returned')
      ).length;
      setBorrowCount(history);
    }
  }, [prefillData]);

  const handleIdCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, idCardPhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const drawSignatureFromData = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx && dataUrl) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          setHasSignature(true);
        };
        img.src = dataUrl;
      }
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };
  const stopDrawing = () => setIsDrawing(false);
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    if (!hasSignature) setHasSignature(true);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      setHasSignature(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent, status: 'Pending' | 'Queued') => {
    e.preventDefault();
    if (status === 'Pending' && (!formData.termsAccepted || !hasSignature)) return;
    const signatureBase64 = canvasRef.current?.toDataURL() || '';
    onSubmit({ ...formData, itemId: item.id, itemName: item.name, signature: signatureBase64 }, status);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-slide-down border-4 border-white">
        <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Formulir Peminjaman</h2>
              {isAutoFilled && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                  Profil Teridentifikasi ✓
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 font-medium">Aset: <span className="text-blue-600 font-bold">{item.name}</span></p>
          </div>
          <button onClick={onCancel} className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
               <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Kontak & Identitas</h3>
            </div>
            <div className="relative">
              <input type="email" required readOnly={!!prefillData} className={`w-full px-5 py-4 ${!!prefillData ? 'bg-slate-100' : 'bg-blue-50/50'} border-2 border-blue-100 rounded-2xl outline-none font-bold text-blue-900 placeholder:text-blue-300`} value={formData.borrowerEmail} onChange={(e) => setFormData({...formData, borrowerEmail: e.target.value})} placeholder="Email..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nama Lengkap</label>
                <input required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.borrowerName} onChange={(e) => setFormData({...formData, borrowerName: e.target.value})} placeholder="Sesuai KTP" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">NIP / NIK</label>
                <input required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" value={formData.borrowerNIK} onChange={(e) => setFormData({...formData, borrowerNIK: e.target.value})} placeholder="Nomor Induk" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Alamat Lengkap Peminjam</label>
              <textarea required rows={2} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all font-bold" value={formData.borrowerAddress} onChange={(e) => setFormData({...formData, borrowerAddress: e.target.value})} placeholder="Alamat Domisili..." />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto KTP / Kartu Identitas</label>
                <span className="text-[8px] font-black text-blue-500 uppercase flex items-center"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" /></svg> Auto-Sync Drive</span>
              </div>
              <div className="relative group w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all hover:border-blue-300">
                {formData.idCardPhoto ? (
                  <img src={formData.idCardPhoto} className="w-full h-full object-contain" alt="KTP Preview" />
                ) : (
                  <div className="text-center text-slate-300">
                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-[10px] font-black uppercase">Unggah Identitas Baru</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleIdCardUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <p className="text-[9px] text-slate-400 font-bold italic ml-1">Penyimpanan Otomatis: Drive/1dX7v9.../{new Date().toLocaleString('id-ID', { month: 'long' })}/{formData.borrowerName || 'User'}.jpg</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-l-4 border-slate-800 pl-3">Konfigurasi Peminjaman</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">No. WhatsApp</label><input required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.borrowerPhone} onChange={(e) => setFormData({...formData, borrowerPhone: e.target.value})} placeholder="08..." /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Jumlah Unit</label><input type="number" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-blue-600" value={formData.quantity} min={1} max={item.availableQuantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mulai</label><input type="date" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Selesai</label><input type="date" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} /></div>
            </div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tujuan Peminjaman</label><textarea required rows={3} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none resize-none font-bold" value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} placeholder="Contoh: Kegiatan Workshop Guru KGTK..." /></div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-l-4 border-slate-800 pl-3">Tanda Tangan Elektronik</h3>
            <div className="relative group">
              <canvas ref={canvasRef} width={600} height={200} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseMove={draw} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw} className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl cursor-crosshair transition-colors group-hover:border-blue-300" />
              <div className="absolute top-4 right-4 flex space-x-2"><button type="button" onClick={clearSignature} className="px-3 py-1.5 bg-white shadow-sm border border-slate-100 rounded-xl text-[10px] font-bold text-red-500 hover:bg-red-50 transition-all uppercase">Ganti</button></div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100"><label className="flex items-start cursor-pointer group"><div className="relative flex items-center"><input type="checkbox" className="w-6 h-6 border-2 border-slate-200 rounded-lg text-blue-600" checked={formData.termsAccepted} onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})} /></div><span className="ml-4 text-[11px] text-slate-500 leading-relaxed font-bold">Saya <span className="text-blue-600 uppercase">{formData.borrowerName || '(Peminjam)'}</span> bertanggung jawab atas kondisi barang selama masa peminjaman.</span></label></div>

          <div className="flex flex-col space-y-3 pt-4">
            <div className="flex space-x-3">
              <button type="button" onClick={(e) => handleFormSubmit(e, 'Queued')} className="flex-1 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest">Pinjam Nanti</button>
              <button type="button" onClick={(e) => handleFormSubmit(e, 'Pending')} disabled={!formData.termsAccepted || !hasSignature} className={`flex-[2] py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl ${formData.termsAccepted && hasSignature ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'}`}>Kirim Pengajuan</button>
            </div>
            <button type="button" onClick={onCancel} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">Batalkan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
