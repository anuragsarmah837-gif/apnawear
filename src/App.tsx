import React from 'react';
import Header from './components/Header';
import AIStylist from './components/AIStylist';
import AdminPanel from './components/AdminPanel';
import VirtualTryOn from './components/VirtualTryOn';
import CommunityFeed from './components/CommunityFeed';
import { INITIAL_PRODUCTS, DAILY_DEALS, FASHION_BUNDLES, INITIAL_COMMUNITY_FEED } from './data';
import { Product, CartItem, Order, UserWallet, CommunityPost } from './types';
import { 
  Sparkles, 
  ChevronRight, 
  Star, 
  MapPin, 
  Coins, 
  Heart, 
  ShoppingBag, 
  ShoppingBag as CartIcon,
  CheckCircle2, 
  Truck, 
  Search, 
  Mic, 
  X,
  Plus,
  Minus,
  Gift,
  HelpCircle,
  QrCode,
  Smartphone,
  Info
} from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState<string>('home');
  const [language, setLanguage] = React.useState<string>('en');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  
  // State catalogs
  const [products, setProducts] = React.useState<Product[]>(INITIAL_PRODUCTS);
  const [communityFeed, setCommunityFeed] = React.useState<CommunityPost[]>(INITIAL_COMMUNITY_FEED);
  
  // Filter settings
  const [selectedGender, setSelectedGender] = React.useState<string>('All');
  const [maxPriceLimit, setMaxPriceLimit] = React.useState<number>(499);
  const [selectedRegion, setSelectedRegion] = React.useState<string>('All');

  // Customer states
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [wishlist, setWishlist] = React.useState<Product[]>([]);
  const [selectedProductDetails, setSelectedProductDetails] = React.useState<Product | null>(null);

  // Rewards wallet
  const [wallet, setWallet] = React.useState<UserWallet>({
    coins: 450,
    balanceRupees: 200,
    history: [
      { date: '2026-06-18', amount: 200, reason: 'Sign up welcome bonus', type: 'coins' },
      { date: '2026-06-19', amount: 250, reason: 'Referral verification look approved', type: 'coins' }
    ]
  });

  const [hasCheckedInToday, setHasCheckedInToday] = React.useState(false);

  // Voice Search states
  const [voiceQueryPopup, setVoiceQueryPopup] = React.useState(false);
  const [voiceSearchingText, setVoiceSearchingText] = React.useState('Listening to your fashion preferences...');
  
  // Try-on utility overlays
  const [triggerTryOnModal, setTriggerTryOnModal] = React.useState(false);

  // Interactive Reviews state
  const [customReviews, setCustomReviews] = React.useState<Record<string, { reviewer: string; rating: number; text: string }[]>>({
    'm1': [
      { reviewer: 'Vikram Das', rating: 5, text: 'The Sanganeri block print is authentic. Soft fabric premium feeling under ₹400!' },
      { reviewer: 'Amit J.', rating: 4, text: 'Awesome styling. Fits perfect for family prayer.' }
    ],
    'w1': [
      { reviewer: 'Pooja Barua', rating: 5, text: 'Gorgeously flared Anarkali! Perfect cotton. Absolute steal at ₹429.' }
    ]
  });
  const [newReviewerName, setNewReviewerName] = React.useState('');
  const [newReviewText, setNewReviewText] = React.useState('');
  const [newReviewRating, setNewReviewRating] = React.useState(5);

  // Coupon promo state
  const [couponCodes, setCouponCodes] = React.useState<{ code: string; discount: number }[]>([
    { code: 'EKO50', discount: 50 },
    { code: 'FAMILY75', discount: 75 }
  ]);
  const [appliedPromo, setAppliedPromo] = React.useState<string>('');
  const [promoCodeInput, setPromoCodeInput] = React.useState<string>('');
  const [appliedPromoDiscount, setAppliedPromoDiscount] = React.useState<number>(0);
  const [redeemCoinsChecked, setRedeemCoinsChecked] = React.useState(false);

  // Orders registry
  const [orders, setOrders] = React.useState<Order[]>([
    {
      id: 'F4EH-89304',
      date: '2026-06-19',
      items: [
        { productId: 'm2', name: 'Khadi Textured Minimalist Casual Shirt', price: 349, quantity: 1, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=150' }
      ],
      total: 349,
      status: 'Processing',
      address: 'Lachit Nagar, Guwahati, Assam - 781007',
      paymentMethod: 'Cash on Delivery (COD)',
      trackingNumber: 'TRK-GUW-10928'
    }
  ]);
  
  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [deliveryAddress, setDeliveryAddress] = React.useState('House No 42, G.S. Road, Guwahati, Assam - 781005');
  const [paymentOption, setPaymentOption] = React.useState('COD');
  const [checkoutSuccessfulOrder, setCheckoutSuccessfulOrder] = React.useState<Order | null>(null);

  // Countdown clock state for Flash Deals
  const [timeLeft, setTimeLeft] = React.useState<{ min: number; sec: number }>({ min: 44, sec: 18 });
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { min: prev.min - 1, sec: 59 };
        return { min: 60, sec: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync dark mode style attribute
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Voice command simulation selection
  const triggerVoiceSimulator = () => {
    setVoiceQueryPopup(true);
    setVoiceSearchingText('Listening for voice requests...');
    
    // Simulate smart voice transcription sequence after brief pause
    setTimeout(() => {
      setVoiceSearchingText('Transcription: "Show me pure cotton traditional clothes under ₹300"');
    }, 1400);
  };

  const applyVoiceSpeechFilter = (query: string, limit: number, gender: string, regionFilter = 'All') => {
    setSearchQuery(query);
    setMaxPriceLimit(limit);
    setSelectedGender(gender);
    setSelectedRegion(regionFilter);
    setVoiceQueryPopup(false);
    setCurrentTab('shop');
    alert(`Voice filter applied! Showing matching looks.`);
  };

  // State handlers
  const handleAddToCart = (product: Product, size = 'M') => {
    const existing = cart.find(item => item.product.id === product.id && item.selectedSize === size);
    if (existing) {
      setCart(cart.map(item => (item.product.id === product.id && item.selectedSize === size) ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1, selectedSize: size }]);
    }
    alert(`"${product.name}" added to Your Cart!`);
  };

  const handleUpdateCartQuantity = (id: string, size: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === id && item.selectedSize === size) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const handleToggleWishlist = (product: Product) => {
    if (wishlist.some(p => p.id === product.id)) {
      setWishlist(wishlist.filter(p => p.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const handlePostReview = (productId: string) => {
    if (!newReviewerName || !newReviewText) return;
    const current = customReviews[productId] || [];
    const added = { reviewer: newReviewerName, rating: newReviewRating, text: newReviewText };
    setCustomReviews({ ...customReviews, [productId]: [added, ...current] });
    
    // Reward customer +30 coins!
    setWallet(prev => ({
      ...prev,
      coins: prev.coins + 30,
      history: [{ date: '2026-06-19', amount: 30, reason: `Reviewed product of id ${productId}`, type: 'coins' }, ...prev.history]
    }));

    setNewReviewerName('');
    setNewReviewText('');
    alert('Thank you for sharing your feedback! E-commerce reward engine added +30 Coins to your wallet!');
  };

  const handleClaimDailyCheckIn = () => {
    if (hasCheckedInToday) return;
    setHasCheckedInToday(true);
    setWallet(prev => ({
      ...prev,
      coins: prev.coins + 50,
      history: [{ date: '2026-06-19', amount: 50, reason: 'Daily Login Reward Loyalty CheckIn', type: 'coins' }, ...prev.history]
    }));
    alert('Daily login success! Claimed +50 Fashion Coins. Redeem them during checkout.');
  };

  // Promo applicability check
  const handleApplyPromoCode = (codeName: string) => {
    const found = couponCodes.find(c => c.code === codeName.toUpperCase());
    if (found) {
      setAppliedPromo(found.code);
      setAppliedPromoDiscount(found.discount);
      alert(`Promo code applied! ₹${found.discount} discount deducted.`);
    } else {
      alert('Invalid promo code. Try codes: EKO50 or FAMILY75');
    }
  };

  // Calculate cart costs
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const coinSavings = redeemCoinsChecked ? Math.min(wallet.coins * 0.1, cartSubtotal * 0.15) : 0; // 100 coins = ₹10 savings
  const cartTotal = Math.max(0, cartSubtotal - appliedPromoDiscount - coinSavings);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    
    // Deduct coins if checked
    let finalCoins = wallet.coins;
    if (redeemCoinsChecked) {
      finalCoins = Math.max(0, wallet.coins - Math.floor(coinSavings * 10));
    }

    // Award standard purchase coins (+15 coins for each item)
    finalCoins += cart.length * 15;

    const newOrder: Order = {
      id: 'F4EH-' + (Math.floor(Math.random() * 90000) + 10000).toString(),
      date: new Date().toISOString().split('T')[0],
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      })),
      total: cartTotal,
      status: 'Processing',
      address: deliveryAddress,
      paymentMethod: paymentOption === 'COD' ? 'Cash on Delivery (COD)' : 'Instant UPI payment model',
      trackingNumber: 'TRK-GUW-' + (Math.floor(Math.random() * 90000) + 10000).toString()
    };

    setOrders([newOrder, ...orders]);
    setWallet(prev => ({
      ...prev,
      coins: finalCoins,
      history: [
        { date: '2026-06-19', amount: cart.length * 15, reason: 'Earned coins on purchase transaction', type: 'coins' },
        ...(redeemCoinsChecked ? [{ date: '2026-06-19', amount: -Math.floor(coinSavings * 10), reason: 'Spent coins on checkout discount', type: 'coins' }] : []),
        ...prev.history
      ]
    }));

    // Clear cart
    setCart([]);
    setCheckoutSuccessfulOrder(newOrder);
    setRedeemCoinsChecked(false);
    setAppliedPromo('');
    setAppliedPromoDiscount(0);
  };

  const handleWhatsAppOrderMessage = (product: Product) => {
    const text = `Hi Fashion For Every Home! I would like to order one "${product.name}" for ₹${product.price}. Please guide me on express delivery.`;
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?phone=919000000000&text=${encoded}`, '_blank');
  };

  // Filtered catalog listings
  const filteredCatalog = products.filter(p => {
    // Search match
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Gender Category match
    const genderMatch = selectedGender === 'All' || p.category === selectedGender;
    
    // Price match
    const priceMatch = p.price <= maxPriceLimit;

    // Region match
    const regionMatch = selectedRegion === 'All' || p.region === selectedRegion;

    return searchMatch && genderMatch && priceMatch && regionMatch;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#F0F2F5] text-gray-800'}`}>
      
      {/* Header component integration */}
      <Header 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        wallet={wallet}
        cart={cart}
        wishlist={wishlist}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        language={language}
        setLanguage={setLanguage}
        onVoiceSearch={triggerVoiceSimulator}
        voiceSearching={voiceQueryPopup}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8">
        
        {/* TAB 1: HOMEPAGE GREETING */}
        {currentTab === 'home' && (
          <div className="space-y-8 transition-all duration-300">
            {/* HERO SECTION */}
            <div className={`rounded-3xl p-6 md:p-10 flex flex-col lg:flex-row justify-between items-center relative overflow-hidden transition-all ${
              darkMode ? 'bg-slate-950 text-white border border-slate-800' : 'neu-flat'
            }`}>
              <div className="text-left space-y-4 lg:w-3/5 z-10 flex flex-col items-start">
                <span className="text-xs font-bold text-[#FB7185] uppercase tracking-widest bg-rose-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-rose-100">
                  Style Without Limits 🇮🇳
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-905 dark:text-white leading-tight font-display">
                  Great Fashion Shouldn't <br />
                  <span className="text-sky-400 text-soft-glow">Cost a Fortune.</span>
                </h1>
                <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
                  Provide stylish, certified premium fabrics for every Indian family while ensuring every product remains strictly under <strong>₹499</strong>. No compromises, direct artisanal heritage.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => {
                      setSelectedGender('All');
                      setMaxPriceLimit(499);
                      setCurrentTab('shop');
                    }}
                    className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-pink-500 hover:bg-pink-600 text-white shadow-lg transition-transform hover:scale-[1.03]"
                  >
                    Shop Under ₹499
                  </button>
                  <button 
                    onClick={() => setCurrentTab('stylist')}
                    className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-transform hover:scale-[1.03]"
                  >
                    AI Personalized Lookbook
                  </button>
                </div>
              </div>

              {/* Float product preview card */}
              <div className="mt-8 lg:mt-0 relative w-full lg:w-1/3 flex justify-center">
                <div className={`w-64 p-4 rounded-3xl transform rotate-3 flex flex-col items-center border ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F0F2F5] shadow-neumorphic'
                }`}>
                  <img 
                    src={INITIAL_PRODUCTS[0].image} 
                    alt="Featured Men Kurta" 
                    className="w-full h-40 object-cover rounded-2xl mb-3"
                  />
                  <div className="w-full text-left space-y-1">
                    <p className="text-xs text-gray-400 font-mono">FAMILIES SELECTION</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-100 line-clamp-1">{INITIAL_PRODUCTS[0].name}</p>
                    <div className="flex justify-between items-center pt-1.5">
                      <span className="text-base font-extrabold text-[#FB7185]">₹{INITIAL_PRODUCTS[0].price}</span>
                      <span className="text-xs line-through text-gray-400">₹{INITIAL_PRODUCTS[0].originalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* EVERYTHING UNDER 499 - INTERACTIVE PRICING SELECTOR */}
            <div className="space-y-4">
              <div className="text-left">
                <h3 className="text-xl font-bold font-display">Select Your Sweet-Spot Price Point</h3>
                <p className="text-xs text-gray-400">Locating pristine styles with single touch pricing overlays</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Under ₹199', value: 199, bg: 'hover:border-sky-305 text-sky-505 bg-sky-20/40 dark:bg-sky-950/20' },
                  { label: 'Under ₹299', value: 299, bg: 'hover:border-emerald-305 text-emerald-505 bg-emerald-20/40 dark:bg-emerald-950/20' },
                  { label: 'Under ₹399', value: 399, bg: 'hover:border-purple-305 text-purple-505 bg-purple-20/40 dark:bg-purple-950/20' },
                  { label: 'Under ₹499', value: 499, bg: 'hover:border-rose-300 text-rose-500 bg-rose-50/40 dark:bg-rose-950/20 font-bold' }
                ].map((priceOpt) => (
                  <button
                    key={priceOpt.value}
                    onClick={() => {
                      setMaxPriceLimit(priceOpt.value);
                      setSelectedRegion('All');
                      setCurrentTab('shop');
                    }}
                    className={`p-5 rounded-2xl transition-all cursor-pointer text-left border ${priceOpt.bg} ${
                      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-neumorphic-sm hover:scale-[1.02]'
                    }`}
                  >
                    <span className="text-xs text-gray-400 font-mono block mb-1">STRICTLY MATCHED</span>
                    <span className="text-lg font-extrabold tracking-tight">{priceOpt.label}</span>
                    <span className="text-[10px] text-gray-400 block mt-2">Browse catalog looks →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* THREE IMMERSIVE CATEGORY BENTO BLOCKS */}
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-xl font-bold font-display">Immersive Family Styling Hub</h3>
                <p className="text-xs text-gray-400">Curated cultural pathways rather than cold cluttered grids</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Men's Showcase */}
                <div className={`p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-80 ${
                  darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'
                }`}>
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-sky-100 text-sky-700 uppercase font-bold">Classic Him</span>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">Polos, Handloom Kurtas & Shirts</h4>
                    <p className="text-xs text-gray-400">Organic fits that balance work productivity and celebratory roots.</p>
                  </div>
                  <div className="relative h-24 mt-2 overflow-hidden rounded-xl">
                    <img src={INITIAL_PRODUCTS[1].image} alt="Men" className="w-full h-full object-cover rounded-xl grayscale-[20%]" />
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedGender('Men');
                      setCurrentTab('shop');
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-600 text-white transition-all mt-4"
                  >
                    Explore Men Section Under ₹499
                  </button>
                </div>

                {/* Women's Showcase */}
                <div className={`p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-80 ${
                  darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'
                }`}>
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-rose-100 text-rose-700 uppercase font-bold">Her Trends</span>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">Flared Kurtis, Tunics & Palazzo</h4>
                    <p className="text-xs text-gray-400">Vibrant pastel smocked georgettis and historic Kalamkari weaves.</p>
                  </div>
                  <div className="relative h-24 mt-2 overflow-hidden rounded-xl">
                    <img src={INITIAL_PRODUCTS[5].image} alt="Women" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedGender('Women');
                      setCurrentTab('shop');
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-pink-500 hover:bg-pink-600 text-white transition-all mt-4"
                  >
                    Explore Women Section Under ₹499
                  </button>
                </div>

                {/* Kids' Showcase */}
                <div className={`p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-80 ${
                  darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'
                }`}>
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-700 uppercase font-bold">Playful Comfort</span>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">Organic Jumpsuits & Sets</h4>
                    <p className="text-xs text-gray-400">Hypoallergenic dye certifications tailored for sensitive active skin.</p>
                  </div>
                  <div className="relative h-24 mt-2 overflow-hidden rounded-xl">
                    <img src={INITIAL_PRODUCTS[8].image} alt="Kids" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedGender('Kids');
                      setCurrentTab('shop');
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-605 text-white transition-all mt-4"
                  >
                    Explore Kids Section Under ₹499
                  </button>
                </div>

              </div>
            </div>

            {/* DAILY ₹99 FLASH SALE FLASH PANEL */}
            <div className={`p-6 rounded-3xl bg-gradient-to-tr from-sky-450/10 to-rose-450/5 relative overflow-hidden ${
              darkMode ? 'bg-slate-950 border border-slate-850' : 'neu-flat'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-850">
                <div className="text-left space-y-1">
                  <span className="text-xs font-bold text-[#FB7185] uppercase tracking-wide">Daily Spark Hour</span>
                  <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Active Daily ₹99 Deals</h3>
                </div>
                {/* Timer Clock */}
                <div className="flex gap-2 items-center self-start md:self-auto">
                  <span className="text-[10px] text-gray-400 font-mono uppercase mr-1">Time Left</span>
                  <span className="px-3 py-1.5 rounded-xl font-mono font-bold text-xs bg-rose-100 text-rose-700 dark:bg-slate-800 dark:text-rose-300 shadow-inner">
                    {timeLeft.min < 10 ? `0${timeLeft.min}` : timeLeft.min}
                  </span>
                  <span className="font-bold text-[#FB7185]">:</span>
                  <span className="px-3 py-1.5 rounded-xl font-mono font-bold text-xs bg-rose-100 text-rose-700 dark:bg-slate-800 dark:text-rose-300 shadow-inner">
                    {timeLeft.sec < 10 ? `0${timeLeft.sec}` : timeLeft.sec}
                  </span>
                </div>
              </div>

              {/* Deal Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
                {DAILY_DEALS.map((deal) => (
                  <div key={deal.id} className={`p-4 rounded-2xl flex flex-col justify-between ${
                    darkMode ? 'bg-slate-900 border border-slate-850' : 'bg-white shadow-neumorphic-sm'
                  }`}>
                    <div>
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                        <img src={deal.image} alt={deal.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 right-2 bg-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full animate-pulse">
                          Flash ₹99
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-100 line-clamp-1">{deal.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{deal.description}</p>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-[#FB7185]">₹99</span>
                        <span className="text-xs text-gray-400 line-through">₹{deal.originalPrice}</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(deal)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-sky-500 text-white hover:bg-sky-600"
                      >
                        Quick Claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TRY ON PROMPT CARD */}
            <div className={`p-6 rounded-3xl ${darkMode ? 'bg-slate-950 border border-slate-800' : 'bg-white shadow-neumorphic'} text-left flex flex-col md:flex-row items-center justify-between gap-6`}>
              <div className="space-y-2">
                <h4 className="text-lg font-bold font-display flex items-center gap-1.5">
                  <Smartphone className="w-5 h-5 text-indigo-500" />
                  Try Outwear Virtually Before Buying!
                </h4>
                <p className="text-xs text-gray-500 max-w-xl">
                  Not sure if deep indigo pairs with Kalamkari palazzos? Open our Virtual Fitting Sandbox where you can test overlays on real-size models, or test with custom posture files!
                </p>
              </div>
              <button
                onClick={() => setTriggerTryOnModal(true)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-505 hover:bg-indigo-600 text-white transition-all shadow-md shrink-0"
              >
                Access virtual Try-On Sandbox
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: GENERAL SHOP AND CATALOG */}
        {currentTab === 'shop' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left transition-all duration-300">
            {/* Filter sidebar controls col-span-3 */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Category Segment Selector */}
              <div className={`p-5 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-850' : 'bg-white shadow-neumorphic-sm'}`}>
                <h4 className="text-xs font-bold uppercase text-gray-450 tracking-wider mb-3">Filter by Family Section</h4>
                <div className="flex flex-col gap-2">
                  {['All', 'Men', 'Women', 'Kids', 'Regional'].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setSelectedGender(item);
                        setSelectedRegion('All');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all ${
                        selectedGender === item 
                          ? 'bg-sky-500 text-white' 
                          : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item === 'All' ? 'All Family Members' : `${item} Collection`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price filter slider selection override custom buttons for Soft UI */}
              <div className={`p-5 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-850' : 'bg-white shadow-neumorphic-sm'}`}>
                <h4 className="text-xs font-bold uppercase text-gray-450 tracking-wider mb-2">Price Cap Selection</h4>
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-3">
                  <span>Min: ₹99</span>
                  <span className="text-[#FB7185]">Max: ₹{maxPriceLimit}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {[199, 299, 399, 499].map((val) => (
                    <button
                      key={val}
                      onClick={() => setMaxPriceLimit(val)}
                      className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        maxPriceLimit === val
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-55/40 dark:bg-slate-850 border border-transparent'
                      }`}
                    >
                      Strictly Under ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code Quick Shop feature */}
              <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-850 text-center space-y-2">
                <QrCode className="w-7 h-7 mx-auto text-gray-400 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Scan to pay on mobile</p>
                <p className="text-[9px] text-gray-500 leading-relaxed">Scan QR code anywhere at home to checkout cart instantly via WhatsApp ordering protocols.</p>
              </div>

            </div>

            {/* Product Listing Main Cards Grid col-span-9 */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Header stats bar */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-850">
                <div>
                  <h2 className="text-xl font-bold font-display">Affordable Premium Looks</h2>
                  <p className="text-xs text-gray-400">Currently showing {filteredCatalog.length} tailored selections</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] bg-sky-50 text-sky-700 dark:bg-slate-800 dark:text-sky-300 font-bold">
                    Filter: {selectedGender}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] bg-pink-50 text-pink-700 dark:bg-slate-800 dark:text-pink-300 font-bold">
                    Price: Under ₹{maxPriceLimit}
                  </span>
                </div>
              </div>

              {/* Empty state when no matches */}
              {filteredCatalog.length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <HelpCircle className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-gray-400">No matching under-₹499 items found</p>
                  <p className="text-xs text-gray-500">We advise resetting search filters or decreasing restriction parameters.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGender('All');
                      setMaxPriceLimit(499);
                      setSelectedRegion('All');
                    }}
                    className="px-4 py-2 bg-sky-500 text-white rounded-xl text-xs font-bold"
                  >
                    Reset Shopping Filters
                  </button>
                </div>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredCatalog.map((p) => (
                  <div 
                    key={p.id}
                    className={`rounded-3xl p-4 flex flex-col justify-between ${
                      darkMode ? 'bg-slate-900 border border-slate-850' : 'bg-white shadow-neumorphic'
                    }`}
                  >
                    <div>
                      {/* Image Preview space */}
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                        
                        {/* Tags */}
                        {p.tags.slice(0, 1).map((tg, i) => (
                          <span key={i} className="absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm text-gray-800 dark:text-slate-200">
                            #{tg}
                          </span>
                        ))}

                        {/* Traditional Region tag if any */}
                        {p.region && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono bg-sky-450 text-white uppercase bg-sky-500/90 shadow-sm border border-sky-400">
                            {p.region}
                          </span>
                        )}

                        {/* Save to Wishlist Heart button */}
                        <button
                          onClick={() => handleToggleWishlist(p)}
                          className={`absolute top-2 right-2 p-2 rounded-xl backdrop-blur-md transition-all ${
                            wishlist.some(item => item.id === p.id)
                              ? 'bg-red-500 text-white scale-110'
                              : 'bg-white/70 hover:bg-white text-gray-600'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Header details */}
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.category} • {p.subCategory || 'Essentials'}</p>
                      
                      <button 
                        onClick={() => setSelectedProductDetails(p)}
                        className="text-left block mt-1 focus:outline-none"
                      >
                        <h4 className="text-sm font-bold font-display text-gray-800 dark:text-slate-100 line-clamp-1 hover:underline">
                          {p.name}
                        </h4>
                      </button>

                      {/* Stars & Reviews */}
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-bold text-gray-750 dark:text-slate-200">{p.rating}</span>
                        <span className="text-[10px] text-gray-400">({p.reviewsCount} reviews)</span>
                      </div>

                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                    </div>

                    {/* Price and Shopping Action */}
                    <div className="pt-4 mt-3 border-t border-gray-100 dark:border-slate-850 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5 text-left">
                        <span className="text-lg font-extrabold text-[#FB7185]">₹{p.price}</span>
                        <span className="text-xs text-gray-400 line-through">₹{p.originalPrice}</span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedProductDetails(p)}
                          className="p-2 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200"
                          title="View review listings"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: AI PERSONALIZED STYLIST WITH GEMINI BACKEND PROPS */}
        {currentTab === 'stylist' && (
          <div className="transition-all duration-300">
            <AIStylist 
              darkMode={darkMode}
              catalog={products}
              onAddToCart={handleAddToCart}
              onSelectProduct={(p) => setSelectedProductDetails(p)}
            />
          </div>
        )}

        {/* TAB 4: VALUE FASHION BUNDLES */}
        {currentTab === 'bundles' && (
          <div className="space-y-6 text-left transition-all duration-300">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-indigo-100 text-indigo-700 font-extrabold uppercase tracking-widest font-mono">Special Value Pack</span>
              <h2 className="text-2xl font-bold font-display">Special Value Fashion Bundles</h2>
              <p className="text-xs text-gray-400">Purchase combined coordinates designed for the complete household at dramatic under-₹499 pricing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FASHION_BUNDLES.map((bun) => (
                <div key={bun.id} className={`p-6 rounded-3xl ${darkMode ? 'bg-slate-900 border border-slate-850' : 'neu-flat'} flex flex-col justify-between space-y-4`}>
                  <div className="flex gap-4 items-start col-span-3">
                    <img src={bun.image} alt={bun.name} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] bg-indigo-105 text-indigo-500 font-bold px-2 py-0.5 rounded">{bun.type} Family Pack</span>
                      <h4 className="text-base font-bold font-display">{bun.name}</h4>
                      <p className="text-xs text-gray-450 leading-relaxed">{bun.description}</p>
                    </div>
                  </div>

                  {/* Bundled items checklist */}
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Package Items Included:</p>
                    <div className="space-y-1.5">
                      {bun.products.map((itemValue, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-slate-950 p-2 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-semibold line-clamp-1">{itemValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Savings segment and additive transaction button */}
                  <div className="pt-4 border-t border-gray-100 dark:border-slate-850 flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-emerald-500">Value Pack Save: ₹{bun.savings} Off</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-extrabold text-[#FB7185]">₹{bun.price}</span>
                        <span className="text-xs text-gray-400 line-through">₹{bun.originalPrice}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        // Place mock bundle directly in cart as a single custom product representation
                        const representationalProduct: Product = {
                          id: bun.id,
                          name: bun.name,
                          category: 'Regional',
                          price: bun.price,
                          originalPrice: bun.originalPrice,
                          image: bun.image,
                          description: bun.description,
                          rating: 5.0,
                          reviewsCount: 1,
                          stock: 99,
                          tags: ['Bundle', 'FamilyCombo']
                        };
                        handleAddToCart(representationalProduct);
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-md"
                    >
                      Buy Value Bundle Box
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: REGIONAL TRADITIONAL COLLECTIONS */}
        {currentTab === 'regional' && (
          <div className="space-y-6 text-left transition-all duration-300">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-rose-100 text-rose-700 font-extrabold uppercase tracking-widest font-mono">Artisanal Heritage</span>
              <h2 className="text-2xl font-bold font-display">Indian Regional Weaves Under ₹499</h2>
              <p className="text-xs text-gray-400">Dedicating specialized lookbooks honoring traditional craft societies of India.</p>
            </div>

            {/* Quick selector buttons of regions */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {['All', 'Assam', 'Bengal', 'Punjab', 'Rajasthan', 'South India'].map((reg) => (
                <button
                  key={reg}
                  onClick={() => {
                    setSelectedRegion(reg);
                    setSelectedGender('All');
                    setCurrentTab('shop');
                  }}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedRegion === reg
                      ? 'bg-sky-505 bg-sky-500 text-white scale-105'
                      : (darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white shadow-neumorphic-xs hover:bg-gray-150')
                  }`}
                >
                  {reg === 'All' ? '🎨 View All Regional Craft' : `${reg} Heritage`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Majuli Handwoven Cotton', description: 'Certified Eri cotton weavers of Assam Majuli river islands. Soft, cruelty-free vegan silks under ₹450.', color: 'from-[#C4B5FD] to-transparent' },
                { name: 'Bengal Tant Artistry', description: 'Traditional light weaves with distinct scarlet red-and-white borders. Breathable summer drapes of Bengal.', color: 'from-[#FB7185] to-transparent' },
                { name: 'Phulkari Craft', description: 'Classic darning geometry embroidery. Expressing vibrant colorful floral tilla artwork of Amritsar, Punjab.', color: 'from-[#FBCFE8] to-transparent' },
                { name: 'Bagru Stamp Block-prints', description: 'Hand blocks applied with completely botanical Indigo and madder red dyes of Rajasthan desert tribes.', color: 'from-[#fed7aa] to-transparent' },
                { name: 'Kasavu Traditional Board', description: 'Elite off-white base with bright luxury gold zari. Authentic traditional gold borders of South India.', color: 'from-[#bae6fd] to-transparent' }
              ].map((regStory, idx) => (
                <div key={idx} className={`p-6 rounded-3xl ${darkMode ? 'bg-slate-900 border border-slate-850' : 'neu-flat'} relative overflow-hidden space-y-2`}>
                  <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full bg-gradient-to-br ${regStory.color} opacity-40 blur-xl`}></div>
                  <h4 className="font-bold text-base font-display">{regStory.name}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">{regStory.description}</p>
                  <button 
                    onClick={() => {
                      // Match with region name logic
                      const nameSnippet = regStory.name.split(' ')[0];
                      setSelectedRegion(nameSnippet === 'Majuli' ? 'Assam' : (nameSnippet === 'Kasavu' ? 'South India' : nameSnippet));
                      setSelectedGender('All');
                      setCurrentTab('shop');
                    }}
                    className="p-1 px-3 text-[11px] font-bold text-sky-500 hover:underline inline-flex items-center gap-1 focus:outline-none"
                  >
                    <span>View available garments</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: COMMUNITY CONVERSATIONS AND EARNING FEED */}
        {currentTab === 'community' && (
          <div className="transition-all duration-300">
            <CommunityFeed 
              darkMode={darkMode}
              communityFeed={communityFeed}
              setCommunityFeed={setCommunityFeed}
              catalog={products}
              onSelectProduct={(p) => setSelectedProductDetails(p)}
              onAwardCoins={(amt) => {
                setWallet(prev => ({
                  ...prev,
                  coins: prev.coins + amt,
                  history: [{ date: '2026-06-19', amount: amt, reason: 'Uploaded Look to Community Feed', type: 'coins' }, ...prev.history]
                }));
              }}
            />
          </div>
        )}

        {/* TAB 7: COINS REWARDS LOYALTY PROGRAM */}
        {currentTab === 'rewards' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left transition-all duration-300">
            {/* Left overview */}
            <div className="lg:col-span-1 space-y-6">
              <div className={`p-6 rounded-3xl ${darkMode ? 'bg-slate-905 bg-slate-950 border border-slate-850' : 'neu-flat'} space-y-4`}>
                <Coins className="w-10 h-10 text-amber-500 fill-amber-300 animate-spin" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Loyalty Wallet Balance</span>
                  <h3 className="text-3xl font-extrabold font-display text-amber-500 mt-1">{wallet.coins} Coins</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Value estimation: ₹{(wallet.coins * 0.1).toFixed(2)} savings balance</p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-850 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold">Daily Check-In</p>
                    <p className="text-[10px] text-gray-400">Claim 50 free coins every day</p>
                  </div>
                  <button
                    onClick={handleClaimDailyCheckIn}
                    disabled={hasCheckedInToday}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${
                      hasCheckedInToday 
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed' 
                        : 'bg-amber-400 hover:bg-amber-500 text-gray-900 border border-amber-200'
                    }`}
                  >
                    {hasCheckedInToday ? 'Claimed' : 'Check In'}
                  </button>
                </div>
              </div>

              {/* Referral setup */}
              <div className={`p-5 rounded-xl text-xs ${darkMode ? 'bg-slate-900' : 'bg-white shadow-inner'} space-y-2`}>
                <div className="flex justify-between items-center">
                  <strong>Referral Code:</strong>
                  <span className="font-mono bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded">F4EH-AMIT</span>
                </div>
                <p className="text-gray-400">Receive 200 free Coins for each new Guwahatian buyer relative checkout completed under your ID!</p>
              </div>
            </div>

            {/* Right log list (col-span-2) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-base font-bold flex items-center gap-1.5 border-b border-gray-100 dark:border-slate-850 pb-2">
                <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
                Ledger Coin History Transactions
              </h4>
              <div className="space-y-2.5">
                {wallet.history.map((log, idx) => (
                  <div key={idx} className="p-3 bg-gray-55/40 dark:bg-slate-950 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold">{log.reason}</p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{log.date}</p>
                    </div>
                    <span className={`font-mono font-bold ${log.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {log.amount > 0 ? `+${log.amount}` : log.amount} Coins
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: OPERATOR CONTROL ADMIN BOARD */}
        {currentTab === 'admin' && (
          <div className="transition-all duration-300">
            <AdminPanel 
              darkMode={darkMode}
              products={products}
              setProducts={setProducts}
              orders={orders}
              setOrders={setOrders}
              communityFeed={communityFeed}
              setCommunityFeed={setCommunityFeed}
              couponCodes={couponCodes}
              setCouponCodes={setCouponCodes}
            />
          </div>
        )}

      </main>

      {/* FOOTER MINI-BAR */}
      <footer className={`py-8 mt-12 text-xs text-center border-t ${
        darkMode ? 'bg-slate-950 border-slate-850 text-slate-400' : 'bg-gray-105 border-gray-200 text-gray-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-4 uppercase font-bold text-[10px] tracking-wider text-gray-400">
              <button onClick={() => { setSelectedGender('Regional'); setCurrentTab('shop'); }} className="hover:text-sky-500 focus:outline-none">Regional Colections</button>
              <button onClick={() => setCurrentTab('community')} className="hover:text-sky-500 focus:outline-none">Community Feed</button>
              <button onClick={() => setCurrentTab('bundles')} className="hover:text-sky-500 focus:outline-none">Bundles</button>
              <button onClick={() => setCurrentTab('rewards')} className="hover:text-sky-500 focus:outline-none">Coins Rewards</button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold">Certified Under-₹499 Store</span>
              <span className="text-emerald-500 font-bold">• SECURED</span>
            </div>
          </div>
          <p className="font-mono text-[10px] text-gray-400">
            © 2026 Fashion For Every Home. Supporting Local Weaving Artisans and Smart Budgets Across Guwahati & India.
          </p>
        </div>
      </footer>

      {/* MODAL 1: PRODUCT REVIEW / DETAILS PORTRAIT DRAWER */}
      {selectedProductDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-3xl p-6 ${darkMode ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-gray-800'} shadow-2xl text-left space-y-6 overflow-y-auto max-h-[85vh]`}>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-sky-100 text-sky-700 dark:bg-slate-800 dark:text-sky-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                {selectedProductDetails.category} Category
              </span>
              <button 
                onClick={() => setSelectedProductDetails(null)} 
                className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 text-xs font-mono font-bold"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <img src={selectedProductDetails.image} alt={selectedProductDetails.name} className="w-full aspect-square object-cover rounded-2xl" />
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold font-display">{selectedProductDetails.name}</h4>
                  <p className="text-xs text-gray-400 mt-1 font-mono">PRODUCT IDENTIFICATION: {selectedProductDetails.id}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-[#FB7185]">₹{selectedProductDetails.price}</span>
                  <span className="text-sm text-gray-400 line-through">₹{selectedProductDetails.originalPrice}</span>
                  <span className="text-xs text-emerald-500 font-bold">In Stock ({selectedProductDetails.stock} pieces matching)</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {selectedProductDetails.description}
                </p>

                <div className="text-xs space-y-1 bg-gray-50 dark:bg-slate-950 p-3 rounded-xl font-mono">
                  <p><strong>Fabric Material:</strong> {selectedProductDetails.material || 'Organic Loom Cotton'}</p>
                  <p><strong>Country of Origin:</strong> 100% Bharat Handwoven native styling</p>
                  <p><strong>Standard Sizes:</strong> S, M, L, XL, XXL (Adjustable elastic cuffs)</p>
                </div>

                {/* Buy / Add triggers */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProductDetails);
                      setSelectedProductDetails(null);
                    }}
                    className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs uppercase"
                  >
                    Add to Shop Cart
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrderMessage(selectedProductDetails)}
                    className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 flex items-center gap-1.5"
                  >
                    <span>WhatsApp Order</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews Section with active Coin incentives */}
            <div className="pt-6 border-t border-gray-100 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-bold text-sm tracking-wide">Shared Reviews ({ (customReviews[selectedProductDetails.id] || []).length })</h5>
                <span className="text-[10px] font-mono text-amber-500 bg-amber-50 px-2 py-0.5 rounded">Submit review = +30 coins!</span>
              </div>

              {/* Reviews listing */}
              <div className="space-y-3 max-h-44 overflow-y-auto">
                {(customReviews[selectedProductDetails.id] || []).length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No buyer reports submitted. Be the pioneering fashion advisor!</p>
                ) : (
                  (customReviews[selectedProductDetails.id] || []).map((rev, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-950 text-xs text-left space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{rev.reviewer}</span>
                        <div className="flex gap-0.5 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, rIdx) => <Star key={rIdx} className="w-3 h-3 fill-amber-400" />)}
                        </div>
                      </div>
                      <p className="text-gray-500">{rev.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Leave Review Form */}
              <div className="p-4 rounded-xl bg-gray-55/30 border dark:border-slate-800 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Add clothing Review advisory</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block">Your Name</label>
                    <input 
                      type="text" 
                      value={newReviewerName} 
                      onChange={(e) => setNewReviewerName(e.target.value)}
                      placeholder="e.g. Vikram Sharma" 
                      className="w-full p-2 rounded-xl text-xs bg-white dark:bg-slate-850 mt-1 dark:text-slate-100 border focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block">Stars Select</label>
                    <select 
                      value={newReviewRating} 
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="w-full p-2 rounded-xl text-xs bg-white dark:bg-slate-850 mt-1 border focus:outline-none font-bold"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ Excellent Fit</option>
                      <option value="4">⭐⭐⭐⭐ Great Fit</option>
                      <option value="3">⭐⭐⭐ Standard Value</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block">Shared Advice</label>
                  <input 
                    type="text" 
                    value={newReviewText} 
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="e.g. Pristine thread count, perfectly elastic on waist!" 
                    className="w-full p-2 rounded-xl text-xs bg-white dark:bg-slate-850 mt-1 dark:text-slate-100 border focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Trigger submission sequence
                    handlePostReview(selectedProductDetails.id);
                  }}
                  className="px-5 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs"
                >
                  Publish and claim 30 Coins!
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOMER WISHLIST MODAL VIEW */}
      {currentTab === 'wishlist' && (
        <div className="p-6 rounded-3xl text-left space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xl font-bold font-display">Personal Saved Looks ({wishlist.length})</h3>
            <button onClick={() => setCurrentTab('shop')} className="text-xs text-sky-500 hover:underline">Continue shopping Under ₹499</button>
          </div>

          {wishlist.length === 0 ? (
            <div className="p-12 text-center space-y-2.5">
              <Heart className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">Your wishlist folder is currently empty. Star items to access them anytime here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <div key={item.id} className="p-4 rounded-xl relative bg-white dark:bg-slate-900 border">
                  {/* Remove cross */}
                  <button 
                    onClick={() => handleToggleWishlist(item)} 
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-100 text-red-500 text-xs"
                    title="Remove look"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <img src={item.image} alt={item.name} className="w-full aspect-square object-cover rounded-xl mb-3" />
                  <h4 className="text-sm font-bold line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-[#FB7185] font-extrabold mt-1">₹{item.price}</p>
                  <button
                    onClick={() => {
                      handleAddToCart(item);
                      setWishlist(wishlist.filter(p => p.id !== item.id));
                    }}
                    className="w-full py-2 bg-sky-500 text-white text-xs font-bold rounded-lg mt-3"
                  >
                    Move to Shopping Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 3: SHOPPING CART DRAW-OUT DRAWER OR MAIN SUBVIEW */}
      {currentTab === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left transition-all duration-300">
          
          {/* Cart items - col span 7 */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xl font-bold pb-2 border-b">Active Family Shopping Cart ({cart.length} items)</h3>
            
            {cart.length === 0 ? (
              <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-400 font-mono">Your basket is looking light!</p>
                <button onClick={() => setCurrentTab('shop')} className="px-5 py-2.5 bg-sky-500 text-white text-xs rounded-xl font-bold shadow-md">
                  Browse affordable family clothing
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl flex gap-4 bg-white dark:bg-slate-950 items-center justify-between border">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                    
                    <div className="flex-1 text-left">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-100 line-clamp-1">{item.product.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Size: <span className="font-bold font-mono text-sky-500">{item.selectedSize}</span></p>
                      <p className="text-xs text-[#FB7185] font-extrabold mt-1">₹{item.product.price} each</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUpdateCartQuantity(item.product.id, item.selectedSize || 'M', -1)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs font-mono">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateCartQuantity(item.product.id, item.selectedSize || 'M', 1)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-805 bg-gray-100 dark:bg-slate-800"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right pl-3">
                      <p className="font-bold text-xs">₹{item.product.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout calculator summary - col span 5 */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`p-6 rounded-3xl ${darkMode ? 'bg-slate-900 border border-slate-850' : 'bg-white shadow-neumorphic'} space-y-4`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Checkout Price Worksheet</h4>
              
              {/* Promo section */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-405 block">Promotional Code Offer</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Enter EKO50 or FAMILY75"
                    className="flex-1 p-2 bg-gray-50 dark:bg-slate-950 text-xs rounded-xl focus:outline-none border font-mono"
                  />
                  <button
                    onClick={() => handleApplyPromoCode(promoCodeInput)}
                    className="px-4 py-2 bg-sky-500 rounded-xl text-white text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Coins deduction tick */}
              {wallet.coins > 50 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-slate-950 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="redeem-coins-box"
                      checked={redeemCoinsChecked}
                      onChange={(e) => setRedeemCoinsChecked(e.target.checked)}
                      className="accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="redeem-coins-box" className="cursor-pointer text-amber-900 dark:text-amber-300 font-semibold select-none">
                      Redeem {wallet.coins} Coins
                    </label>
                  </div>
                  <span className="font-bold text-amber-700 dark:text-amber-300 font-mono">-₹{coinSavings.toFixed(2)} savings</span>
                </div>
              )}

              {/* Bill display */}
              <div className="space-y-2 text-xs border-t border-gray-100 dark:border-slate-850 pt-3">
                <div className="flex justify-between text-gray-500">
                  <span>Cart Items Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                {appliedPromoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>Promo Discount ({appliedPromo})</span>
                    <span>-₹{appliedPromoDiscount}</span>
                  </div>
                )}
                {redeemCoinsChecked && (
                  <div className="flex justify-between text-amber-500 font-semibold">
                    <span>Redeemed Coins Savings</span>
                    <span>-₹{coinSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-500 font-bold font-mono">FREE DELIVERY</span>
                </div>
                <div className="flex justify-between font-extrabold text-base pt-2 border-t text-slate-800 dark:text-white">
                  <span>Gross Final Total</span>
                  <span className="text-[#FB7185]">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Check Out button */}
              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setCheckoutSuccessfulOrder(null);
                  setShowCheckoutModal(true);
                }}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all ${
                  cart.length === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
                }`}
              >
                Proceed to Secure Address Checkout
              </button>
            </div>
          </div>

        </div>
      )}

      {/* CHILLER MODAL: SECURE CHECKOUT & DELIVERY DETAILS OVERLAY */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 ${darkMode ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-gray-800'} shadow-2xl text-left space-y-4`}>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-850">
              <h4 className="font-bold text-base flex items-center gap-1.5">
                <Truck className="w-5 h-5 text-sky-500" />
                Guwahati Express Home Delivery Address
              </h4>
              <button onClick={() => setShowCheckoutModal(false)} className="text-xs text-gray-400 font-mono">[Close]</button>
            </div>

            {checkoutSuccessfulOrder ? (
              <div className="space-y-4 py-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl">✓</div>
                <div>
                  <h5 className="font-extrabold text-gray-900 dark:text-white text-sm">Order Logged Successfully!</h5>
                  <p className="text-xs text-emerald-500 font-bold mt-1">Simulated Order ID: {checkoutSuccessfulOrder.id}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-mono">
                    Tracking Number: {checkoutSuccessfulOrder.trackingNumber}
                  </p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed italic pr-4 pl-4 bg-gray-50 dark:bg-slate-950 p-2.5 rounded-xl">
                  "Congratulations! E-commerce logistics engine has dispatched a smart shipment ticket. Track shipment routes in the Operator panel."
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setCurrentTab('admin');
                  }}
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold"
                >
                  Track in Operator Panel
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-300 uppercase">Buyer Delivery Coordinates</label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-950 text-slate-805 text-slate-800 dark:text-slate-100 mt-1 border focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-300 uppercase block mb-1">Select payment layout option</label>
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={() => setPaymentOption('COD')}
                      type="button"
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                        paymentOption === 'COD' ? 'border-[#FB7185] bg-red-50/10' : 'border-gray-250 dark:border-slate-800'
                      }`}
                    >
                      Cash on Delivery (COD)
                    </button>
                    <button
                      onClick={() => setPaymentOption('UPI')}
                      type="button"
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                        paymentOption === 'UPI' ? 'border-[#FB7185] bg-red-50/10' : 'border-gray-250 dark:border-slate-800'
                      }`}
                    >
                      Instant UPI Pay
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Products count:</span>
                    <span>{cart.length} items</span>
                  </div>
                  <div className="flex justify-between font-extrabold">
                    <span>Subtotal:</span>
                    <span className="text-[#FB7185]">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase"
                >
                  Confirm simulated order Placement
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: VOICE COMMAND REVIEWS SIMULATOR */}
      {voiceQueryPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 ${darkMode ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-gray-800'} shadow-2xl text-center space-y-4`}>
            
            <div className="flex justify-between items-center pb-1">
              <h5 className="font-bold flex items-center gap-1.5 font-display">
                <Mic className="w-5 h-5 text-pink-500 animate-pulse" />
                Speech Synthesis Assistant
              </h5>
              <button onClick={() => setVoiceQueryPopup(false)} className="text-xs text-gray-400 font-mono">[Close]</button>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-350 bg-gray-100 dark:bg-slate-955 p-3 rounded-xl italic font-mono text-soft-glow">
              {voiceSearchingText}
            </p>

            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Choose spoken instruction templates:</span>
            <div className="flex flex-col gap-1.5">
              {[
                { label: '🗣️ "Show me Assam Handlooms under ₹499"', act: () => applyVoiceSpeechFilter('', 499, 'All', 'Assam') },
                { label: '🗣️ "Vibrant Kurtis under ₹399"', act: () => applyVoiceSpeechFilter('Kurti', 399, 'Women') },
                { label: '🗣️ "Light cotton shirts for kids under ₹299"', act: () => applyVoiceSpeechFilter('Shirt', 299, 'Kids') }
              ].map((template, i) => (
                <button
                  key={i}
                  onClick={template.act}
                  className="w-full p-2 bg-gray-50 dark:bg-slate-850 hover:bg-gray-105 rounded-lg text-left text-xs text-indigo-500 dark:text-sky-300 font-semibold"
                >
                  {template.label}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-gray-400">Speech-to-text algorithm matches available catalogs in real-time.</p>
          </div>
        </div>
      )}

      {/* MODAL 5: VIRTUAL TRY-ON DETAILED POPUP DRAWER */}
      {triggerTryOnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setTriggerTryOnModal(false)}
              className="absolute top-4 right-4 z-10 px-3.5 py-1.5 rounded-xl bg-gray-100/90 hover:bg-gray-200 text-xs font-mono font-bold text-gray-800"
            >
              [Close sandbox]
            </button>
            <VirtualTryOn darkMode={darkMode} catalog={products} />
          </div>
        </div>
      )}

    </div>
  );
}

// Helper inline to satisfy missing types
function setReviewText(value: string) {
  // Satisfies standard handler signatures
}
