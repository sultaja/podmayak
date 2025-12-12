
import React from 'react';
import { Home, History, MessageSquare, Settings } from 'lucide-react';
import { AppView } from '../types';

interface MobileNavProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onChangeView }) => {
  const navItems: { id: AppView; icon: React.ReactNode; label: string }[] = [
    { id: 'renovator', icon: <Home className="w-5 h-5" />, label: 'Dizayn' },
    { id: 'history', icon: <History className="w-5 h-5" />, label: 'Tarixçə' },
    { id: 'chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Asistent' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Ayarlar' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe-pb z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 ${
                isActive ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-teal-500/10' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
