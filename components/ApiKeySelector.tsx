
import React, { useEffect, useState } from 'react';
import { Key, ExternalLink, RefreshCw } from 'lucide-react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [checking, setChecking] = useState(true);
  const [hasKey, setHasKey] = useState(false);

  const checkKey = async () => {
    setChecking(true);
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
        if (selected) {
          onKeySelected();
        }
      } else {
        // Fallback for dev environments without the special aistudio object
        console.warn("window.aistudio not found. Assuming environment key is present.");
        setHasKey(true);
        onKeySelected();
      }
    } catch (e) {
      console.error("Error checking API key:", e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        await checkKey();
      } catch (e) {
        console.error("Failed to select key:", e);
      }
    }
  };

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mx-auto bg-teal-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Key className="w-8 h-8 text-teal-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Podmayak AI Engine</h2>
        <p className="text-slate-400 mb-6">
          To initialize the high-performance <b>Podmayak Neural Engine</b>, please connect your API account securely.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
          >
            <Key className="w-5 h-5" />
            Connect AI Key
          </button>

          <button 
             onClick={checkKey}
             className="w-full py-2 px-4 bg-transparent hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            I've connected it, check again
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-teal-400 transition-colors flex items-center justify-center gap-1"
          >
            Billing information <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
