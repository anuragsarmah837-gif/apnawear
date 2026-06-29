import React from 'react';
import { Wand2, Camera, Loader2, ArrowRight } from 'lucide-react';
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
          fitScore = 80;
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
    <div className="brutal-card-no-hover p-6 md:p-8 bg-white dark:bg-[#1a1a1a] text-left space-y-6">
      
      <div className="flex items-center gap-4 pb-4 border-b-3 border-black dark:border-white">
        <div className="p-3 border-3 border-black bg-[#FCE7F3] text-black shadow-sm rotate-[3deg]">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">Virtual Fitting Room</h3>
          <p className="text-xs font-bold text-gray-500 mt-0.5">See clothes on realistic models under instant fitting calculations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Step 1: Pick Model Avatar / Upload your shape */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Step 1: Pick Client Silhouette</span>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {CONSTANT_AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => {
                    setSelectedAvatarId(av.id);
                    setCustomPhoto(null);
                  }}
                  className={`p-3 border-2 border-black text-xs flex gap-3 items-center text-left transition-all shadow-[2px_2px_0_0_#000] ${
                    selectedAvatarId === av.id && !customPhoto
                      ? 'border-black bg-[#FCE7F3] text-black translate-x-[1px] translate-y-[1px] shadow-none'
                      : 'bg-white dark:bg-[#111111] text-black dark:text-white'
                  }`}
                >
                  <img src={av.image} alt={av.name} className="w-10 h-10 border-2 border-black object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="font-black uppercase truncate">{av.name.split(' ')[0]}</p>
                    <p className="text-[9px] font-bold text-gray-500">{av.height} • Sz {av.size}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Photo Upload */}
            <div className="mt-4">
              <label className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-black cursor-pointer text-center text-xs transition-all ${
                customPhoto ? 'bg-[#FCE7F3] text-black font-extrabold' : 'bg-gray-50 dark:bg-[#111111] hover:bg-gray-100'
              }`}>
                <Camera className="w-6 h-6 mb-1 text-black dark:text-white" />
                <span className="font-black uppercase text-[10px]">
                  {customPhoto ? 'SILHOUETTE CAPTURED!' : 'UPLOAD OWN SILHOUETTE PHOTO'}
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
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Step 2: Choose Garment</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full brutal-input text-xs font-bold bg-white dark:bg-[#111111] text-black dark:text-white mt-2 focus:outline-none"
            >
              <optgroup label="MEN WEAR">
                {catalog.filter(p => p.category === 'Men').map(p => (
                  <option key={p.id} value={p.id}>{p.name.toUpperCase()} (₹{p.price})</option>
                ))}
              </optgroup>
              <optgroup label="WOMEN WEAR">
                {catalog.filter(p => p.category === 'Women').map(p => (
                  <option key={p.id} value={p.id}>{p.name.toUpperCase()} (₹{p.price})</option>
                ))}
              </optgroup>
              <optgroup label="KIDS & REGIONAL">
                {catalog.filter(p => p.category !== 'Men' && p.category !== 'Women').map(p => (
                  <option key={p.id} value={p.id}>{p.name.toUpperCase()} (₹{p.price})</option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={handleApplyTryOn}
            disabled={loading}
            className="w-full brutal-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Simulating Fitting Overlaid...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2 animate-pulse" />
                <span>Overlay Virtual Garment</span>
              </>
            )}
          </button>
        </div>

        {/* Fitting Canvas Column */}
        <div className="lg:col-span-7 flex flex-col justify-between p-5 border-3 border-black bg-gray-50 dark:bg-[#111111]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Avatar preview board */}
            <div className="flex flex-col items-center justify-center p-3 border-2 border-black relative bg-white dark:bg-[#222] h-64">
              <span className="absolute top-2 left-2 text-[9px] bg-[#6D5EF9] text-white px-2 py-0.5 border border-black uppercase font-mono font-bold">
                Client Shape
              </span>
              <img 
                src={customPhoto || currentAvatarInstance?.image} 
                alt="model view" 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Selected product previews */}
            <div className="flex flex-col items-center justify-center p-3 border-2 border-black relative bg-white dark:bg-[#222] h-64">
              <span className="absolute top-2 left-2 text-[9px] bg-[#FF4D4F] text-white px-2 py-0.5 border border-black uppercase font-mono font-bold">
                Overlay Garment
              </span>
              <img 
                src={currentGarmentInstance?.image} 
                alt="garment view" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Fit message and indicators */}
          <div className="mt-4 pt-4 border-t-2 border-black/10 text-left">
            <span className="text-[9px] uppercase font-black tracking-wider text-gray-500 block">Simulation Fit Diagnostic</span>
            {fittingResult ? (
              <p className="text-xs font-bold text-black bg-[#FEF9C3] p-3 border-2 border-black mt-2 leading-relaxed">
                ⭐ {fittingResult}
              </p>
            ) : (
              <p className="text-xs font-semibold text-gray-400 mt-2 italic">Click overlay button to launch calculation model.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
