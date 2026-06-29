import React from 'react';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  MapPin, 
  Search, 
  Zap,
  Menu,
  X
} from 'lucide-react';
import { CartItem, Product } from '../types';

interface HeaderProps {
  cart: CartItem[];
  wishlist: Product[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({
  cart,
  wishlist,
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const t = (key: string): string => {
    const dict: Record<string, Record<string, string>> = {
      en: {
        tagline: 'Premium clothing for every Indian family under ₹499',
        searchPlaceholder: 'Search beautiful kurtas, shirts, combos...',
        home: 'Home',
        shop: 'Shop',
        regional: 'Regional',
        admin: 'Admin'
      }
    };
    return dict['en']?.[key] || key;
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white dark:bg-[#111111] border-b-[3px] border-black dark:border-white shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)]">
      {/* Top Tagline / Micro Info Bar */}
      <div className="w-full py-2 px-4 bg-[#FFD400] text-black border-b-[2px] border-black flex justify-between items-center text-xs font-bold font-sans">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-black animate-bounce-brutal" />
          <span>{t('tagline').toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Guwahati, Assam</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1440px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* LOGO */}
        <button 
          onClick={() => setCurrentTab('home')} 
          className="flex items-center gap-2 focus:outline-none shrink-0"
        >
          <div className="bg-[#FFD400] text-black border-[3px] border-black p-1.5 shadow-[2px_2px_0_0_#000] rotate-[-2deg] font-extrabold text-xl tracking-tighter">
            APNAWEAR
          </div>
          <div className="hidden lg:block text-left">
            <h1 className="font-extrabold text-sm tracking-tight leading-none text-black dark:text-white uppercase">
              Fashion For Every Home
            </h1>
            <span className="text-[10px] font-bold text-[#6D5EF9] dark:text-[#a59bfb] tracking-wider block mt-0.5">
              UNDER ₹499 STORE
            </span>
          </div>
        </button>

        {/* SEARCH BAR */}
        <div className="hidden md:flex flex-1 max-w-md items-center gap-2">
          <div className="w-full flex items-center bg-white dark:bg-[#1a1a1a] border-[3px] border-black dark:border-white px-3 py-1.5 shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#fff]">
            <Search className="w-5 h-5 text-black dark:text-white mr-2 shrink-0" />
            <input 
              id="global-search-input"
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm font-semibold placeholder-gray-500 text-black dark:text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-black dark:text-white hover:underline ml-2"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* CATEGORIES / TAB LINKS */}
        <nav className="hidden xl:flex items-center gap-1.5 font-bold">
          {[
            { id: 'home', label: t('home') },
            { id: 'shop', label: t('shop') },
            { id: 'regional', label: t('regional') }
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-1.5 border-[2px] border-black dark:border-white text-xs uppercase tracking-wide transition-all ${
                  isActive 
                    ? 'bg-black text-white dark:bg-white dark:text-black translate-x-[2px] translate-y-[2px] shadow-none' 
                    : 'bg-white text-black hover:bg-black hover:text-white dark:bg-[#1a1a1a] dark:text-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-2 font-bold text-xs">
          {/* Wishlist button */}
          <button 
            onClick={() => setCurrentTab('wishlist')}
            className={`p-2 border-[3px] border-black dark:border-white bg-[#FCE7F3] dark:bg-[#3b1c2b] text-black dark:text-white shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#fff] relative hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#000]`}
          >
            <Heart className="w-5 h-5 text-[#FF4D4F] fill-[#FF4D4F]" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-black dark:bg-white text-white dark:text-black border-[2px] border-black dark:border-white text-[9px] w-5 h-5 flex items-center justify-center font-extrabold rounded-full">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart button */}
          <button 
            onClick={() => setCurrentTab('cart')}
            className={`p-2 border-[3px] border-black dark:border-white bg-[#E0F2FE] dark:bg-[#1a364a] text-black dark:text-white shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#fff] relative hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#000]`}
          >
            <ShoppingBag className="w-5 h-5 text-[#6D5EF9] dark:text-[#a59bfb]" />
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-black dark:bg-white text-white dark:text-black border-[2px] border-black dark:border-white text-[9px] w-5 h-5 flex items-center justify-center font-extrabold rounded-full">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Admin / Operator icon */}
          <button 
            onClick={() => setCurrentTab('admin')}
            className={`p-2 border-[3px] border-black dark:border-white shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#000] ${
              currentTab === 'admin' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-[#1a1a1a] text-black dark:text-white'
            }`}
            title={t('admin')}
          >
            <User className="w-5 h-5" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 border-[3px] border-black dark:border-white bg-white dark:bg-[#1a1a1a] text-black dark:text-white shadow-[3px_3px_0_0_#000]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (brutal dropdown) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-[#111111] border-t-[3px] border-black dark:border-white p-4 space-y-4">
          {/* Mobile search */}
          <div className="flex items-center gap-2">
            <div className="w-full flex items-center bg-white dark:bg-[#1a1a1a] border-[3px] border-black dark:border-white px-3 py-1.5 shadow-[2px_2px_0_0_#000]">
              <Search className="w-5 h-5 text-black dark:text-white mr-2" />
              <input 
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm font-semibold text-black dark:text-white"
              />
            </div>
          </div>

          {/* Mobile Links */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'home', label: t('home') },
              { id: 'shop', label: t('shop') },
              { id: 'regional', label: t('regional') },
              { id: 'admin', label: t('admin') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-3 border-[3px] border-black dark:border-white text-center font-extrabold text-xs uppercase tracking-wide transition-all shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#fff] ${
                  currentTab === tab.id
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-white dark:bg-[#1a1a1a] text-black dark:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
