
import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, Loader2, X } from 'lucide-react';
import { addTokens } from '../services/firebaseService';
import { auth } from '../firebase';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setLoading(true);

    // Simulate Stripe Delay
    setTimeout(async () => {
      try {
        if (auth.currentUser) {
          await addTokens(auth.currentUser.uid, 25);
          setStep('success');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        }
      } catch (e) {
        alert('Ödəniş zamanı xəta baş verdi.');
        setLoading(false);
        setStep('form');
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        {step === 'form' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Balans Artır</h2>
              <p className="text-slate-400 mt-2">25 Token üçün <span className="text-white font-bold">10.00 AZN</span> ödəyin</p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kart Sahibi</label>
                <input type="text" placeholder="AD SOYAD" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-500 outline-none mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kart Nömrəsi</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-10 text-white focus:border-teal-500 outline-none mt-1 font-mono" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Bitmə Tarixi</label>
                  <input type="text" placeholder="MM/YY" maxLength={5} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-500 outline-none mt-1 text-center" />
                </div>
                <div className="w-1/3">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">CVC</label>
                  <input type="text" placeholder="123" maxLength={3} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-500 outline-none mt-1 text-center" />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 mt-4 transition-all active:scale-95">
                <Lock className="w-4 h-4" /> 10.00 AZN Ödə
              </button>
              
              <div className="text-center text-[10px] text-slate-500 mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Ödənişlər Stripe Simulator ilə qorunur
              </div>
            </form>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 text-center">
            <Loader2 className="w-16 h-16 text-teal-500 animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Ödəniş Yoxlanılır...</h3>
            <p className="text-slate-400 text-sm">Zəhmət olmasa gözləyin, əməliyyat icra olunur.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center animate-in zoom-in">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Uğurlu Ödəniş!</h3>
            <p className="text-slate-400 text-sm">Balansınıza <span className="text-white font-bold">25 Token</span> əlavə olundu.</p>
          </div>
        )}
      </div>
    </div>
  );
};
