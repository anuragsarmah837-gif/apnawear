import React from 'react';
import { Sparkles, Check, User, Camera, ArrowRight, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface VirtualTryOnProps {
  darkMode: boolean;
  catalog: Product[];
}

const CONSTANT_AVATARS = [
  { id: 'av1', name: 'Priya (Classic Women)', gender: 'Women', height: "5'4\"", size: 'M', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: 'av2', name: 'Amit (Active Men)', gender: 'Men', height: "5'11\"", size: 'L', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: 'av3', name: 'Sneha (College Women)', gender: 'Women', height: "5'2\"", size: 'S', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' },
  { id: 'av4', name: 'Rohan (Kids Boy)', gender: 'Kids', height: "4'1\"", size: '6-7Y', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=150' }
];

export default function VirtualTryOn({ darkMode, catalog }: VirtualTryOnProps) {
  const [selectedAvatarId, setSelectedAvatarId] = React.useState('av1');
  const [selectedProductId, setSelectedProductId] = React.useState<string>('w1');
  const [customPhoto, setCustomPhoto] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [fittingResult, setFittingResult] = React.useState<string | null>('Perfect 98% drape fit on Priya! Exquisite floral Jaipuri motif accents the silhouette.');

  const handleApplyTryOn = () => {
    setLoading(true);
    setTimeout(() => {
      const avatar = CONSTANT_AVATARS.find(a => a.id === selectedAvatarId);
      const product = catalog.find(p => p.id === selectedProductId);
      
      let fitScore = 95;
      if (product && avatar) {
        if (product.category !== avatar.gender && avatar.gender !== 'Unisex') {
          fitScore = 80; // loose mismatch note
        }
      }

      setFittingResult(
        `Simulation Successful! Applied "${product?.name || 'Garment'}" on ${customPhoto ? 'Custom Uploaded Photo' : (avatar?.name || 'Model')}. Fit Rating: ${fitScore}% with native ${product?.material || 'Handloom cotton'} drape guidelines.`
      );
      setLoading(false);
    }, 1200);
  };

  const currentAvatarInstance = CONSTANT_AVATARS.find(a => a.id === selectedAvatarId);
  const currentGarmentInstance = catalog.find(p => p.id === selectedProductId);

  // Simulated drop files
  const handlePhotoUploadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setCustomPhoto(uploadEvent.target.result as string);
          setFittingResult('Custom client silhouette uploaded successfully. Press Try-On to render garment.');
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className={`p-6 rounded-3xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'} text-left space-y-6`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-pink-100 dark:bg-slate-800 text-pink-500 rounded-xl">
          <Camera className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-display">Virtual Fitting Room</h3>
          <p className="text-xs text-gray-400">See clothes on realistic models under instant fitting calculations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 1: Pick Model Avatar / Upload your shape (column span 4) */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Step 1: Pick Client Silhouette</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {CONSTANT_AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => {
                    setSelectedAvatarId(av.id);
                    setCustomPhoto(null);
                  }}
                  className={`p-2.5 rounded-xl border text-xs flex gap-2 items-center text-left transition-all ${
                    selectedAvatarId === av.id && !customPhoto
                      ? 'border-pink-500 bg-pink-50/50 dark:bg-slate-800'
                      : 'border-gray-105 dark:border-slate-850 bg-transparent'
                  }`}
                >
                  <img src={av.image} alt={av.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-bold line-clamp-1">{av.name.split(' ')[0]}</p>
                    <p className="text-[9px] text-gray-400">{av.height} • Sz {av.size}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Photo Upload */}
            <div className="mt-3">
              <label className={`w-full flex flex-col items-center justify-center p-3 rounded-xl border border-dashed cursor-pointer text-center text-xs ${
                customPhoto ? 'border-pink-500 bg-pink-50/30' : 'border-gray-300 dark:border-slate-800 hover:bg-gray-50'
              }`}>
                <Camera className="w-5 h-5 text-gray-405 mb-1" />
                <span className="font-bold text-[11px]">
                  {customPhoto ? 'Silhouette Captured!' : 'Upload your own Photo'}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUploadLocal}
                />
              </label>
            </div>
          </div>

          {/* Select Garment to overlay */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Step 2: Choose Garment</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm focus:outline-none border mt-2 ${
                darkMode ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <optgroup label="Men Wear">
                {catalog.filter(p => p.category === 'Men').map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                ))}
              </optgroup>
              <optgroup label="Women Wear">
                {catalog.filter(p => p.category === 'Women').map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                ))}
              </optgroup>
              <optgroup label="Kids & Regional">
                {catalog.filter(p => p.category !== 'Men' && p.category !== 'Women').map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={handleApplyTryOn}
            disabled={loading}
            className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Fitting Overlaid...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Overlay Virtual Garment</span>
              </>
            )}
          </button>
        </div>

        {/* Fitting Canvas Column (column span 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-105 dark:border-slate-850">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Avatar preview board */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 dark:border-slate-850 relative bg-white dark:bg-slate-900 h-64">
              <span className="absolute top-2 left-2 text-[8px] bg-sky-500 text-white px-2 py-0.5 rounded-full uppercase font-mono">Avatar Model</span>
              <img 
                src={customPhoto || currentAvatarInstance?.image} 
                alt="model view" 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {/* Selected product previews */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 dark:border-slate-850 relative bg-white dark:bg-slate-900 h-64">
              <span className="absolute top-2 left-2 text-[8px] bg-[#FB7185] text-white px-2 py-0.5 rounded-full uppercase font-mono">Overlay Wear</span>
              <img 
                src={currentGarmentInstance?.image} 
                alt="garment view" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Fit message and indicators */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-800">
            <span className="text-[9px] uppercase font-bold text-gray-400">Simulation Fit Diagnostic</span>
            {fittingResult ? (
              <p className="text-xs text-gray-700 dark:text-slate-200 mt-1 leading-relaxed bg-pink-50/55 dark:bg-slate-900 p-2.5 rounded-lg border border-pink-100 dark:border-slate-850">
                ⭐ {fittingResult}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1 italic">Click overlay button to launch calculation model.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
