
import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, Settings as SettingsIcon, History, Loader2, Shield } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';
import { syncUserProfile } from './services/firebaseService';
import { Renovator } from './components/Renovator';
import { ChatInterface } from './components/ChatInterface';
import { ApiKeySelector } from './components/ApiKeySelector';
import { MobileNav } from './components/MobileNav';
import { HistoryView } from './components/HistoryView';
import { Settings } from './components/Settings';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { AppView, SavedProject } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [activeView, setActiveView] = useState<AppView>('renovator');
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [currentProject, setCurrentProject] = useState<SavedProject | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadProject = (project: SavedProject) => {
    setCurrentProject(project);
    setActiveView('renovator');
  };

  if (authLoading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-teal-500"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  if (!user) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuthModal(true)} />
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />}
      </>
    );
  }

  if (activeView === 'admin') {
    return <AdminPanel onBack={() => setActiveView('settings')} />;
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans selection:bg-teal-500/30 overflow-hidden">
      <ApiKeySelector onKeySelected={() => setApiKeyReady(true)} />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center">
              <Home className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white tracking-tight">Podmayak<span className="text-teal-400">AI</span></h1>
              <p className="text-xs text-slate-500">Pro Edition</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button onClick={() => setActiveView('renovator')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'renovator' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <Home className="w-5 h-5" /> Dizayn
            </button>
            <button onClick={() => setActiveView('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'history' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <History className="w-5 h-5" /> Tarixçə
            </button>
            <button onClick={() => setActiveView('chat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'chat' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <MessageSquare className="w-5 h-5" /> Asistent
            </button>
            <button onClick={() => setActiveView('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'settings' ? 'bg-slate-700/50 text-slate-200' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <SettingsIcon className="w-5 h-5" /> Ayarlar
            </button>
          </nav>
        </div>
      </div>

      <main className="flex-1 overflow-hidden relative pb-16 md:pb-0 h-full">
        {!apiKeyReady ? (
          <div className="h-full flex items-center justify-center flex-col gap-4">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-slate-500 font-mono text-sm">Podmayak Engine qoşulur...</div>
          </div>
        ) : (
          <>
            <div className="h-full w-full" style={{ display: activeView === 'renovator' ? 'block' : 'none' }}>
              <Renovator initialProject={currentProject} />
            </div>
            
            {activeView === 'history' && <HistoryView onLoadProject={loadProject} />}
            {activeView === 'chat' && <ChatInterface />}
            {activeView === 'settings' && <Settings onOpenAdmin={() => setActiveView('admin')} />}
          </>
        )}
      </main>

      <MobileNav currentView={activeView} onChangeView={setActiveView} />
    </div>
  );
}

export default App;
