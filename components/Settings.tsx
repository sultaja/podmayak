
import React, { useEffect, useState } from 'react';
import { LogOut, Key, Info, User, Shield, CreditCard, ChevronRight, Crown } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { getUserProfile, updateUserField } from '../services/firebaseService';
import { UserProfile } from '../types';

interface SettingsProps {
  onOpenAdmin: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onOpenAdmin }) => {
  const user = auth.currentUser;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adminCode, setAdminCode] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user]);

  const handleLogout = () => {
    if (confirm('Çıxış etmək istədiyinizə əminsiniz?')) {
      signOut(auth);
    }
  };

  const handleBecomeAdmin = async () => {
    if (adminCode === 'podmayak_admin' && user) {
      await updateUserField(user.uid, 'role', 'admin');
      alert('Təbrik edirik! Siz artıq Administrator səlahiyyətinə maliksiniz. Səhifəni yeniləyin.');
      window.location.reload();
    } else {
      alert('Yanlış kod.');
    }
  };

  return (
    <div className="h-full bg-slate-950 p-6 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-8 pb-20">
        
        <div className="text-center mb-8" onDoubleClick={() => setShowAdminInput(!showAdminInput)}>
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-2xl mx-auto mb-4 shadow-xl shadow-teal-500/20 flex items-center justify-center text-white font-bold text-2xl">P</div>
          <h1 className="text-2xl font-bold text-white">Podmayak<span className="text-teal-400">AI</span></h1>
          <p className="text-slate-500 text-sm">Versiya 2.2.0 (Pro)</p>
        </div>

        {/* Secret Admin Bootstrap for Demo/Dev */}
        {showAdminInput && profile?.role !== 'admin' && (
          <div className="bg-slate-900 p-4 rounded-xl border border-teal-500/30 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-xs font-bold text-teal-400 uppercase mb-2">Developer Access</h3>
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="Enter Admin Code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button onClick={handleBecomeAdmin} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold">
                Activate
              </button>
            </div>
          </div>
        )}

        {/* Profile */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Profil</h2>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-inner border-2 border-slate-800">
              {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : (user?.email?.[0].toUpperCase() || <User />)}
            </div>
            <div className="flex-1 min-w-0">
               <h3 className="font-bold text-white truncate text-lg">{user?.displayName || 'İstifadəçi'}</h3>
               <div className="text-sm text-slate-400 truncate mb-1">{user?.email}</div>
               <div className="flex items-center gap-2">
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${profile?.plan === 'pro' || profile?.plan === 'enterprise' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400'}`}>
                   {profile?.plan === 'pro' && <Crown className="w-3 h-3" />}
                   {profile?.plan || 'Free'} Plan
                 </span>
                 {profile?.role === 'admin' && (
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 flex items-center gap-1">
                     <Shield className="w-3 h-3" /> Admin
                   </span>
                 )}
               </div>
            </div>
          </div>
        </section>

        {/* Admin Access */}
        {profile?.role === 'admin' && (
          <section>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Administrator</h2>
            <button 
              onClick={onOpenAdmin}
              className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 border border-slate-700 hover:border-teal-500/50 rounded-xl p-4 flex items-center justify-between text-white transition-all shadow-lg group"
            >
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-900 transition-colors">
                   <Shield className="w-5 h-5" />
                 </div>
                 <div className="text-left">
                   <span className="font-bold block">Admin Panel</span>
                   <span className="text-xs text-slate-400">İstifadəçilər və Statistikalar</span>
                 </div>
               </div>
               <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400" />
            </button>
          </section>
        )}

        {/* Account */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Hesab</h2>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800 shadow-sm">
            <div className="p-4 flex items-center gap-4 text-slate-400 hover:bg-slate-800/50 transition-colors cursor-pointer group">
               <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                 <CreditCard className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <div className="text-sm font-medium text-slate-200">Abunəlik Planı</div>
                 <div className="text-xs">Hal-hazırda: <span className="text-white font-bold">{profile?.plan ? profile.plan.toUpperCase() : 'FREE'}</span></div>
               </div>
               <ChevronRight className="w-4 h-4" />
            </div>
            <div className="p-4 flex items-center gap-4 text-slate-400 hover:bg-slate-800/50 transition-colors cursor-pointer group">
               <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-teal-500/10 group-hover:text-teal-400 transition-colors">
                 <Key className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <div className="text-sm font-medium text-slate-200">API Açar</div>
                 <div className="text-xs">Podmayak Engine</div>
               </div>
               <ChevronRight className="w-4 h-4" />
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 text-left hover:bg-red-500/10 transition-colors text-red-400 group">
              <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium">Çıxış Et</span>
            </button>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Haqqında</h2>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden p-5 space-y-4">
             <p className="text-sm text-slate-400 leading-relaxed">
               PodmayakAI təmirsiz mənzillərin potensialını görməyə kömək edir. Podmayak Neural Engine texnologiyası ilə beton divarları xəyalınızdakı evə çevirin.
             </p>
             <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-800 pt-4">
               <Info className="w-3 h-3" />
               <span>Powered by Podmayak AI v2.2.0</span>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
};
