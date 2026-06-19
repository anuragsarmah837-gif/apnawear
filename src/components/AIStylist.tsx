import React from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Product, StylistOutfitBoard } from '../types';

interface AIStylistProps {
  darkMode: boolean;
  catalog: Product[];
  onAddToCart: (product: Product, size?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export default function AIStylist({ darkMode, catalog, onAddToCart, onSelectProduct }: AIStylistProps) {
  const [budget, setBudget] = React.useState('499');
  const [gender, setGender] = React.useState('Women');
  const [age, setAge] = React.useState('25');
  const [occasion, setOccasion] = React.useState('Festive Celebration');
  const [weather, setWeather] = React.useState('Warm & humid');
  const [stylePreference, setStylePreference] = React.useState('Elegant traditional block prints');
  
  const [loading, setLoading] = React.useState(false);
  const [board, setBoard] = React.useState<StylistOutfitBoard | null>(null);
  const [isOfflineMode, setIsOfflineMode] = React.useState(false);

  const fetchOutfitBoard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, gender, age, occasion, weather, stylePreference })
      });
      const data = await res.json();
      if (data) {
        setBoard(data);
        setIsOfflineMode(!!data.isOffline);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getMatchedProduct = (matchId?: string) => {
    if (!matchId) return null;
    return catalog.find(p => p.id === matchId);
  };

  return (
    <div className="space-y-6">
      {/* Intro section */}
      <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'} text-left`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-indigo-500 text-white animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight">AI Fashion Stylist</h2>
            <p className="text-xs text-gray-400">Generate complete, personalized Indian family outfits under ₹499</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed mb-4">
          Experience highly personalized recommendations tailored specifically to your family's occasion, age, weather, and budget style preferences. Our intelligent styling engine selects perfect coordinates from our certified certified product lines.
        </p>

        {/* Input selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Target Gender Segment</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all ${
                darkMode ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-gray-100 border-none'
              }`}
            >
              <option value="Women">Women's Styling</option>
              <option value="Men">Men's Styling</option>
              <option value="Kids">Kids & Toddler Styling</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Occasion or Festivity</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all ${
                darkMode ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-gray-100 border-none'
              }`}
            >
              <option value="Casual College Outing">Casual College Outing</option>
              <option value="Festive Celebration">Festive Celebrations (Puja, Diwali, Eid)</option>
              <option value="Comfort Office Wear">Smart Casual Office Wear</option>
              <option value="Traditional Wedding Guest">Traditional Wedding Guest</option>
              <option value="Active Lounging at Home">Active Lounging at Home</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Weather Conditions</label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all ${
                darkMode ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-gray-100 border-none'
              }`}
            >
              <option value="Warm & humid monsoons">Warm & Humid Monsoons</option>
              <option value="Cold winter morning">Mild Indian Winter</option>
              <option value="Hot tropical summer day">Dry Summer Afternoon</option>
              <option value="Cool breezy evening">Breezy Evening Festivities</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Aesthetic Preference</label>
            <input
              type="text"
              value={stylePreference}
              onChange={(e) => setStylePreference(e.target.value)}
              placeholder="e.g. minimalist linen, floral kurtis, vibrant block prints"
              className={`w-full p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all ${
                darkMode ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-gray-100 border-none'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Target Age group</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all ${
                darkMode ? 'bg-slate-950 text-slate-200 border-slate-800' : 'bg-gray-100 border-none'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Budget Cap</label>
            <div className={`flex items-center rounded-xl p-0.5 ${darkMode ? 'bg-slate-950' : 'bg-gray-100'}`}>
              {['199', '299', '499'].map((b) => (
                <button
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    budget === b 
                      ? 'bg-indigo-500 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  ₹{b}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={fetchOutfitBoard}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing available catalog items...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Outfit Recommendation Board</span>
            </>
          )}
        </button>
      </div>

      {/* Styled Output Board */}
      {board && (
        <div className={`p-6 rounded-3xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'neu-flat'} text-left space-y-6 relative overflow-hidden transition-all duration-500`}>
          {isOfflineMode && (
            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
              Expert Mode
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-700 dark:bg-slate-800 dark:text-indigo-300 tracking-wider">
                {board.vibe}
              </span>
              <span className="text-xs text-gray-400">• Perfect for {board.occasion}</span>
            </div>
            <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white leading-snug">
              {board.title}
            </h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {board.description}
            </p>
          </div>

          {/* Styled Items in Outfit Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {board.items.map((item, idx) => {
              const matchedProduct = getMatchedProduct(item.productMatchId);
              return (
                <div key={idx} className={`p-4 rounded-2xl flex flex-col justify-between ${
                  darkMode ? 'bg-slate-950 border border-slate-800' : 'bg-white shadow-neumorphic-sm'
                }`}>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-500 tracking-wider">
                        {item.slot}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                        {item.suggestedColor}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-1 leading-snug">
                      {item.styleIdea}
                    </p>
                  </div>

                  {matchedProduct ? (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectProduct(matchedProduct)}>
                        <img 
                          src={matchedProduct.image} 
                          alt={matchedProduct.name} 
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div className="text-left">
                          <p className="text-[11px] font-bold text-gray-900 dark:text-white line-clamp-1">
                            {matchedProduct.name}
                          </p>
                          <p className="text-xs font-extrabold text-[#FB7185]">
                            ₹{matchedProduct.price}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart(matchedProduct)}
                        className="p-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-all text-xs"
                        title="Add matched product"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 pt-2 text-[10px] text-gray-400 italic">
                      Recommended styling pairing advice
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expert tip & trend insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Pro Stylist Tip</span>
              <p className="text-xs text-gray-500 dark:text-slate-300 leading-relaxed italic">
                "{board.expertTip}"
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Affordable Trend Forecast</span>
              <p className="text-xs text-gray-500 dark:text-slate-300 leading-relaxed">
                {board.trendForecast}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
