
import React, { useState, useEffect } from 'react';
import { Shield, Users, Image as ImageIcon, Settings, ArrowLeft, Trash, Save, Search, Zap, DollarSign, Crown, Database } from 'lucide-react';
import { getAllUsers, getAllProjects, updateUserField, deleteProjectFromFirebase, getAdminStats, setSystemConfig } from '../services/firebaseService';
import { seedDatabase } from '../services/contentService';
import { UserProfile, SavedProject, AdminStats } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'projects' | 'config'>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [systemKey, setSystemKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Filters
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [u, p, s] = await Promise.all([
      getAllUsers(),
      getAllProjects(),
      getAdminStats()
    ]);
    setUsers(u);
    setProjects(p);
    setStats(s);
    setLoading(false);
  };

  const handleUpdateRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (confirm(`Rolu ${newRole} olaraq dəyişmək istədiyinizə əminsiniz?`)) {
      await updateUserField(uid, 'role', newRole);
      loadData();
    }
  };

  const handleUpdatePlan = async (uid: string, currentPlan: string) => {
    const newPlan = currentPlan === 'free' ? 'pro' : currentPlan === 'pro' ? 'enterprise' : 'free';
    await updateUserField(uid, 'plan', newPlan);
    loadData();
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Bu layihəni silmək istədiyinizə əminsiniz?')) {
      await deleteProjectFromFirebase(id);
      loadData();
    }
  };

  const handleSaveConfig = async () => {
    await setSystemConfig('apiKey', systemKey);
    alert('Sistem açarı yeniləndi');
    setSystemKey('');
  };

  const handleSeedDatabase = async () => {
    if (confirm("DİQQƏT: Bu əməliyyat verilənlər bazasına ilkin məlumatları (üslublar, otaqlar, mebellər) yazacaq. Davam etmək istəyirsiniz?")) {
      setIsSeeding(true);
      try {
        await seedDatabase();
        alert("Verilənlər bazası uğurla dolduruldu!");
      } catch (e) {
        alert("Xəta baş verdi: " + e);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">Ümumi Gəlir</p>
            <h3 className="text-3xl font-bold text-white">${stats?.totalRevenue}</h3>
          </div>
          <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400"><DollarSign className="w-6 h-6" /></div>
        </div>
        <div className="text-xs text-slate-500">Aktiv abunəliklər əsasında</div>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">İstifadəçilər</p>
            <h3 className="text-3xl font-bold text-white">{stats?.totalUsers}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Users className="w-6 h-6" /></div>
        </div>
        <div className="text-xs text-slate-500">{stats?.proUsers} Pro / Enterprise İstifadəçi</div>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">Generasiyalar</p>
            <h3 className="text-3xl font-bold text-white">{stats?.totalGenerations}</h3>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><ImageIcon className="w-6 h-6" /></div>
        </div>
        <div className="text-xs text-slate-500">Cəmi emal edilmiş şəkillər</div>
      </div>

       <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">Sistem Statusu</p>
            <h3 className="text-xl font-bold text-teal-400">Aktiv</h3>
          </div>
          <div className="p-3 bg-green-500/10 rounded-xl text-green-400"><Zap className="w-6 h-6" /></div>
        </div>
        <div className="text-xs text-slate-500">Podmayak Engine v2.2</div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(u => 
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) || 
      (u.displayName || '').toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
             <input 
               type="text" 
               placeholder="İstifadəçi axtar..." 
               value={userSearch}
               onChange={(e) => setUserSearch(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-teal-500 outline-none"
             />
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">İstifadəçi</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Qoşuldu</th>
                <th className="p-4 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map(user => (
                <tr key={user.uid} className="hover:bg-slate-700/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white text-xs">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.displayName || 'Adsız'}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleUpdateRole(user.uid, user.role)}
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}
                    >
                      {user.role}
                    </button>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleUpdatePlan(user.uid, user.plan)}
                      className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${user.plan === 'free' ? 'bg-slate-600 text-slate-300' : 'bg-indigo-500/20 text-indigo-400'}`}
                    >
                      {user.plan === 'pro' && <Crown className="w-3 h-3" />}
                      {user.plan}
                    </button>
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    {/* Placeholder */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProjects = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {projects.map(p => (
        <div key={p.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden group">
          <div className="relative h-32">
            <img src={p.generatedImage} className="w-full h-full object-cover" />
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleDeleteProject(p.id)} className="p-1 bg-red-500 rounded text-white"><Trash className="w-3 h-3" /></button>
            </div>
            <div className="absolute bottom-1 left-1 bg-black/60 px-1 rounded text-[10px] text-white">
                {p.config.roomType}
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs font-bold text-white truncate">{p.userEmail}</div>
            <div className="text-[10px] text-slate-500">{new Date(p.timestamp).toLocaleDateString()}</div>
            <div className="mt-1 flex gap-1">
              <span className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] text-slate-300">{p.config.style}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderConfig = () => (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* Database Seeding */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Verilənlər Bazası</h3>
        <p className="text-sm text-slate-400 mb-4">
          Tətbiqin işləməsi üçün lazım olan statik məlumatları (üslublar, mebellər, rənglər) bazaya yükləyin. 
          Bunu yalnız bazanın boş olduğu halda edin.
        </p>
        <button 
          onClick={handleSeedDatabase} 
          disabled={isSeeding}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
        >
          {isSeeding ? "Yüklənir..." : <><Database className="w-4 h-4" /> Seed Database (Initial Setup)</>}
        </button>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Qlobal Sistem Açarı</h3>
        <p className="text-sm text-slate-400 mb-4">
          Pulsuz istifadəçilər üçün əsas API açarını təyin edin.
        </p>
        <div className="space-y-4">
          <input 
            type="password" 
            value={systemKey}
            onChange={(e) => setSystemKey(e.target.value)}
            placeholder="API Açarını Daxil Edin"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-teal-500 outline-none"
          />
          <button onClick={handleSaveConfig} className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Konfiqurasiyanı Yadda Saxla
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Admin Header */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-400" /> Podmayak Admin
          </h1>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          v2.2.0-admin
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: <Zap className="w-5 h-5" />, label: 'Panel' },
            { id: 'users', icon: <Users className="w-5 h-5" />, label: 'İstifadəçilər' },
            { id: 'projects', icon: <ImageIcon className="w-5 h-5" />, label: 'Məzmun' },
            { id: 'config', icon: <Settings className="w-5 h-5" />, label: 'Ayarlar' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === item.id ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
           {loading ? (
             <div className="flex items-center justify-center h-full text-slate-500">Məlumatlar yüklənir...</div>
           ) : (
             <>
               {activeTab === 'dashboard' && renderDashboard()}
               {activeTab === 'users' && renderUsers()}
               {activeTab === 'projects' && renderProjects()}
               {activeTab === 'config' && renderConfig()}
             </>
           )}
        </div>
      </div>
    </div>
  );
};
