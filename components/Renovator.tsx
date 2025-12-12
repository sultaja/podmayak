
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Wand2, Download, Image as ImageIcon, RefreshCcw, ScanLine, Sparkles, Box, Palmtree, Sofa, Briefcase, Coffee, Armchair, Lamp, Tv, FileText, SplitSquareHorizontal, Layout, Camera, MapPin, Calculator, Palette, Save, Info, Layers, Grid, Plus, Ruler, RotateCcw, Monitor, Dumbbell, Book, Film, Warehouse, DoorOpen, Shirt, CircleDollarSign, Zap, Eraser, PenTool, Check, X, MousePointer2, CheckCircle2 } from 'lucide-react';
import { RenovationConfig, RenovatorStyle, RoomType, ImageSize, SavedProject, RenovationAnalysis, FlooringType, RoomDimensions, AppContent, DbPreset } from '../types';
import { generateRenovation, analyzeRenovationPlan, editRenovation } from '../services/geminiService';
import { saveProjectToFirebase, deductToken, getUserProfile } from '../services/firebaseService';
import { fetchAppContent } from '../services/contentService';
import { auth } from '../firebase';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { RenovationDetails } from './RenovationDetails';
import { PaymentModal } from './PaymentModal';
import { getIconComponent } from '../utils/iconMap';

const COUNTRIES = ['Azerbaijan', 'Turkey', 'Russia', 'USA', 'Germany', 'UAE', 'Italy', 'France'];

const InfoTooltip = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block ml-2 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-teal-400 transition-colors">
        <Info className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-xs text-slate-200 p-2 rounded-lg border border-slate-700 shadow-xl z-50 animate-in zoom-in-95 duration-200">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
          </div>
        </>
      )}
    </div>
  );
};

interface RenovatorProps {
  initialProject?: SavedProject | null;
}

export const Renovator: React.FC<RenovatorProps> = ({ initialProject }) => {
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single');
  const [showDetails, setShowDetails] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RenovationAnalysis | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [showAllFurniture, setShowAllFurniture] = useState(false);
  
  // App Content from DB
  const [appContent, setAppContent] = useState<AppContent | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(true);

  // Tab System State
  const [activeTab, setActiveTab] = useState<'style' | 'room' | 'color' | 'furniture' | 'config'>('style');

  // Token System State
  const [tokens, setTokens] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Magic Choose / Edit State
  const [isMagicMode, setIsMagicMode] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [showMagicPopup, setShowMagicPopup] = useState(false);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  
  const [loadingState, setLoadingState] = useState<{
    status: 'idle' | 'analyzing' | 'generating' | 'planning' | 'finishing' | 'editing';
    progress: number;
  }>({ status: 'idle', progress: 0 });

  const [config, setConfig] = useState<RenovationConfig>({
    style: RenovatorStyle.Modern,
    roomType: RoomType.LivingRoom,
    customRoomType: '',
    colorPreference: [],
    flooring: FlooringType.Laminate,
    size: '1K',
    selectedFurniture: [],
    country: 'Azerbaijan',
    includeBlueprint: false, 
    dimensions: { width: '', length: '', area: '' }
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // --- Fetch App Content & Tokens ---
  useEffect(() => {
    const init = async () => {
      // 1. Fetch Tokens
      if (auth.currentUser) {
        const profile = await getUserProfile(auth.currentUser.uid);
        if (profile) setTokens(profile.tokens);
      }
      // 2. Fetch Dynamic Content from DB
      const content = await fetchAppContent();
      setAppContent(content);
      setIsContentLoading(false);
    };
    init();
  }, []);

  const fetchTokens = async () => {
     if (auth.currentUser) {
       const profile = await getUserProfile(auth.currentUser.uid);
       if (profile) setTokens(profile.tokens);
     }
  };

  // --- Load Local Draft on Mount ---
  useEffect(() => {
    const draft = localStorage.getItem('podmayak_draft');
    if (draft && !initialProject) {
      try {
        const parsed = JSON.parse(draft);
        setSelectedImage(parsed.selectedImage);
        setConfig(parsed.config);
      } catch (e) {
        console.error("Failed to load draft");
      }
    }
  }, []);

  // --- Save Draft on Change ---
  useEffect(() => {
    if (selectedImage || config.style !== RenovatorStyle.Modern) {
      localStorage.setItem('podmayak_draft', JSON.stringify({
        selectedImage: selectedImage ? selectedImage.substring(0, 100000) : null,
        config
      }));
    }
  }, [config, selectedImage]);

  // --- Synchronize with History Selection ---
  useEffect(() => {
    if (initialProject && initialProject.id !== lastSavedId) {
      setTimeout(() => {
        setSelectedImage(initialProject.originalImage);
        setGeneratedImage(initialProject.generatedImage);
        setAnalysis(initialProject.analysis || null);
        setConfig(initialProject.config);
        setLastSavedId(initialProject.id);
        setIs3DMode(false);
        setLoadingState({ status: 'idle', progress: 0 });
      }, 50);
    }
  }, [initialProject]);

  const handleSave = async () => {
    if (!selectedImage || !generatedImage) return;
    
    setIsSaving(true);
    try {
      const newId = await saveProjectToFirebase(selectedImage, generatedImage, config, analysis || undefined);
      setLastSavedId(newId);
      alert('Layihə uğurla yadda saxlanıldı!');
      
      if (confirm('Layihə saxlanıldı. Yeni otaq dizayn etmək istəyirsiniz?')) {
        handleReset();
      }
    } catch (e) {
      console.error("Manual save failed", e);
      alert('Yadda saxlama zamanı xəta baş verdi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setAnalysis(null);
    setLastSavedId(null);
    setIsMagicMode(false);
    setMaskDataUrl(null);
    setConfig(prev => ({
       ...prev,
       selectedFurniture: [],
       colorPreference: []
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
        setAnalysis(null);
        setIs3DMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFurniture = (item: string) => {
    setConfig(prev => {
      const current = prev.selectedFurniture || [];
      if (current.includes(item)) {
        return { ...prev, selectedFurniture: current.filter(i => i !== item) };
      } else {
        return { ...prev, selectedFurniture: [...current, item] };
      }
    });
  };

  const toggleColor = (colorValue: string) => {
    setConfig(prev => {
      const current = prev.colorPreference || [];
      if (current.includes(colorValue)) {
        return { ...prev, colorPreference: current.filter(c => c !== colorValue) };
      } else {
        if (current.length >= 3) return prev; 
        return { ...prev, colorPreference: [...current, colorValue] };
      }
    });
  };

  const applyPreset = (preset: DbPreset) => {
    setConfig(prev => ({
      ...prev,
      style: preset.style as RenovatorStyle,
      colorPreference: preset.colors,
      flooring: preset.flooring as FlooringType
    }));
  };

  const clearProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    // TOKEN CHECK
    if (tokens <= 0) {
      setShowPaymentModal(true);
      return;
    }

    if (!auth.currentUser) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setGeneratedImage(null);
    setAnalysis(null);
    setLoadingState({ status: 'analyzing', progress: 5 });
    clearProgress();
    setIs3DMode(false);
    setIsMagicMode(false);

    progressIntervalRef.current = window.setInterval(() => {
      setLoadingState(prev => {
        if (prev.status === 'analyzing') return prev.progress < 30 ? { ...prev, progress: prev.progress + 4 } : { status: 'generating', progress: 30 };
        if (prev.status === 'generating') {
           if (prev.progress < 80) return { ...prev, progress: prev.progress + 1.5 };
           return config.includeBlueprint ? { status: 'planning', progress: 80 } : { status: 'finishing', progress: 95 };
        }
        if (prev.status === 'planning') return prev.progress < 95 ? { ...prev, progress: prev.progress + 0.5 } : prev;
        return prev;
      });
    }, 200);

    try {
      const resultImage = await generateRenovation(selectedImage, config);
      
      // Deduct Token
      const deducted = await deductToken(auth.currentUser.uid);
      if (deducted) setTokens(prev => prev - 1);

      let resultAnalysis;
      if (config.includeBlueprint) {
        setLoadingState(prev => ({ status: 'planning', progress: 85 }));
        resultAnalysis = await analyzeRenovationPlan(selectedImage, resultImage, config);
      }

      clearProgress();
      setLoadingState({ status: 'finishing', progress: 100 });
      
      setTimeout(async () => {
        setGeneratedImage(resultImage);
        if (resultAnalysis) setAnalysis(resultAnalysis);
        setLoadingState({ status: 'idle', progress: 0 });
        // Refresh tokens
        fetchTokens();
      }, 500);
    } catch (error) {
      alert("Xəta baş verdi. Zəhmət olmasa bir daha cəhd edin.");
      clearProgress();
      setLoadingState({ status: 'idle', progress: 0 });
    }
  };

  // Magic Edit Functionality (same as before but simplified for brevity)
  const handleMagicEdit = async () => {
    if (!generatedImage || !maskDataUrl || !magicPrompt) return;
    if (tokens <= 0) { setShowPaymentModal(true); return; }

    setShowMagicPopup(false);
    setLoadingState({ status: 'editing', progress: 0 });
    clearProgress();

    progressIntervalRef.current = window.setInterval(() => {
      setLoadingState(prev => {
        if (prev.progress < 90) return { ...prev, progress: prev.progress + 2 };
        return prev;
      });
    }, 100);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const originalCanvas = canvasRef.current;
      
      if (ctx && originalCanvas) {
        canvas.width = originalCanvas.width;
        canvas.height = originalCanvas.height;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(originalCanvas, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 50) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
        }
        ctx.putImageData(imageData, 0, 0);
        const finalMask = canvas.toDataURL('image/png');
        
        const editedImage = await editRenovation(generatedImage, finalMask, magicPrompt);
        
        if (auth.currentUser) {
           await deductToken(auth.currentUser.uid);
           setTokens(prev => prev - 1);
        }

        setGeneratedImage(editedImage);
        setIsMagicMode(false);
        setMaskDataUrl(null);
        setMagicPrompt('');
      }
    } catch (e) {
      alert("Edit xətası baş verdi.");
    } finally {
      clearProgress();
      setLoadingState({ status: 'idle', progress: 0 });
      fetchTokens();
    }
  };

  // ... (Canvas drawing logic remains identical to previous version) ...
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMagicMode) return;
    setIsDrawing(true);
    draw(e);
  };
  const stopDrawing = () => {
    if (!isMagicMode) return;
    setIsDrawing(false);
    if (canvasRef.current) setMaskDataUrl(canvasRef.current.toDataURL());
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; } 
    else { clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY; }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const handleDrawStart = (e: React.MouseEvent | React.TouchEvent) => {
     if (!isMagicMode) return;
     const canvas = canvasRef.current;
     const ctx = canvas?.getContext('2d');
     ctx?.beginPath();
     startDrawing(e);
  };
  const clearCanvas = () => {
     const canvas = canvasRef.current;
     const ctx = canvas?.getContext('2d');
     if (canvas && ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); setMaskDataUrl(null); }
  };
  // ... (End Canvas logic) ...

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3DMode || isMagicMode || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateX = -((y - centerY) / centerY) * 15;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => { if (is3DMode) setRotation({ x: 0, y: 0 }); };
  useEffect(() => { return () => clearProgress(); }, []);

  const getLoadingMessage = () => {
    switch (loadingState.status) {
      case 'analyzing': return 'Otaq ölçüləri və işıqlandırma analiz edilir...';
      case 'generating': return `${config.flooring} döşəmə və ${config.style} detallar tətbiq olunur...`;
      case 'planning': return `${config.country} bazar qiymətləri hesablanır...`;
      case 'finishing': return 'Son render tamamlanır...';
      case 'editing': return 'Seçilmiş hissə yenidən qurulur...';
      default: return '';
    }
  };

  const handleDimensionChange = (key: keyof RoomDimensions, val: string) => {
    setConfig(prev => {
        const newDims = { ...prev.dimensions, [key]: val };
        if (key !== 'area' && newDims.width && newDims.length) {
            const w = parseFloat(newDims.width);
            const l = parseFloat(newDims.length);
            if (!isNaN(w) && !isNaN(l)) {
                newDims.area = (w * l).toFixed(1);
            }
        }
        return { ...prev, dimensions: newDims };
    });
  };

  const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex flex-col items-center justify-center p-2 min-w-[64px] rounded-xl transition-all ${activeTab === id ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {icon}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );

  // Filter Furniture based on Room Type from DB
  const getFurnitureForRoom = () => {
    if (!appContent) return [];
    if (showAllFurniture) return appContent.furniture;
    
    return appContent.furniture.filter(f => 
       f.roomTypes.includes('all') || f.roomTypes.includes(config.roomType)
    );
  };

  if (isContentLoading) {
    return <div className="h-full flex items-center justify-center text-teal-500">Yüklənir...</div>;
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-950 overflow-hidden">
      
      {/* --- Main Visual Area (Image) --- */}
      <div className={`relative w-full md:w-2/3 bg-black flex flex-col justify-center items-center overflow-hidden transition-all duration-500 ${!selectedImage ? 'h-[40vh] md:h-full' : 'h-[50vh] md:h-full'}`}>
        
        {/* Token Badge */}
        <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2 shadow-xl cursor-pointer hover:border-teal-500 transition-colors" onClick={() => setShowPaymentModal(true)}>
           <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-slate-900 font-bold text-xs">
              <CircleDollarSign className="w-4 h-4" />
           </div>
           <span className={`text-sm font-bold ${tokens === 0 ? 'text-red-400' : 'text-white'}`}>{tokens} Token</span>
           <div className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center ml-1">
             <Plus className="w-3 h-3 text-teal-400" />
           </div>
        </div>

        {!selectedImage && !generatedImage && (
          <div className="text-center p-8 animate-in fade-in zoom-in duration-300">
             <div className="flex gap-4 justify-center mb-6">
                <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 bg-slate-800 hover:bg-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95 group">
                  <Upload className="w-8 h-8 text-teal-400 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-[10px] font-medium text-slate-400">Yüklə</span>
                </button>
                <button onClick={() => cameraInputRef.current?.click()} className="w-20 h-20 bg-slate-800 hover:bg-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95 group">
                  <Camera className="w-8 h-8 text-indigo-400 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-[10px] font-medium text-slate-400">Kamera</span>
                </button>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Şəkil Çək</h3>
             <p className="text-slate-400 text-sm max-w-xs mx-auto">Təmirsiz otağın şəklini çəkin və ya yükləyin.</p>
          </div>
        )}

        {(selectedImage || generatedImage) && (
           <div ref={imageContainerRef} className="relative w-full h-full group bg-slate-900 perspective-1000" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ perspective: '1000px' }}>
             
             {/* Magic Mode Canvas Overlay */}
             {isMagicMode && generatedImage && (
               <div className="absolute inset-0 z-40 flex items-center justify-center">
                   <canvas
                     ref={canvasRef}
                     width={1024}
                     height={1024}
                     className="absolute inset-0 w-full h-full object-contain touch-none cursor-crosshair"
                     onMouseDown={handleDrawStart}
                     onMouseMove={draw}
                     onMouseUp={stopDrawing}
                     onTouchStart={handleDrawStart}
                     onTouchMove={draw}
                     onTouchEnd={stopDrawing}
                     style={{ zIndex: 40 }}
                   />
               </div>
             )}

             {/* Magic Controls */}
             {isMagicMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 animate-in slide-in-from-top-4">
                   <div className="bg-slate-800/90 backdrop-blur rounded-full p-1 border border-slate-700 flex items-center shadow-xl">
                      <button onClick={clearCanvas} className="p-2 hover:bg-slate-700 rounded-full text-slate-300" title="Təmizlə">
                         <Eraser className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-slate-700 mx-1"></div>
                      <button onClick={() => setBrushSize(10)} className={`p-2 rounded-full ${brushSize === 10 ? 'bg-teal-500 text-white' : 'text-slate-300'}`}><div className="w-1.5 h-1.5 rounded-full bg-current" /></button>
                      <button onClick={() => setBrushSize(30)} className={`p-2 rounded-full ${brushSize === 30 ? 'bg-teal-500 text-white' : 'text-slate-300'}`}><div className="w-3 h-3 rounded-full bg-current" /></button>
                      <button onClick={() => setBrushSize(60)} className={`p-2 rounded-full ${brushSize === 60 ? 'bg-teal-500 text-white' : 'text-slate-300'}`}><div className="w-5 h-5 rounded-full bg-current" /></button>
                      <div className="w-px h-4 bg-slate-700 mx-1"></div>
                      <button onClick={() => setIsMagicMode(false)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-full">
                         <X className="w-4 h-4" />
                      </button>
                   </div>
                   
                   {maskDataUrl && (
                      <button 
                        onClick={() => setShowMagicPopup(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-full text-sm font-bold shadow-xl animate-bounce"
                      >
                        Edit Selection
                      </button>
                   )}
                </div>
             )}
             
             {/* Magic Popup Input */}
             {showMagicPopup && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 animate-in zoom-in duration-200">
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase text-teal-400 flex items-center gap-1"><Wand2 className="w-3 h-3" /> Magic Edit</span>
                      <button onClick={() => setShowMagicPopup(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                   </div>
                   <textarea
                     value={magicPrompt}
                     onChange={(e) => setMagicPrompt(e.target.value)}
                     placeholder="Məs: Buranı sil, qırmızı divan qoy, rəngi dəyiş..."
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-teal-500 outline-none resize-none h-20 mb-3"
                   />
                   <button 
                     onClick={handleMagicEdit}
                     disabled={!magicPrompt.trim()}
                     className="w-full py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold rounded-lg text-xs"
                   >
                     Dəyişdir (1 Token)
                   </button>
                </div>
             )}

             {generatedImage && selectedImage && viewMode === 'compare' ? (
               <BeforeAfterSlider originalImage={selectedImage} generatedImage={generatedImage} />
             ) : (
               <div className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out" style={is3DMode ? { transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(0.9)`, transformStyle: 'preserve-3d' } : {}}>
                 <img src={generatedImage || selectedImage || ''} alt="Preview" className={`max-w-full max-h-full object-contain transition-all duration-700 ${loadingState.status !== 'idle' ? 'scale-[1.02] blur-sm opacity-50' : ''} ${is3DMode ? 'shadow-2xl shadow-black rounded-lg' : ''}`} />
               </div>
             )}
             
             {loadingState.status === 'idle' && !isMagicMode && (
               <div className="absolute top-4 right-4 flex gap-2 z-20 flex-wrap justify-end pointer-events-none">
                  <div className="pointer-events-auto flex gap-2">
                    {generatedImage && (
                       <>
                         <button onClick={() => { setIsMagicMode(true); setIs3DMode(false); }} className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg transition-colors font-medium text-xs">
                            <Wand2 className="w-4 h-4" /> Magic
                         </button>
                         <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-lg transition-colors font-medium text-xs">
                            <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} /> 
                            {isSaving ? 'Saxlanılır...' : 'Yadda Saxla'}
                         </button>
                       </>
                    )}
                    {generatedImage && (
                      <div className="flex bg-slate-900/80 backdrop-blur rounded-lg p-1 border border-slate-700 shadow-xl">
                        <button onClick={() => { setViewMode('single'); setIs3DMode(false); }} className={`p-2 rounded-md transition-colors ${viewMode === 'single' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'}`}><Layout className="w-4 h-4" /></button>
                        <button onClick={() => { setViewMode('compare'); setIs3DMode(false); }} className={`p-2 rounded-md transition-colors ${viewMode === 'compare' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'}`}><SplitSquareHorizontal className="w-4 h-4" /></button>
                      </div>
                    )}
                    <button onClick={handleReset} className="p-2 bg-black/50 hover:bg-red-500 text-white rounded-lg backdrop-blur transition-colors" title="Yenidən Başla">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    {generatedImage && (
                      <>
                        {analysis && <button onClick={() => setShowDetails(true)} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg font-medium text-xs transition-colors"><FileText className="w-4 h-4" /> Smeta</button>}
                        <a href={generatedImage} download={`podmayak_${config.roomType}.png`} className="p-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg shadow-lg transition-colors"><Download className="w-4 h-4" /></a>
                      </>
                    )}
                  </div>
               </div>
             )}
             
             {loadingState.status !== 'idle' && (
               <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6">
                  <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center">
                     <div className="mb-6 relative inline-flex">
                        <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full animate-pulse"></div>
                        <Wand2 className="w-12 h-12 text-teal-400 relative z-10 animate-spin" />
                     </div>
                     <h3 className="text-white font-bold text-lg mb-1">
                        {loadingState.status === 'planning' ? 'Smeta Hazırlanır' : loadingState.status === 'editing' ? 'Sehrli Dəyişiklik Edilir' : 'Dizayn Edilir'}
                     </h3>
                     <p className="text-slate-400 text-xs mb-4">{getLoadingMessage()}</p>
                     <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${loadingState.progress}%` }} />
                     </div>
                  </div>
               </div>
             )}
           </div>
        )}
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileChange} />
      </div>

      {/* --- Tabbed Control Panel (Mobile Friendly) --- */}
      <div className="flex-1 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Tab Header (Scrollable on small screens) */}
        <div className="flex items-center justify-between p-2 border-b border-slate-800 bg-slate-950/50 overflow-x-auto scrollbar-hide">
          <TabButton id="style" label="Üslub" icon={<Briefcase className="w-5 h-5" />} />
          <TabButton id="room" label="Otaq" icon={<Layout className="w-5 h-5" />} />
          <TabButton id="color" label="Rəng" icon={<Palette className="w-5 h-5" />} />
          <TabButton id="furniture" label="Mebel" icon={<Sofa className="w-5 h-5" />} />
          <TabButton id="config" label="Detallar" icon={<Ruler className="w-5 h-5" />} />
        </div>

        {/* Tab Content (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* STYLE TAB */}
          {activeTab === 'style' && appContent && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Hazır Styllər</label>
                   <div className="grid grid-cols-2 gap-3">
                      {appContent.presets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${config.style === preset.style ? 'bg-teal-500/10 border-teal-500/50' : 'bg-slate-800 border-slate-700'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.style === preset.style ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                             {getIconComponent(preset.icon)}
                          </div>
                          <span className={`text-xs font-bold ${config.style === preset.style ? 'text-teal-400' : 'text-slate-400'}`}>{preset.name}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Bütün Üslublar</label>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {appContent.styles.map((style) => (
                         <button 
                            key={style.id} 
                            onClick={() => setConfig({...config, style: style.value as RenovatorStyle})}
                            className={`p-2 rounded-lg text-xs font-medium border transition-all ${config.style === style.value ? 'bg-teal-500 text-white border-teal-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                         >
                            {style.label}
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {/* ROOM TAB */}
          {activeTab === 'room' && appContent && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Otaq Növü</label>
                  <div className="grid grid-cols-2 gap-3">
                     {appContent.rooms.map((room) => (
                        <button 
                           key={room.id} 
                           onClick={() => setConfig({ ...config, roomType: room.value as RoomType, selectedFurniture: [] })}
                           className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${config.roomType === room.value ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                        >
                           <span className="text-xs font-bold">{room.label}</span>
                           {config.roomType === room.value && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                     ))}
                  </div>
               </div>
               {config.roomType === RoomType.Other && (
                  <input type="text" placeholder="Məs: Kitabxana" value={config.customRoomType || ''} onChange={(e) => setConfig({ ...config, customRoomType: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-teal-500 outline-none" />
               )}
            </div>
          )}

          {/* COLOR TAB */}
          {activeTab === 'color' && appContent && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Döşəmə</label>
                   <div className="grid grid-cols-3 gap-2">
                     {appContent.flooring.map((f) => (
                        <button 
                           key={f.id} 
                           onClick={() => setConfig({...config, flooring: f.value as FlooringType})}
                           className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-2 ${config.flooring === f.value ? 'bg-slate-800 border-teal-500 shadow-lg shadow-teal-500/10' : 'border-slate-800 bg-slate-950 opacity-60 hover:opacity-100'}`}
                        >
                           <div className={`w-full h-6 rounded ${f.colorClass} shadow-inner`}></div>
                           <span className={`text-[9px] font-bold ${config.flooring === f.value ? 'text-teal-400' : 'text-slate-400'}`}>{f.label}</span>
                        </button>
                     ))}
                   </div>
                </div>

                <div>
                   <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-slate-500 uppercase">Rəng Palitrası</label>
                      <span className="text-[10px] text-slate-500">{config.colorPreference.length}/3 Seçilib</span>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                     {appContent.colors.map((color) => {
                       const isSelected = config.colorPreference?.includes(color.value);
                       return (
                         <button
                           key={color.id}
                           onClick={() => toggleColor(color.value)}
                           className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                             isSelected ? 'border-teal-500 bg-teal-500/10 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'
                           }`}
                         >
                           <span className={`w-3 h-3 rounded-full ${color.bgClass} shadow-sm border border-white/10`} />
                           {color.name}
                         </button>
                       );
                     })}
                   </div>
                </div>
             </div>
          )}

          {/* FURNITURE TAB */}
          {activeTab === 'furniture' && appContent && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center mb-3 justify-between">
                   <label className="text-xs font-bold text-slate-500 uppercase">Mebel Seçimi</label>
                   <button onClick={() => setShowAllFurniture(!showAllFurniture)} className="text-[10px] text-teal-400 font-bold hover:underline">
                      {showAllFurniture ? 'Daha Az' : 'Hamısını Göstər'}
                   </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   {getFurnitureForRoom().map((item, idx) => {
                      const isSelected = config.selectedFurniture?.includes(item.id);
                      return (
                        <button key={`${item.id}-${idx}`} onClick={() => toggleFurniture(item.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}>
                           {getIconComponent(item.icon)}
                           <span className="text-xs font-medium leading-tight">{item.label}</span>
                        </button>
                      );
                   })}
                </div>
             </div>
          )}

          {/* CONFIG TAB */}
          {activeTab === 'config' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 space-y-3">
                   <div className="flex items-center gap-2 mb-1">
                       <Ruler className="w-4 h-4 text-slate-400" />
                       <label className="text-xs font-bold text-slate-500 uppercase">Ölçülər</label>
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                       <div>
                          <span className="text-[9px] text-slate-500 block mb-1">En (m)</span>
                          <input type="number" value={config.dimensions?.width} onChange={(e) => handleDimensionChange('width', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="0" />
                       </div>
                       <div>
                          <span className="text-[9px] text-slate-500 block mb-1">Uzunluq (m)</span>
                          <input type="number" value={config.dimensions?.length} onChange={(e) => handleDimensionChange('length', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="0" />
                       </div>
                       <div>
                          <span className="text-[9px] text-slate-500 block mb-1">Sahə (m²)</span>
                          <input type="number" value={config.dimensions?.area} onChange={(e) => handleDimensionChange('area', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="0" />
                       </div>
                   </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="p-1.5 bg-indigo-500/20 rounded-md text-indigo-400"><Calculator className="w-4 h-4" /></div>
                         <label className="text-sm font-bold text-slate-300">Smeta və Plan (AI)</label>
                      </div>
                      <button onClick={() => setConfig({...config, includeBlueprint: !config.includeBlueprint})} className={`w-11 h-6 rounded-full transition-colors relative ${config.includeBlueprint ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${config.includeBlueprint ? 'left-6' : 'left-1'}`} />
                      </button>
                   </div>
                   {config.includeBlueprint && (
                     <div className="animate-in slide-in-from-top-2 duration-200">
                       <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                         <MapPin className="w-3 h-3" /> Region 
                       </label>
                       <select value={config.country} onChange={(e) => setConfig({ ...config, country: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 outline-none">
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                     </div>
                   )}
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Keyfiyyət</label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                     {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                       <button key={size} onClick={() => setConfig({ ...config, size })} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${config.size === size ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>{size}</button>
                     ))}
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Generate Button (Sticky Bottom) */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 z-10 pb-safe-pb">
           {tokens <= 0 ? (
             <button onClick={() => setShowPaymentModal(true)} className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-500/20">
               <CircleDollarSign className="w-5 h-5" /> Balans Bitdi - Artır
             </button>
           ) : (
             <button onClick={handleGenerate} disabled={!selectedImage || loadingState.status !== 'idle'} className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${!selectedImage || loadingState.status !== 'idle' ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-teal-500 to-indigo-600 shadow-indigo-500/25'}`}>
                {loadingState.status !== 'idle' ? <span className="animate-pulse">Gözləyin...</span> : <><Wand2 className="w-5 h-5" /> Dizayn Et (1 Token)</>}
              </button>
           )}
        </div>
      </div>
      
      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} onSuccess={() => { fetchTokens(); }} />}
      {showDetails && analysis && <RenovationDetails analysis={analysis} onClose={() => setShowDetails(false)} />}
    </div>
  );
};
