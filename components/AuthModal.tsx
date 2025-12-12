import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, ArrowRight, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      
      // Generic handling for newer Firebase SDKs that mask specific errors
      if (err.code === 'auth/invalid-credential') {
        if (isLogin) {
          setError('Email və ya şifrə yanlışdır. Zəhmət olmasa məlumatları yoxlayın.');
        } else {
          setError('Bu email ilə qeydiyyat mümkün olmadı. Başqa email yoxlayın.');
        }
      } else if (err.code === 'auth/user-not-found') {
        setError('İstifadəçi tapılmadı. Zəhmət olmasa qeydiyyatdan keçin.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Şifrə yanlışdır.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Bu email artıq istifadə olunur. Giriş etməyə çalışın.');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifrə çox zəifdir. Ən azı 6 simvol olmalıdır.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('İnternet bağlantısını yoxlayın.');
      } else {
        setError('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isLogin ? <LogIn className="w-5 h-5 text-teal-400" /> : <UserPlus className="w-5 h-5 text-teal-400" />}
            {isLogin ? 'Xoş Gəldiniz' : 'Hesab Yarat'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-teal-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="nümunə@mail.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Şifrə</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-teal-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-teal-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Daxil Ol' : 'Qeydiyyatdan Keç')}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Seçim</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all border border-slate-700"
          >
            {isLogin ? "Hesabınız yoxdur? Qeydiyyatdan Keçin" : "Artıq hesabınız var? Giriş Edin"}
          </button>
        </form>
      </div>
    </div>
  );
};