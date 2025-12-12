
import React from 'react';
import { DollarSign, Hammer, ShoppingBag, Lightbulb, CheckCircle2, X } from 'lucide-react';
import { RenovationAnalysis } from '../types';

interface RenovationDetailsProps {
  analysis: RenovationAnalysis;
  onClose: () => void;
}

export const RenovationDetails: React.FC<RenovationDetailsProps> = ({ analysis, onClose }) => {
  return (
    <div className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Hammer className="w-5 h-5" />
              </span>
              Renovation Blueprint
            </h2>
            <p className="text-sm text-slate-400 mt-1">AI Estimation & Material List</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-600">
          
          {/* Budget Card */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 rounded-xl border border-slate-600">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-slate-200">Estimated Budget</h3>
            </div>
            <p className="text-2xl font-bold text-white">{analysis.estimatedBudgetRange}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className={`px-2 py-0.5 rounded-full border ${
                analysis.difficultyLevel === 'Asan' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                analysis.difficultyLevel === 'Orta' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                'border-red-500/30 text-red-400 bg-red-500/10'
              }`}>
                {analysis.difficultyLevel} Difficulty
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Materials */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Hammer className="w-4 h-4" /> Materials
              </h3>
              <ul className="space-y-2">
                {analysis.materials.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-700/30 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Furniture */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Shopping List
              </h3>
              <ul className="space-y-2">
                {analysis.furnitureToBuy.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-700/30 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Execution Plan
            </h3>
            <div className="space-y-3">
              {analysis.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0 border border-slate-600">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-300 pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800 text-center text-xs text-slate-500">
          AI estimates are approximate. Always consult a professional contractor.
        </div>
      </div>
    </div>
  );
};
