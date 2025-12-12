
import React, { useEffect, useState } from 'react';
import { History, Calendar, Trash, ChevronRight, Loader2, ArrowUpRight } from 'lucide-react';
import { SavedProject } from '../types';
import { getUserHistoryFromFirebase, deleteProjectFromFirebase } from '../services/firebaseService';

interface HistoryViewProps {
  onLoadProject: (project: SavedProject) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onLoadProject }) => {
  const [history, setHistory] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getUserHistoryFromFirebase();
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const deleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Bu layihəni silmək istədiyinizə əminsiniz?')) {
      await deleteProjectFromFirebase(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-teal-400 animate-spin" /></div>;

  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
          <History className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-xl font-bold text-slate-300 mb-2">Hələ tarixçə yoxdur</h3>
        <p className="text-sm max-w-xs mx-auto">İlk dizaynınızı yaradın və o avtomatik olaraq bura düşəcək.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <History className="w-6 h-6 text-teal-400" />
          Layihə Tarixçəsi
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {history.map((project) => (
            <div 
              key={project.id} 
              className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-900/20 transition-all duration-300 flex flex-col"
            >
              <div className="h-48 relative flex cursor-pointer" onClick={() => onLoadProject(project)}>
                 <div className="w-1/2 relative overflow-hidden">
                    <img src={project.originalImage} className="w-full h-full object-cover opacity-80" alt="Əvvəl" />
                    <div className="absolute top-2 left-2 text-[10px] font-bold bg-black/50 backdrop-blur px-1.5 py-0.5 rounded text-white">ƏVVƏL</div>
                 </div>
                 <div className="w-1/2 relative overflow-hidden">
                    <img src={project.generatedImage} className="w-full h-full object-cover" alt="Sonra" />
                    <div className="absolute top-2 right-2 text-[10px] font-bold bg-teal-500/90 backdrop-blur px-1.5 py-0.5 rounded text-white">SONRA</div>
                 </div>
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur p-2 rounded-full border border-white/20">
                        <ArrowUpRight className="w-6 h-6 text-white" />
                    </div>
                 </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-200">{project.config.style}</h3>
                    <div className="text-sm text-teal-400 font-medium">{project.config.roomType}</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <button onClick={(e) => deleteProject(e, project.id)} className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                   <span className="text-slate-500">{project.analysis?.estimatedBudgetRange || 'Büdcə yoxdur'}</span>
                   <button onClick={() => onLoadProject(project)} className="flex items-center text-teal-400 font-medium hover:underline">
                     Yüklə <ChevronRight className="w-3 h-3 ml-0.5" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
