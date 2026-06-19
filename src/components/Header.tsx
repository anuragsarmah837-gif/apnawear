import React from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Coins, 
  User, 
  MapPin, 
  Search, 
  Mic, 
  Sun, 
  Moon, 
  Sparkles,
  Volume2,
  VolumeX,
  Globe
} from 'lucide-react';
import { UserWallet, CartItem, Product } from '../types';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  wallet: UserWallet;
  cart: CartItem[];
  wishlist: Product[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  onVoiceSearch: () => void;
  voiceSearching: boolean;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'as', label: 'অসমীয়া (Assamese)' },
  { code: 'rj', label: 'राजस्थानी (Rajasthani)' }
];

export default function Header({
  darkMode,
  setDarkMode,
  wallet,
  cart,
  wishlist,
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  language,
  setLanguage,
  onVoiceSearch,
  voiceSearching
}: HeaderProps) {
  const [showLangDropdown, setShowLangDropdown] = React.useState(false);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Localization translator map
  const t = (key: string): string => {
    const dict: Record<string, Record<string, string>> = {
      en: {
        tagline: 'Stylish clothing for every Indian family under ₹499',
        searchPlaceholder: 'Search beautiful kurtas, shirts, combos...',
        home: 'Home',
        shop: 'Shop Fashion',
        bundles: 'Premium Bundles',
        stylist: 'AI Stylist',
        regional: 'Regional India',
        community: 'Community Feed',
        rewards: 'Coins Rewards',
        admin: 'Operator Panel'
      },
      hi: {
        tagline: 'हर भारतीय परिवार के लिए ₹499 के अंदर फैशनेबल कपड़े',
        searchPlaceholder: 'कुर्ता, शर्ट, कॉम्बो सर्च करें...',
        home: 'होम',
        shop: 'फैशन स्टोर',
        bundles: 'प्रीमियम बंडल्स',
        stylist: 'एआई स्टाइलिस्ट',
        regional: 'क्षेत्रीय भारत',
        community: 'कम्युनिटी फीड',
        rewards: 'कॉइन रिवॉर्ड्स',
        admin: 'ऑपरेटर पैनल'
      },
      bn: {
        tagline: 'প্রতিটি ভারতীয় পরিবারের স্টাইলিশ পোশাক ₹৪৯৯ এর মধ্যে',
        searchPlaceholder: 'সুন্দর কুর্তা, শার্ট বা কম্বো খুঁজুন...',
        home: 'হোম',
        shop: 'ফ্যাশন শপ',
        bundles: 'প্রিমিয়াম বান্ডিল',
        stylist: 'এআই স্টাইলিস্ট',
        regional: 'আঞ্চলিক ভারত',
        community: 'কমিউনিটি ফিড',
        rewards: 'কয়েন রিওয়ার্ডস',
        admin: 'অপারেটর প্যানেল'
      },
      ta: {
        tagline: 'ஒவ்வொரு இந்திய குடும்பத்திற்கும் ₹499க்குள் நவநாகரீக ஆடைகள்',
        searchPlaceholder: 'குர்தாக்கள், சட்டைகள் தேடவும்...',
        home: 'முகப்பு',
        shop: 'ஆடை அங்காடி',
        bundles: 'பிரீமியம் பண்டில்கள்',
        stylist: 'AI ஸ்டைலிஸ்ட்',
        regional: 'பாரம்பரிய இந்தியா',
        community: 'சமூக ஊடகம்',
        rewards: 'நாணய வெகுமதிகள்',
        admin: 'நிர்வாக குழு'
      },
      as: {
        tagline: 'প্ৰতিটো ভাৰতীয় পৰিয়ালৰ বাবে ₹৪৯৯ ৰ ভিতৰত সুন্দৰ সাজ-পোছাক',
        searchPlaceholder: 'কুৰ্তা, ছাৰ্ট, কম্বো সন্ধান কৰক...',
        home: 'মূল পৃষ্ঠা',
        shop: 'ফেশ্বন দোকান',
        bundles: 'প্ৰিলিয়াম বান্ডিল',
        stylist: 'এআই ষ্টাইলিষ্ট',
        regional: 'আঞ্চলিক ভাৰত',
        community: 'কমিউনিটি ফিড',
        rewards: 'কইন পুৰস্কাৰ',
        admin: 'ব্যৱস্থাপনা পেনেল'
      },
      rj: {
        tagline: 'सागै आखा भारतीय परिवारां खातिर ₹499 रो चोखो फैशन',
        searchPlaceholder: 'कुड़ता, पैंट अर चूड़ीदार ढूंढो...',
        home: 'घर',
        shop: 'फैशन की दुकान',
        bundles: 'खास बंडल',
        stylist: 'एआई स्टाइलिस्ट',
        regional: 'रंगीलो भारत',
        community: 'भाईचारा फीड',
        rewards: 'सिक्का इनाम',
        admin: 'चौधरी पैनल'
      }
    };
    return dict[language]?.[key] || dict['en']?.[key] || key;
  };

  return (
    <header className={`w-full transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-gray-50 border-b border-gray-200'} sticky top-0 z-50`}>
      {/* Top micro-bar: Tagline & Regional Location Selector */}
      <div className={`w-full py-1 px-4 text-xs font-medium flex justify-between items-center transition-colors ${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-gray-100 text-gray-600'}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>{t('tagline')}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-coral" />
            <span>Delivery to: </span>
            <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>Guwahati, Assam</span>
          </div>
          <span className="hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 cursor-pointer hover:underline" onClick={() => setCurrentTab('rewards')}>
            <Coins className="w-3 h-3 text-amber-400 animate-spin" />
            <span>Refer & Get 200 Coins</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <button 
            id="brand-logo" 
            onClick={() => setCurrentTab('home')} 
            className="flex items-center gap-2.5 focus:outline-none"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              darkMode ? 'bg-gradient-to-tr from-indigo-500 to-sky-400 shadow-neumorphic-dark' : 'bg-white shadow-neumorphic-sm'
            }`}>
              <ShoppingBag className={`w-5.5 h-5.5 ${darkMode ? 'text-slate-900' : 'text-sky-500'}`} />
            </div>
            <div className="text-left">
              <h1 className={`font-display text-lg font-bold tracking-tight leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Fashion For Every Home
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-sky-500 uppercase font-semibold">
                Under ₹499 Store
              </span>
            </div>
          </button>

          {/* Quick theme & user indicators for mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-slate-800 text-amber-300' : 'bg-white text-gray-500 shadow-neumorphic-xs'}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setCurrentTab('cart')}
              className={`p-2 rounded-lg relative ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-700 shadow-neumorphic-xs'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search & Voice command */}
        <div className="w-full md:max-w-md flex items-center gap-2.5">
          <div className={`w-full flex items-center rounded-xl px-3 py-2 transition-all ${
            darkMode ? 'bg-slate-950 shadow-neumorphic-dark-inset' : 'bg-white shadow-neumorphic-inset'
          }`}>
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input 
              id="global-search-input"
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm font-sans placeholder-gray-400 text-slate-700 dark:text-slate-200"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-gray-600 px-1 font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Voice Search Activator */}
          <button
            id="voice-search-btn"
            onClick={onVoiceSearch}
            title="Search using Voice Integration"
            className={`p-2.5 rounded-xl transition-all relative ${
              voiceSearching 
                ? 'bg-red-500 text-white animate-pulse' 
                : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-neumorphic-dark' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-neumorphic-xs')
            }`}
          >
            <Mic className="w-4 h-4" />
            {voiceSearching && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>

        {/* Icons Bar: Language, Coins Wallet, Wishlist, Cart & Operator */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              id="lang-selector-btn"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className={`p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold ${
                darkMode ? 'bg-slate-800 text-slate-300 shadow-neumorphic-dark' : 'bg-white text-gray-700 shadow-neumorphic-xs'
              }`}
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>{LANGUAGES.find(l => l.code === language)?.label.split(' ')[0]}</span>
            </button>
            {showLangDropdown && (
              <div className={`absolute right-0 mt-2 w-44 rounded-xl p-1 shadow-neumorphic z-50 ${
                darkMode ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-white text-gray-700 border border-gray-100'
              }`}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      language === lang.code 
                        ? 'bg-sky-100 dark:bg-slate-700 text-sky-600 dark:text-sky-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coins Reward Wallet status */}
          <button 
            id="coin-wallet-indicator"
            onClick={() => setCurrentTab('rewards')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              darkMode ? 'bg-slate-800 text-amber-400 shadow-neumorphic-dark' : 'bg-amber-50 text-amber-700 shadow-neumorphic-xs border border-amber-200'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span className="font-mono">{wallet.coins} Coins</span>
            <span className="text-gray-300 dark:text-slate-600">|</span>
            <span className="font-mono">₹{wallet.balanceRupees}</span>
          </button>

          {/* Wishlist Icon */}
          <button 
            id="wishlist-tab-btn"
            onClick={() => setCurrentTab('wishlist')}
            className={`p-2.5 rounded-xl relative transition-all ${
              currentTab === 'wishlist' 
                ? 'bg-sky-100 dark:bg-slate-700 text-sky-600 dark:text-sky-400' 
                : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-neumorphic-dark' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-neumorphic-xs')
            }`}
          >
            <Heart className="w-5 h-5 text-rose-500" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Shopping Cart Icon */}
          <button 
            id="cart-tab-btn"
            onClick={() => setCurrentTab('cart')}
            className={`p-2.5 rounded-xl relative transition-all ${
              currentTab === 'cart' 
                ? 'bg-sky-100 dark:bg-slate-700 text-sky-600 dark:text-sky-400' 
                : (darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-neumorphic-dark' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-neumorphic-xs')
            }`}
          >
            <ShoppingBag className="w-5 h-5 text-sky-500" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-sky-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Theme Switcher Button */}
          <button 
            id="theme-toggler"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl transition-all ${
              darkMode ? 'bg-slate-800 text-amber-300 shadow-neumorphic-dark hover:bg-slate-750' : 'bg-white text-gray-600 shadow-neumorphic-xs hover:bg-gray-100'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Link Bar */}
      <nav className={`w-full py-1 ${darkMode ? 'bg-slate-900 border-t border-slate-850' : 'bg-white border-t border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
          {[
            { id: 'home', label: t('home'), icon: Sparkles },
            { id: 'shop', label: t('shop'), icon: ShoppingBag },
            { id: 'stylist', label: t('stylist'), icon: Sparkles, accent: true },
            { id: 'bundles', label: t('bundles'), icon: Coins },
            { id: 'regional', label: t('regional'), icon: Globe },
            { id: 'community', label: t('community'), icon: Heart },
            { id: 'rewards', label: t('rewards'), icon: Coins },
            { id: 'admin', label: t('admin'), icon: User, operator: true }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? (tab.accent 
                        ? 'bg-indigo-600 text-white shadow-md scale-105' 
                        : 'bg-sky-500 text-white shadow-sm scale-105')
                    : (darkMode 
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.accent && !isActive ? 'text-indigo-400 animate-pulse' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
