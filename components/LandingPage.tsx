
import React, { useState, useEffect } from 'react';
import { Wand2, Layout, DollarSign, Image as ImageIcon, CheckCircle2, ArrowRight, Camera, Sparkles, Box, Play, ChevronDown, Star, Zap, Shield, ChevronRight } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { PricingPlan } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Sample data for the gallery
const GALLERY_ITEMS = {
  'Qonaq Otağı': 'https://i.ibb.co/1fRbKBD2/renovation-7.jpg',
  'Yataq Otağı': 'https://i.ibb.co/LDqj1cD9/renovation-6.jpg',
  'Mətbəx': 'https://i.ibb.co/GQG4Gz0t/renovation-8.jpg',
  'Ofis': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2670&auto=format&fit=crop',
};

const FAQ_ITEMS = [
  { q: "PodmayakAI necə işləyir?", a: "Siz sadəcə təmirsiz mənzilin şəklini yükləyirsiniz. Bizim Podmayak Neural Engine süni zəkamız otağın ölçülərini, işıqlandırmanı və strukturu analiz edir, sonra isə seçdiyiniz üslubda fotorealistik dizayn və təmir planı hazırlayır." },
  { q: "Smeta nə qədər dəqiqdir?", a: "Smeta Azərbaycan bazarındakı orta material və usta qiymətlərinə əsasən hesablanır. Bu, ilkin büdcə planlaması üçün nəzərdə tutulub və real qiymətlərdən +/- 10-15% fərqlənə bilər." },
  { q: "Hansı üslubları seçə bilərəm?", a: "Platformamızda Modern, Skandinaviya, Loft, Klassik, Neoklassik, Bohem və daha bir çox populyar interyer üslubları mövcuddur." },
  { q: "Xidmət ödənişlidir?", a: "Pulsuz planımızla başlayın. Daha yüksək keyfiyyətli (4K) renderlər, ətraflı smeta və limitsiz tarixçə üçün Pro versiyaya keçə bilərsiniz." }
];

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: '0 ₼',
    features: ['5 Render / ay', 'Standart Keyfiyyət (1K)', 'Əsas Üslublar', 'Reklamlı'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29 ₼ / ay',
    features: ['Limitsiz Render', 'Ultra HD Keyfiyyət (4K)', 'Tam Smeta Analizi', 'Öncəlikli Dəstək', 'Reklamsız'],
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Biznes',
    price: '99 ₼ / ay',
    features: ['Komanda Girişi', 'API Çıxışı', 'Xüsusi Brendinq', 'Şəxsi Menecer'],
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [activeTab, setActiveTab] = useState<keyof typeof GALLERY_ITEMS>('Qonaq Otağı');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-teal-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[20%] w-[20vw] h-[20vw] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-teal-500/20">
              <span className="text-xl">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Podmayak<span className="text-teal-400">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={onGetStarted}
              className="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Daxil Ol
            </button>
            <button 
              onClick={onGetStarted}
              className="group px-5 py-2.5 bg-white text-slate-950 font-bold rounded-full text-sm hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center gap-2"
            >
              Başla <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Hero Text */}
            <div className="lg:w-1/2 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full text-teal-400 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="w-3 h-3" />
                <span>AI Powered Renovation V2.0</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                Təmirsiz Evi <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-indigo-400 to-purple-400">
                  Xəyala Çevir
                </span>
              </h1>
              
              <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                PodmayakAI ilə beton divarlara həyat verin. Şəkil yükləyin, süni zəka saniyələr içində sizə dizayn, büdcə və usta planı hazırlasın.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                <button 
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-lg rounded-2xl transition-all shadow-xl shadow-teal-500/20 hover:scale-105 hover:shadow-teal-500/40 flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Şəkil Yüklə
                </button>
                <button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white font-medium text-lg rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Necə İşləyir?
                </button>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 animate-in fade-in duration-1000 delay-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" /> 10k+ Dizayn
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" /> AI Engine v2.2
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" /> Pulsuz Sınaq
                </div>
              </div>
            </div>

            {/* Interactive Hero Slider (Demo) */}
            <div className="lg:w-1/2 w-full perspective-1000 animate-in fade-in zoom-in duration-1000 delay-300">
               <div className="relative rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl shadow-indigo-500/20 bg-slate-900 aspect-[4/3] group transform transition-transform hover:scale-[1.01] duration-500">
                  <BeforeAfterSlider 
                    originalImage="https://i.ibb.co/JRwkqT1r/66008-f1hpkeb-L9-FYqn-HCOa3o-WQ.jpg"
                    generatedImage="https://i.ibb.co/wNcSV3Km/podmayak-Living-Room-3.jpg"
                  />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl z-20 flex items-center gap-2">
                    <Wand2 className="w-3 h-3 text-teal-400 animate-pulse" />
                    Podmayak Engine
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee of Styles */}
      <section className="py-10 bg-slate-900 border-y border-slate-800 relative z-10 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
        
        <div className="flex gap-8 whitespace-nowrap animate-[scroll_30s_linear_infinite]">
          {[...Array(2)].map((_, i) => (
             <React.Fragment key={i}>
                {["MODERN", "LOFT", "SKANDINAVIYA", "KLASSIK", "MINIMALIST", "NEOKLASSIK", "ART DECO", "BOHEM", "SƏNAYE", "PROVANS"].map((style, idx) => (
                   <div key={idx} className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-700 to-slate-800 px-4">
                      {style}
                   </div>
                ))}
             </React.Fragment>
          ))}
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="how-it-works" className="py-24 relative z-10">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
               <h2 className="text-3xl md:text-5xl font-bold mb-6">Peşəkar Alətlər</h2>
               <p className="text-slate-400 text-lg">Sadəcə şəkil dəyişmək deyil. PodmayakAI tamhüquqlu təmir planlaşdırma platformasıdır.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Large Card 1 */}
               <div className="md:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-8 relative overflow-hidden group hover:border-teal-500/30 transition-all">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] group-hover:bg-teal-500/20 transition-all"></div>
                  <div className="relative z-10">
                     <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-teal-400 border border-slate-700">
                        <DollarSign className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-bold mb-3">Ağıllı Smeta Hesablaması</h3>
                     <p className="text-slate-400 mb-6 max-w-md">Süni zəka otağın kvadratını hesablayır, material sərfiyyatını və bazar qiymətlərini analiz edərək sizə real büdcə təqdim edir.</p>
                     
                     <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 max-w-sm">
                        <div className="flex justify-between items-center mb-3 text-sm">
                           <span className="text-slate-400">Materiallar</span>
                           <span className="text-white font-bold">4,200 ₼</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-teal-500 w-[70%]"></div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Tall Card 2 */}
               <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] group-hover:bg-indigo-500/20 transition-all"></div>
                  <div className="relative z-10">
                     <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-indigo-400 border border-slate-700">
                        <Box className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold mb-3">30+ Mebel və Dekor</h3>
                     <p className="text-slate-400 text-sm mb-4">Divanlar, çılçıraqlar, xalçalar və daha çoxu.</p>
                  </div>
               </div>

               {/* Medium Card 3 */}
               <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 relative overflow-hidden group hover:border-purple-500/30 transition-all">
                  <div className="relative z-10">
                     <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-purple-400 border border-slate-700">
                        <Zap className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold mb-3">Sürətli Render</h3>
                     <p className="text-slate-400 text-sm">Podmayak Flash texnologiyası ilə 5 saniyədən az müddətdə nəticə əldə edin.</p>
                  </div>
               </div>

               {/* Large Card 4 */}
               <div className="md:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-8 relative overflow-hidden group hover:border-teal-500/30 transition-all">
                  <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                     <div className="flex-1">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-teal-400 border border-slate-700">
                           <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Məxfilik və Təhlükəsizlik</h3>
                        <p className="text-slate-400">Sizin ev şəkilləriniz və layihələriniz şifrələnmiş şəkildə saxlanılır. İstənilən vaxt tarixçənizdən silə bilərsiniz.</p>
                     </div>
                     <div className="w-full md:w-1/3">
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 shadow-xl transform md:rotate-3 transition-transform hover:rotate-0">
                           <div className="flex items-center gap-3 mb-3 border-b border-slate-800 pb-3">
                              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold">A</div>
                              <div>
                                 <div className="text-xs font-bold">Əli Məmmədov</div>
                                 <div className="text-[10px] text-slate-500">Premium User</div>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <div className="h-2 bg-slate-800 rounded w-3/4"></div>
                              <div className="h-2 bg-slate-800 rounded w-1/2"></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-900 border-y border-slate-800 relative z-10">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
               <h2 className="text-3xl md:text-5xl font-bold mb-6">Qiymət Planları</h2>
               <p className="text-slate-400">Ehtiyacınıza uyğun planı seçin və təmirə başlayın.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PRICING_PLANS.map((plan) => (
                <div key={plan.id} className={`relative p-8 rounded-3xl border ${plan.recommended ? 'bg-slate-800/80 border-teal-500 shadow-2xl shadow-teal-500/20' : 'bg-slate-950/50 border-slate-800'} flex flex-col`}>
                  {plan.recommended && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-slate-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Ən Populyar
                    </div>
                  )}
                  <h3 className="text-lg font-medium text-slate-400 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-6">{plan.price}</div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                        <CheckCircle2 className={`w-4 h-4 ${plan.recommended ? 'text-teal-400' : 'text-slate-600'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button onClick={onGetStarted} className={`w-full py-4 rounded-xl font-bold transition-all ${plan.recommended ? 'bg-teal-500 hover:bg-teal-400 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
                    Planı Seç
                  </button>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 relative z-10 text-sm text-slate-500">
        <div className="container mx-auto px-6">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400">P</div>
                <span className="font-bold text-slate-300">Podmayak<span className="text-teal-500">AI</span></span>
              </div>
              <div className="flex gap-6">
                 <a href="#" className="hover:text-white transition-colors">Haqqımızda</a>
                 <a href="#" className="hover:text-white transition-colors">Məxfilik</a>
                 <a href="#" className="hover:text-white transition-colors">Əlaqə</a>
              </div>
              <div>© 2025 PodmayakAI. Baku, Azerbaijan.</div>
           </div>
        </div>
      </footer>
    </div>
  );
};
