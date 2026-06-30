import React from 'react';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import VirtualTryOn from './components/VirtualTryOn';
import { Product, CartItem, Order, RegionalStory } from './types';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { 
  ChevronRight, 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  X,
  Plus,
  Minus,
  HelpCircle,
  Smartphone
} from 'lucide-react';

export default function App() {
  const { user, isSignedIn } = useUser();
  const [darkMode] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState<string>('home');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  
  // State catalogs
  const [products, setProducts] = React.useState<Product[]>([]);
  
  // Filter settings
  const [selectedGender, setSelectedGender] = React.useState<string>('All');
  const [maxPriceLimit, setMaxPriceLimit] = React.useState<number>(499);
  const [selectedRegion, setSelectedRegion] = React.useState<string>('All');

  // Customer states
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [wishlist, setWishlist] = React.useState<Product[]>([]);
  const [selectedProductDetails, setSelectedProductDetails] = React.useState<Product | null>(null);
  const [activeModalImage, setActiveModalImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selectedProductDetails) {
      setActiveModalImage(selectedProductDetails.image);
    } else {
      setActiveModalImage(null);
    }
  }, [selectedProductDetails]);

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

  // Coupon promo state (loaded from Neon DB)
  const [couponCodes, setCouponCodes] = React.useState<{ code: string; discount: number }[]>([]);
  const [appliedPromo, setAppliedPromo] = React.useState<string>('');
  const [promoCodeInput, setPromoCodeInput] = React.useState<string>('');
  const [appliedPromoDiscount, setAppliedPromoDiscount] = React.useState<number>(0);

  // Orders registry (loaded from Neon DB)
  const [orders, setOrders] = React.useState<Order[]>([]);

  // Regional Stories (loaded from Neon DB)
  const [regionalStories, setRegionalStories] = React.useState<RegionalStory[]>([]);
  
  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [deliveryAddress, setDeliveryAddress] = React.useState('House No 42, G.S. Road, Guwahati, Assam - 781005');
  const [paymentOption, setPaymentOption] = React.useState('COD');
  const [checkoutSuccessfulOrder, setCheckoutSuccessfulOrder] = React.useState<Order | null>(null);

  // Load database data on component mount
  React.useEffect(() => {
    const fetchDbData = async () => {
      try {
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        if (prodRes.ok && Array.isArray(prodData)) {
          setProducts(prodData);
        } else {
          console.error("Failed to load products array:", prodData);
        }

        const ordRes = await fetch('/api/orders');
        const ordData = await ordRes.json();
        if (ordRes.ok && Array.isArray(ordData)) {
          setOrders(ordData);
        } else {
          console.error("Failed to load orders array:", ordData);
        }

        const coupRes = await fetch('/api/coupons');
        const coupData = await coupRes.json();
        if (coupRes.ok && Array.isArray(coupData)) {
          setCouponCodes(coupData);
        } else {
          console.error("Failed to load coupons array:", coupData);
        }

        const regRes = await fetch('/api/regional-stories');
        const regData = await regRes.json();
        if (regRes.ok && Array.isArray(regData)) {
          setRegionalStories(regData);
        } else {
          console.error("Failed to load regional-stories array:", regData);
        }
      } catch (err) {
        console.error("Error loading Neon DB content:", err);
      }
    };
    fetchDbData();
  }, []);

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

    setNewReviewerName('');
    setNewReviewText('');
    alert('Thank you for sharing your feedback!');
  };

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
  const cartTotal = Math.max(0, cartSubtotal - appliedPromoDiscount);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

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
      trackingNumber: 'TRK-GUW-' + (Math.floor(Math.random() * 90000) + 10000).toString(),
      userEmail: isSignedIn && user ? user.primaryEmailAddress?.emailAddress : undefined
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        setOrders([newOrder, ...orders]);
        setCart([]);
        setCheckoutSuccessfulOrder(newOrder);
        setAppliedPromo('');
        setAppliedPromoDiscount(0);
      } else {
        alert("Failed to save order to database.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error saving order: " + err.message);
    }
  };

  const handleWhatsAppOrderMessage = (product: Product) => {
    const text = `Hi Fashion For Every Home! I would like to order one "${product.name}" for ₹${product.price}. Please guide me on express delivery.`;
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?phone=919000000000&text=${encoded}`, '_blank');
  };

  // Filtered catalog listings
  const filteredCatalog = products.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const genderMatch = selectedGender === 'All' || p.category === selectedGender;
    const priceMatch = p.price <= maxPriceLimit;
    const regionMatch = selectedRegion === 'All' || p.region === selectedRegion;

    return searchMatch && genderMatch && priceMatch && regionMatch;
  });

  const dailyDeals = products.filter(p => p.tags.includes('FlashSale'));

  const cardColors = ['brutal-card-white', 'brutal-card-yellow', 'brutal-card-blue', 'brutal-card-green', 'brutal-card-pink'];

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans bg-white dark:bg-[#111111] text-[#111111] dark:text-white`}>
      
      {/* Header component integration */}
      <Header 
        cart={cart}
        wishlist={wishlist}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 space-y-20">
        
        {/* TAB 1: HOMEPAGE */}
        {currentTab === 'home' && (
          <div className="space-y-20">
            
            {/* HERO SECTION - REDESIGNED SPLIT LAYOUT */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
              {/* Left Column */}
              <div className="lg:col-span-7 text-left space-y-6 flex flex-col items-start">
                <div className="brutal-sticker bg-[#6D5EF9] text-white">
                  STYLE WITHOUT LIMITS 🇮🇳
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] uppercase text-[#111111] dark:text-white">
                  FASHION<br />
                  FOR EVERY<br />
                  INDIAN FAMILY
                </h1>

                <h3 className="text-2xl font-bold uppercase text-[#6D5EF9] dark:text-[#a59bfb] tracking-wider">
                  Clothing Under ₹499
                </h3>
                
                <p className="text-base text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed font-medium">
                  Direct organic looms and handcrafted fabrics delivered straight to your home. Certified clothing tailored for comfort, style, and extreme budget friendliness. No compromises.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setSelectedGender('All');
                      setMaxPriceLimit(499);
                      setCurrentTab('shop');
                    }}
                    className="brutal-btn"
                  >
                    SHOP NOW
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 relative flex justify-center py-10">
                <div className="relative w-full max-w-[380px] brutal-border-3 p-4 bg-white dark:bg-[#1a1a1a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] rotate-[2deg]">
                  <img 
                    src="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800" 
                    alt="Lifestyle Traditional Indian Family Clothing" 
                    className="w-full aspect-[4/5] object-cover brutal-border-3"
                  />
                  
                  {/* Floating stickers */}
                  <div className="absolute top-[-25px] left-[-20px] brutal-sticker bg-[#FFD400]">
                    UNDER ₹499
                  </div>
                  
                  <div className="absolute top-[30%] right-[-30px] brutal-sticker brutal-sticker-green">
                    CERTIFIED
                  </div>
                  
                  <div className="absolute bottom-[20px] left-[-25px] brutal-sticker brutal-sticker-pink">
                    NEW ARRIVALS
                  </div>
                  
                  <div className="absolute bottom-[-15px] right-[-15px] brutal-sticker brutal-sticker-blue">
                    LIMITED STOCK
                  </div>
                </div>
              </div>
            </section>

            {/* CATEGORY SECTION - SQUARE BRUTAL CARDS */}
            <section className="space-y-6 text-left">
              <div>
                <h2 className="text-4xl font-bold uppercase tracking-tight">SHOP BY CATEGORY</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">Select your target family wear segment</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'MEN', emoji: '🤵', gender: 'Men', color: 'bg-white' },
                  { name: 'WOMEN', emoji: '👗', gender: 'Women', color: 'bg-[#FEF9C3]' },
                  { name: 'KIDS', emoji: '👶', gender: 'Kids', color: 'bg-[#DCFCE7]' },
                  { name: 'REGIONAL', emoji: '🎨', gender: 'Regional', color: 'bg-[#E0F2FE]' }
                ].map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedGender(cat.gender);
                      setSelectedRegion('All');
                      setCurrentTab('shop');
                    }}
                    className={`brutal-card p-6 flex flex-col items-center justify-center text-center gap-4 cursor-pointer hover:scale-105 active:scale-95 transition-all ${cat.color}`}
                  >
                    <span className="text-6xl filter drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">{cat.emoji}</span>
                    <span className="text-xl font-extrabold text-black uppercase tracking-wider">{cat.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* PRICE SECTION - PLAYFUL TILES */}
            <section className="space-y-6 text-left">
              <div>
                <h2 className="text-4xl font-bold uppercase tracking-tight">CHOOSE YOUR BUDGET</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">Browse items matching single-tap pricing structures</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'UNDER ₹199', value: 199, color: 'bg-[#FEF9C3]', textCol: 'text-black' },
                  { label: 'UNDER ₹299', value: 299, color: 'bg-[#E0F2FE]', textCol: 'text-black' },
                  { label: 'UNDER ₹399', value: 399, color: 'bg-[#FCE7F3]', textCol: 'text-black' },
                  { label: 'UNDER ₹499', value: 499, color: 'bg-[#DCFCE7]', textCol: 'text-black font-extrabold' }
                ].map((priceOpt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMaxPriceLimit(priceOpt.value);
                      setSelectedRegion('All');
                      setCurrentTab('shop');
                    }}
                    className={`brutal-card p-6 text-left flex flex-col justify-between h-36 cursor-pointer ${priceOpt.color} transition-all`}
                  >
                    <span className="text-xs uppercase font-extrabold tracking-widest opacity-60 text-black">BUDGET TILE</span>
                    <span className="text-3xl font-black tracking-tight text-black">{priceOpt.label}</span>
                    <span className="text-xs font-bold underline text-black">EXPLORE GARMENTS →</span>
                  </button>
                ))}
              </div>
            </section>

            {/* FLASH DEALS SECTION */}
            <section className="p-8 brutal-card-no-hover bg-[#FCE7F3] dark:bg-[#3b1c2b] text-left space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-3 border-black dark:border-white">
                <div className="space-y-1">
                  <div className="brutal-sticker bg-[#FF4D4F] text-white">
                    DAILY SPARK HOUR ⚡
                  </div>
                  <h3 className="text-3xl font-black uppercase text-black dark:text-white mt-2">ACTIVE DAILY ₹99 DEALS</h3>
                </div>
                
                {/* Timer */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-black dark:text-white">ENDS IN:</span>
                  <div className="flex gap-1.5 items-center">
                    <span className="px-3 py-1.5 brutal-border-2 bg-[#FFD400] text-black font-mono font-bold text-xs shadow-sm">
                      {timeLeft.min < 10 ? `0${timeLeft.min}` : timeLeft.min}
                    </span>
                    <span className="font-bold text-black dark:text-white">:</span>
                    <span className="px-3 py-1.5 brutal-border-2 bg-[#FFD400] text-black font-mono font-bold text-xs shadow-sm">
                      {timeLeft.sec < 10 ? `0${timeLeft.sec}` : timeLeft.sec}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deal Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {dailyDeals.map((deal) => (
                  <div key={deal.id} className={`brutal-card p-4 flex flex-col justify-between bg-white dark:bg-[#1a1a1a]`}>
                    <div>
                      <div className="relative aspect-video brutal-border-2 overflow-hidden mb-4 bg-gray-100">
                        <img src={deal.image} alt={deal.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 right-2 bg-[#FF4D4F] text-white font-extrabold text-xs px-2 py-0.5 border-2 border-black rotate-[5deg] shadow-sm">
                          ⚡ ₹99 ONLY
                        </span>
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-tight text-black dark:text-white line-clamp-1">{deal.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{deal.description}</p>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-slate-800 mt-4 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-2xl font-black text-[#FF4D4F]">₹99</span>
                        {deal.originalPrice && deal.originalPrice > 99 && (
                          <>
                            <span className="text-xs text-gray-400 line-through">₹{deal.originalPrice}</span>
                            <span className="text-emerald-500 font-extrabold text-[10px] uppercase">
                              ({Math.round(((deal.originalPrice - 99) / deal.originalPrice) * 100)}% OFF)
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(deal)}
                        className="px-4 py-2 border-[3px] border-black bg-[#FFD400] text-black font-bold uppercase text-xs shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                      >
                        CLAIM DEAL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* OFFERS SECTION - PLAYFUL COUPON CARDS */}
            <section className="space-y-6 text-left">
              <div>
                <h2 className="text-4xl font-bold uppercase tracking-tight">SPECIAL DISCOUNT OFFERS</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">Claim savings coordinates for family shopping lists</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'SAVE ₹50', code: 'EKO50', desc: 'Flat ₹50 off on checkout on minimum purchase', color: 'bg-[#FEF9C3]' },
                  { title: 'SAVE ₹75', code: 'FAMILY75', desc: 'Flat ₹75 off on complete family order baskets', color: 'bg-[#FCE7F3]' },
                  { title: 'FREE SHIPPING', code: 'AUTO-APPLY', desc: 'Free express shipping on all orders to Guwahati', color: 'bg-[#DCFCE7]' }
                ].map((offer, idx) => (
                  <div key={idx} className={`brutal-card-no-hover p-6 border-3 border-black text-left flex flex-col justify-between h-44 relative overflow-hidden ${offer.color}`}>
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl font-black text-black">{offer.title}</span>
                        <div className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase">COUPON</div>
                      </div>
                      <p className="text-xs font-semibold text-black/80 mt-2 max-w-[200px]">{offer.desc}</p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-black/20">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-black/60">PROMO CODE</span>
                        <p className="text-sm font-mono font-black text-black">{offer.code}</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (offer.code !== 'AUTO-APPLY') {
                            setPromoCodeInput(offer.code);
                            setCurrentTab('cart');
                            alert(`Promo code ${offer.code} copied! Added to checkout.`);
                          }
                        }}
                        className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black hover:border-2 hover:border-black transition-all"
                      >
                        USE CODE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* VIRTUAL fitting room shortcut */}
            <section className="brutal-card p-8 bg-white dark:bg-[#1a1a1a] text-left flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3">
                <h4 className="text-2xl font-black uppercase flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-[#6D5EF9]" />
                  TRY OUTWEAR VIRTUALLY BEFORE BUYING!
                </h4>
                <p className="text-sm font-bold text-gray-500 max-w-xl">
                  Not sure if deep indigo pairs with Kalamkari palazzos? Open our Virtual Fitting Sandbox where you can test overlays on real-size models, or test with custom posture files!
                </p>
              </div>
              <button
                onClick={() => setTriggerTryOnModal(true)}
                className="brutal-btn"
              >
                OPEN FITTING SANDBOX
              </button>
            </section>

          </div>
        )}

        {/* TAB 2: GENERAL SHOP AND CATALOG */}
        {currentTab === 'shop' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* Filter sidebar controls */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Category Segment Selector */}
              <div className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black">
                <h4 className="text-sm font-black uppercase text-black dark:text-white tracking-wider mb-4 pb-2 border-b-2 border-black dark:border-white">
                  FAMILY SECTIONS
                </h4>
                <div className="flex flex-col gap-2">
                  {['All', 'Men', 'Women', 'Kids', 'Regional'].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setSelectedGender(item);
                        setSelectedRegion('All');
                      }}
                      className={`w-full text-left p-3 border-2 border-black text-xs font-bold uppercase transition-all shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] ${
                        selectedGender === item 
                          ? 'bg-[#FFD400] text-black translate-x-[2px] translate-y-[2px] shadow-none' 
                          : 'bg-white text-black hover:bg-black hover:text-white dark:bg-[#1a1a1a] dark:text-white'
                      }`}
                    >
                      {item === 'All' ? 'ALL FAMILY CLOTHES' : `${item} COLLECTION`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price filter slider selection */}
              <div className="brutal-card-no-hover p-6 bg-[#FEF9C3] border-3 border-black text-black">
                <h4 className="text-sm font-black uppercase tracking-wider mb-2 pb-2 border-b-2 border-black">
                  PRICE LIMIT
                </h4>
                <div className="flex justify-between text-xs font-extrabold mb-4">
                  <span>MIN: ₹99</span>
                  <span className="bg-[#FF4D4F] text-white px-2 py-0.5 border border-black">MAX: ₹{maxPriceLimit}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {[199, 299, 399, 499].map((val) => (
                    <button
                      key={val}
                      onClick={() => setMaxPriceLimit(val)}
                      className={`w-full py-2 border-2 border-black text-xs font-mono font-bold transition-all shadow-[2px_2px_0_0_#000] ${
                        maxPriceLimit === val
                          ? 'bg-black text-white translate-x-[2px] translate-y-[2px] shadow-none'
                          : 'bg-white hover:bg-black hover:text-white'
                      }`}
                    >
                      UNDER ₹{val}
                    </button>
                  ))}
                </div>
              </div>



            </div>

            {/* Product Listing Main Cards Grid */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Header stats bar */}
              <div className="flex justify-between items-center pb-4 border-b-3 border-black dark:border-white">
                <div>
                  <h2 className="text-3xl font-black uppercase">AFFORDABLE PREMIUM LOOKS</h2>
                  <p className="text-xs font-bold text-gray-500 mt-1">Showing {filteredCatalog.length} tailored selections under ₹499</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 border-2 border-black bg-[#FFD400] text-black text-[10px] font-extrabold uppercase shadow-sm">
                    SECTION: {selectedGender}
                  </span>
                  <span className="px-3 py-1 border-2 border-black bg-[#6D5EF9] text-white text-[10px] font-extrabold uppercase shadow-sm">
                    LIMIT: ₹{maxPriceLimit}
                  </span>
                </div>
              </div>

              {/* Empty state */}
              {filteredCatalog.length === 0 && (
                <div className="brutal-card-no-hover p-12 text-center bg-[#FCE7F3] border-3 border-black text-black space-y-4">
                  <HelpCircle className="w-12 h-12 mx-auto text-black" />
                  <p className="text-lg font-black uppercase">No matching garments found</p>
                  <p className="text-xs font-bold max-w-sm mx-auto">We advise resetting search filters or decreasing restriction parameters.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGender('All');
                      setMaxPriceLimit(499);
                      setSelectedRegion('All');
                    }}
                    className="brutal-btn"
                  >
                    RESET SHOPPING FILTERS
                  </button>
                </div>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredCatalog.map((p, index) => {
                  const cardBgClass = cardColors[index % cardColors.length];
                  return (
                    <div 
                      key={p.id}
                      className={`brutal-card p-4 flex flex-col justify-between text-black ${cardBgClass}`}
                    >
                      <div>
                        {/* Image Preview */}
                        <div className="relative aspect-square brutal-border-3 overflow-hidden mb-3 bg-white">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-200 hover:scale-105" />
                          
                          {/* Tag */}
                          {p.tags.slice(0, 1).map((tg, i) => (
                            <span key={i} className="absolute top-2 left-2 border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white text-black shadow-sm">
                              #{tg}
                            </span>
                          ))}

                          {/* Region */}
                          {p.region && (
                            <span className="absolute bottom-2 left-2 border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase bg-[#FFD400] text-black shadow-sm">
                              {p.region.toUpperCase()}
                            </span>
                          )}

                          {/* Wishlist Button */}
                          <button
                            onClick={() => handleToggleWishlist(p)}
                            className={`absolute top-2 right-2 p-2 border-2 border-black shadow-sm transition-all ${
                              wishlist.some(item => item.id === p.id)
                                ? 'bg-[#FF4D4F] text-white scale-110'
                                : 'bg-white text-black hover:scale-110'
                            }`}
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>

                        {/* Details */}
                        <p className="text-[10px] font-black uppercase tracking-wider opacity-60 mt-2">
                          {p.category} • {p.subCategory || 'Essentials'}
                        </p>
                        
                        <button 
                          onClick={() => setSelectedProductDetails(p)}
                          className="text-left block mt-1 hover:underline focus:outline-none"
                        >
                          <h4 className="text-lg font-black uppercase line-clamp-1">
                            {p.name}
                          </h4>
                        </button>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-current text-black" />
                          <span className="text-xs font-black">{p.rating}</span>
                          <span className="text-[10px] font-bold opacity-60">({p.reviewsCount} reviews)</span>
                        </div>

                        <p className="text-xs font-semibold text-gray-700 mt-2 line-clamp-2">{p.description}</p>
                      </div>

                      {/* Buy Action */}
                      <div className="pt-4 mt-4 border-t border-black/25 flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-2xl font-black text-black dark:text-white">₹{p.price}</span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <>
                              <span className="text-xs text-gray-500 line-through">₹{p.originalPrice}</span>
                              <span className="text-[#FF4D4F] dark:text-rose-400 font-extrabold text-[10px]">
                                ({Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF)
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setSelectedProductDetails(p)}
                            className="p-2 border-2 border-black bg-white text-black font-bold text-xs uppercase hover:bg-black hover:text-white transition-all shadow-sm"
                            title="Details"
                          >
                            INFO
                          </button>
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="px-3 py-2 border-2 border-black bg-[#FFD400] text-black font-bold text-xs uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all shadow-[2px_2px_0_0_#000]"
                          >
                            BUY NOW
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: REGIONAL TRADITIONAL COLLECTIONS */}
        {currentTab === 'regional' && (
          <div className="space-y-8 text-left">
            <div className="space-y-1">
              <div className="brutal-sticker bg-[#FF9800] text-white">
                ARTISANAL HERITAGE 🎨
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tight mt-2">INDIAN REGIONAL WEAVES UNDER ₹499</h2>
              <p className="text-sm font-semibold text-gray-550">Dedicating specialized lookbooks honoring traditional craft societies of India.</p>
            </div>

            {/* Quick selector buttons */}
            <div className="flex gap-2.5 overflow-x-auto pb-4">
              {(['All', ...Array.from(new Set(regionalStories.map(s => s.region)))] as string[]).map((reg) => (
                <button
                  key={reg}
                  onClick={() => {
                    setSelectedRegion(reg);
                  }}
                  className={`px-5 py-3 border-3 border-black text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
                    selectedRegion.toLowerCase() === reg.toLowerCase()
                      ? 'bg-black text-white scale-105'
                      : 'bg-white text-black hover:bg-black hover:text-white dark:bg-[#1a1a1a] dark:text-white shadow-[2px_2px_0_0_#000]'
                  }`}
                >
                  {reg === 'All' ? '🎨 VIEW ALL REGIONAL CRAFT' : `${reg.toUpperCase()} HERITAGE`}
                </button>
              ))}
            </div>

            {regionalStories.length === 0 ? (
              <p className="text-xs font-bold italic opacity-60 text-center py-12">No regional heritage weaves defined yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {regionalStories
                  .filter((story) => selectedRegion === 'All' || story.region.toLowerCase() === selectedRegion.toLowerCase())
                  .map((regStory) => (
                  <div key={regStory.id} className={`brutal-card-no-hover p-0 border-3 ${regStory.borderCol} ${regStory.color} text-black relative overflow-hidden flex flex-col md:flex-row min-h-[14rem]`}>
                    {regStory.image && (
                      <div className="w-full md:w-1/3 h-48 md:h-auto border-b-3 md:border-b-0 md:border-r-3 border-black overflow-hidden bg-gray-150 shrink-0">
                        <img src={regStory.image} alt={regStory.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 border border-black inline-block mb-2">
                          {regStory.region} Heritage
                        </span>
                        <h4 className="font-black text-xl uppercase tracking-tight leading-tight">{regStory.name}</h4>
                        <p className="text-xs font-semibold mt-2 leading-relaxed opacity-85">{regStory.description}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-black/10 flex justify-start">
                        <button 
                          onClick={() => {
                            setSelectedRegion(regStory.region);
                            setSelectedGender('All');
                            setCurrentTab('shop');
                          }}
                          className="py-2.5 px-6 border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-bold uppercase transition-all inline-flex items-center justify-center gap-1.5 shadow-[2px_2px_0_0_#000]"
                        >
                          <span>VIEW {regStory.region.toUpperCase()} GARMENTS</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: OPERATOR CONTROL ADMIN BOARD / USER PORTAL */}
        {currentTab === 'admin' && (
          <div className="transition-all duration-200">
            <SignedIn>
              {isSignedIn && user && (user.publicMetadata?.role === 'admin' || user.unsafeMetadata?.role === 'admin') ? (
                <>
                  <div className="flex justify-between items-center mb-6 p-4 bg-[#FFD400] text-black border-3 border-black shadow-[4px_4px_0_0_#000] font-mono text-xs">
                    <span className="font-black uppercase">🔐 CLERK PROTECTED ACCESS SESSION (ADMIN)</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                  <AdminPanel 
                    darkMode={darkMode}
                    products={products}
                    setProducts={setProducts}
                    orders={orders}
                    setOrders={setOrders}
                    couponCodes={couponCodes}
                    setCouponCodes={setCouponCodes}
                    regionalStories={regionalStories}
                    setRegionalStories={setRegionalStories}
                  />
                </>
              ) : (
                <div className="space-y-6">
                  {/* User Profile Card */}
                  <div className="p-6 border-3 border-black bg-white dark:bg-[#1a1a1a] shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] text-left flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full border-3 border-black bg-white" />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-3 border-black bg-[#FFD400] flex items-center justify-center font-black text-2xl text-black">
                          {user?.firstName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-[#111111] dark:text-white">
                          {user?.fullName || 'Valued Customer'}
                        </h3>
                        <p className="text-xs font-mono text-gray-500 mt-1">
                          EMAIL: {user?.primaryEmailAddress?.emailAddress}
                        </p>
                        <span className="mt-2 inline-block bg-[#DCFCE7] text-[#15803d] border border-[#15803d] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider font-mono">
                          Customer Account
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserButton afterSignOutUrl="/" />
                      <span className="text-xs font-bold text-gray-500">Manage Account</span>
                    </div>
                  </div>

                  {/* Customer Orders list */}
                  <div className="border-3 border-black bg-[#FEF9C3] dark:bg-[#2d2a1b] p-6 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] text-left space-y-4 text-[#111111] dark:text-white">
                    <div className="flex justify-between items-center pb-2 border-b-2 border-black dark:border-white/20">
                      <h4 className="font-black text-lg uppercase tracking-tight">Your Order History</h4>
                      <span className="text-xs font-mono font-bold bg-black text-white px-2 py-1">
                        {orders.filter(o => o.userEmail === user?.primaryEmailAddress?.emailAddress).length} Orders Found
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {orders.filter(o => o.userEmail === user?.primaryEmailAddress?.emailAddress).length === 0 ? (
                        <p className="text-xs font-bold italic opacity-60">You have not placed any orders yet. Start shopping to build your list!</p>
                      ) : (
                        orders
                          .filter(o => o.userEmail === user?.primaryEmailAddress?.emailAddress)
                          .map((order) => (
                            <div key={order.id} className="p-4 border-2 border-black bg-white dark:bg-[#1a1a1a] text-black dark:text-white space-y-3">
                              <div className="flex flex-wrap justify-between items-center gap-2 font-mono text-xs border-b border-black/10 dark:border-white/10 pb-2">
                                <div>
                                  <span className="font-black">ORDER ID: </span>
                                  <span className="font-bold text-[#6D5EF9] dark:text-[#a59bfb]">{order.id}</span>
                                </div>
                                <div>
                                  <span className="font-black">DATE: </span>
                                  <span>{order.date}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {order.items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                      <img src={item.image} alt={item.name} className="w-8 h-8 object-cover border border-black" />
                                      <span className="font-bold line-clamp-1">{item.name} (x{item.quantity})</span>
                                    </div>
                                    <span className="font-mono font-bold">₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                                <div>
                                  <span className="text-xs font-bold text-gray-500">Status: </span>
                                  <span className={`px-2 py-0.5 border text-[10px] font-black uppercase font-mono ${
                                    order.status === 'Processing' ? 'bg-[#FEF9C3] text-black border-yellow-600' :
                                    order.status === 'Shipped' ? 'bg-[#E0F2FE] text-black border-blue-600' :
                                    order.status === 'Delivered' ? 'bg-[#DCFCE7] text-black border-green-600' :
                                    'bg-red-100 text-red-800 border-red-300'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-bold opacity-60">Total: </span>
                                  <span className="text-sm font-black text-[#FF4D4F]">₹{order.total}</span>
                                </div>
                              </div>
                              {order.trackingNumber && (
                                <div className="text-[10px] font-mono font-bold bg-[#E0F2FE] text-black p-2 border border-blue-300">
                                  TRACKING NUMBER: {order.trackingNumber}
                                </div>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </SignedIn>
            <SignedOut>
              <div className="max-w-md mx-auto p-8 brutal-card-no-hover bg-[#FEF9C3] text-black text-center space-y-6 border-3 border-black shadow-[8px_8px_0_0_#000]">
                <h3 className="text-2xl font-black uppercase tracking-tight">Login Required</h3>
                <p className="text-xs font-bold opacity-80">
                  Please log in to view your profile, save your wishlist, and track your order history.
                </p>
                <div className="flex justify-center pt-2">
                  <SignInButton mode="modal">
                    <button className="px-6 py-3 bg-black text-white border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_#ffd400] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                      Log In / Register
                    </button>
                  </SignInButton>
                </div>
              </div>
            </SignedOut>
          </div>
        )}

      </main>

      {/* FOOTER MINI-BAR */}
      <footer className="py-12 mt-20 border-t-3 border-black dark:border-white bg-[#FEF9C3] dark:bg-[#2d2a1b] text-black dark:text-white text-xs font-bold text-left">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div className="flex flex-wrap gap-4 uppercase font-black text-xs tracking-wider">
              <button onClick={() => { setSelectedGender('Regional'); setCurrentTab('shop'); }} className="hover:underline">REGIONAL COLLECTIONS</button>
            </div>
            <div className="flex items-center gap-2 bg-black text-white px-3 py-1.5 border-2 border-black uppercase text-[10px] font-mono">
              <span>CERTIFIED UNDER-₹499 STORE</span>
              <span className="text-[#00C853] font-black">• SECURED</span>
            </div>
          </div>
          <p className="font-mono text-[10px] opacity-60">
            © 2026 APNAWEAR (FASHION FOR EVERY HOME). SUPPORTING LOCAL WEAVING ARTISANS AND SMART BUDGETS ACROSS GUWAHATI & INDIA.
          </p>
        </div>
      </footer>

      {/* MODAL 1: PRODUCT REVIEW / DETAILS DRAWER */}
      {selectedProductDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] text-black dark:text-white border-3 border-black dark:border-white p-6 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] text-left space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <span className="border-2 border-black bg-[#FFD400] text-black font-extrabold px-3 py-1 text-xs uppercase tracking-wider font-mono">
                {selectedProductDetails.category.toUpperCase()} CATEGORY
              </span>
              <button 
                onClick={() => setSelectedProductDetails(null)} 
                className="px-3 py-1.5 border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-black uppercase"
              >
                CLOSE
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-3 w-full">
                <img 
                  src={activeModalImage || selectedProductDetails.image} 
                  alt={selectedProductDetails.name} 
                  className="w-full aspect-square object-cover border-3 border-black bg-white" 
                />
                {selectedProductDetails.images && selectedProductDetails.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {Array.from(new Set([selectedProductDetails.image, ...selectedProductDetails.images])).map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveModalImage(img)}
                        className={`w-12 h-12 border-2 object-cover shrink-0 overflow-hidden transition-all ${
                          (activeModalImage || selectedProductDetails.image) === img 
                            ? 'border-[#FFD400] scale-95 shadow-[1px_1px_0_0_#000]' 
                            : 'border-black opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-2xl font-black uppercase leading-tight">{selectedProductDetails.name}</h4>
                  <p className="text-xs text-gray-500 font-mono mt-1">PRODUCT ID: {selectedProductDetails.id.toUpperCase()}</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-black text-[#FF4D4F]">₹{selectedProductDetails.price}</span>
                  {selectedProductDetails.originalPrice && selectedProductDetails.originalPrice > selectedProductDetails.price && (
                    <>
                      <span className="text-sm text-gray-400 line-through">₹{selectedProductDetails.originalPrice}</span>
                      <span className="text-xs font-extrabold bg-[#FFD400] text-black border-2 border-black px-2 py-0.5 shadow-sm">
                        {Math.round(((selectedProductDetails.originalPrice - selectedProductDetails.price) / selectedProductDetails.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                  <span className="text-xs font-bold border-2 border-black bg-[#DCFCE7] text-black px-2 py-0.5">IN STOCK: {selectedProductDetails.stock}</span>
                </div>

                <p className="text-xs font-semibold leading-relaxed text-gray-700 dark:text-gray-300">
                  {selectedProductDetails.description}
                </p>

                <div className="text-xs space-y-1 bg-[#FEF9C3] text-black p-4 border-2 border-black font-mono">
                  <p><strong>FABRIC MATERIAL:</strong> {selectedProductDetails.material || 'Organic Loom Cotton'}</p>
                  <p><strong>COUNTRY OF ORIGIN:</strong> 100% Bharat Handwoven native styling</p>
                  <p><strong>STANDARD SIZES:</strong> S, M, L, XL, XXL</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProductDetails);
                      setSelectedProductDetails(null);
                    }}
                    className="flex-1 brutal-btn py-3"
                  >
                    ADD TO CART
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrderMessage(selectedProductDetails)}
                    className="brutal-btn brutal-btn-success py-3 px-4"
                  >
                    WHATSAPP
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="pt-6 border-t-3 border-black dark:border-white space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-black text-sm uppercase tracking-wider">Shared Reviews ({ (customReviews[selectedProductDetails.id] || []).length })</h5>
              </div>

              {/* Reviews listing */}
              <div className="space-y-3 max-h-44 overflow-y-auto">
                {(customReviews[selectedProductDetails.id] || []).length === 0 ? (
                  <p className="text-xs font-bold text-gray-400 italic">No buyer reports submitted. Be the pioneering fashion advisor!</p>
                ) : (
                  (customReviews[selectedProductDetails.id] || []).map((rev, i) => (
                    <div key={i} className="p-3 border-2 border-black bg-white dark:bg-[#1a1a1a] text-xs space-y-1">
                      <div className="flex justify-between font-black uppercase">
                        <span>{rev.reviewer}</span>
                        <div className="flex gap-0.5 text-black dark:text-white">
                          {Array.from({ length: rev.rating }).map((_, rIdx) => <Star key={rIdx} className="w-3.5 h-3.5 fill-current" />)}
                        </div>
                      </div>
                      <p className="font-semibold text-gray-600 dark:text-gray-400 mt-1">{rev.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Leave Review Form */}
              <div className="p-4 border-3 border-black bg-[#E0F2FE] text-black space-y-4">
                <p className="text-xs font-black uppercase tracking-wider">Add clothing Review advisory</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase block">Your Name</label>
                    <input 
                      type="text" 
                      value={newReviewerName} 
                      onChange={(e) => setNewReviewerName(e.target.value)}
                      placeholder="e.g. Vikram Sharma" 
                      className="w-full p-2.5 border-2 border-black text-xs bg-white mt-1 text-black font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase block">Stars Select</label>
                    <select 
                      value={newReviewRating} 
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="w-full p-2.5 border-2 border-black text-xs bg-white mt-1 text-black font-black focus:outline-none"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ Excellent Fit</option>
                      <option value="4">⭐⭐⭐⭐ Great Fit</option>
                      <option value="3">⭐⭐⭐ Standard Value</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase block">Shared Advice</label>
                  <input 
                    type="text" 
                    value={newReviewText} 
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="e.g. Pristine thread count, perfectly elastic on waist!" 
                    className="w-full p-2.5 border-2 border-black text-xs bg-white mt-1 text-black font-semibold focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handlePostReview(selectedProductDetails.id);
                  }}
                  className="brutal-btn text-xs py-2 px-4"
                >
                  Publish review
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOMER WISHLIST */}
      {currentTab === 'wishlist' && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center border-b-3 border-black dark:border-white pb-4">
            <h3 className="text-3xl font-black uppercase">Personal Saved Looks ({wishlist.length})</h3>
            <button onClick={() => setCurrentTab('shop')} className="text-xs font-black uppercase underline hover:text-[#6D5EF9]">Continue shopping Under ₹499</button>
          </div>

          {wishlist.length === 0 ? (
            <div className="brutal-card p-12 text-center bg-[#FCE7F3] border-3 border-black text-black space-y-4">
              <Heart className="w-12 h-12 mx-auto text-black" />
              <p className="text-base font-black uppercase">Your wishlist is empty</p>
              <button onClick={() => setCurrentTab('shop')} className="brutal-btn text-xs">Browse clothes</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {wishlist.map((item, index) => (
                <div key={item.id} className={`brutal-card p-4 relative text-black ${cardColors[index % cardColors.length]}`}>
                  <button 
                    onClick={() => handleToggleWishlist(item)} 
                    className="absolute top-2 right-2 p-1.5 border-2 border-black bg-white text-black text-xs font-bold hover:bg-[#FF4D4F] hover:text-white"
                    title="Remove look"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <img src={item.image} alt={item.name} className="w-full aspect-square object-cover brutal-border-2 mb-3 bg-white" />
                  <h4 className="text-sm font-black uppercase line-clamp-1">{item.name}</h4>
                  <p className="text-base font-black text-[#FF4D4F] mt-1">₹{item.price}</p>
                  <button
                    onClick={() => {
                      handleAddToCart(item);
                      setWishlist(wishlist.filter(p => p.id !== item.id));
                    }}
                    className="w-full py-2 bg-black text-white hover:bg-white hover:text-black border-2 border-black text-xs font-bold uppercase mt-3 transition-all"
                  >
                    Move to Shopping Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 3: SHOPPING CART */}
      {currentTab === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Cart items */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-3xl font-black uppercase pb-4 border-b-3 border-black dark:border-white">
              Active Shopping Cart ({cart.length} items)
            </h3>
            
            {cart.length === 0 ? (
              <div className="brutal-card-no-hover p-12 text-center bg-white dark:bg-[#1a1a1a] border-3 border-black space-y-4">
                <ShoppingBag className="w-12 h-12 mx-auto text-black dark:text-white" />
                <p className="text-sm font-bold uppercase">Your basket is looking light!</p>
                <button onClick={() => setCurrentTab('shop')} className="brutal-btn text-xs">
                  Browse affordable family clothing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="p-4 border-3 border-black bg-white dark:bg-[#1a1a1a] flex gap-4 items-center justify-between shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
                    <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover brutal-border-2 bg-white" />
                    
                    <div className="flex-1 text-left">
                      <h4 className="text-base font-black uppercase text-black dark:text-white line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs font-bold text-gray-500 mt-1">
                        Size: <span className="font-black bg-[#FFD400] text-black px-1.5 py-0.5 border border-black font-mono">{item.selectedSize}</span>
                      </p>
                      <p className="text-sm font-black text-[#FF4D4F] mt-1">₹{item.product.price} each</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUpdateCartQuantity(item.product.id, item.selectedSize || 'M', -1)}
                        className="p-1.5 border-2 border-black bg-white text-black font-bold hover:bg-[#FF4D4F] hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-sm font-mono border-2 border-black bg-white text-black px-2.5 py-1">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateCartQuantity(item.product.id, item.selectedSize || 'M', 1)}
                        className="p-1.5 border-2 border-black bg-white text-black font-bold hover:bg-[#00C853] hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right pl-3">
                      <p className="font-black text-base text-black dark:text-white">₹{item.product.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black text-black dark:text-white space-y-6 shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff]">
              <h4 className="text-lg font-black uppercase pb-2 border-b-2 border-black dark:border-white">
                Price Worksheet
              </h4>
              
              {/* Promo code */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase">Promotional Code Offer</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Enter EKO50 or FAMILY75"
                    className="flex-1 p-2.5 border-2 border-black text-xs bg-white text-black font-bold focus:outline-none"
                  />
                  <button
                    onClick={() => handleApplyPromoCode(promoCodeInput)}
                    className="px-4 py-2 border-[3px] border-black bg-[#FFD400] text-black font-bold text-xs uppercase shadow-[2px_2px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    APPLY
                  </button>
                </div>
              </div>



              {/* Bill */}
              <div className="space-y-3 text-xs font-bold uppercase border-t border-black/20 pt-4">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Cart Items Subtotal</span>
                  <span className="font-mono">₹{cartSubtotal}</span>
                </div>
                {appliedPromoDiscount > 0 && (
                  <div className="flex justify-between text-[#00C853]">
                    <span>Promo Discount ({appliedPromo})</span>
                    <span className="font-mono">-₹{appliedPromoDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Delivery Charges</span>
                  <span className="text-[#00C853] font-black">FREE DELIVERY</span>
                </div>
                <div className="flex justify-between font-black text-xl pt-4 border-t-2 border-black dark:border-white text-black dark:text-white">
                  <span>Final Total</span>
                  <span className="text-[#FF4D4F] font-mono">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout */}
              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setCheckoutSuccessfulOrder(null);
                  setShowCheckoutModal(true);
                }}
                className={`w-full py-4 border-[3px] border-black text-sm font-black uppercase text-center transition-all ${
                  cart.length === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300' 
                    : 'bg-[#00C853] text-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>

        </div>
      )}

      {/* CHILLER MODAL: SECURE CHECKOUT */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white border-3 border-black dark:border-white p-6 shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] text-left space-y-6">
            
            <div className="flex justify-between items-center pb-3 border-b-2 border-black dark:border-white">
              <h4 className="font-black text-sm uppercase flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#6D5EF9]" />
                Delivery Address
              </h4>
              <button onClick={() => setShowCheckoutModal(false)} className="text-xs font-black uppercase underline">[Close]</button>
            </div>

            {checkoutSuccessfulOrder ? (
              <div className="space-y-4 py-3 text-center">
                <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-black border-3 border-black flex items-center justify-center mx-auto text-3xl font-black">✓</div>
                <div>
                  <h5 className="font-black uppercase text-lg">Order Logged!</h5>
                  <p className="text-xs text-[#00C853] font-black font-mono mt-1">SIMULATED ID: {checkoutSuccessfulOrder.id}</p>
                  <p className="text-[10px] text-gray-500 mt-2 font-mono">
                    TRACKING: {checkoutSuccessfulOrder.trackingNumber}
                  </p>
                </div>
                <p className="text-xs font-semibold leading-relaxed bg-[#FEF9C3] text-black p-3 border-2 border-black italic">
                  "Congratulations! E-commerce logistics engine has dispatched a smart shipment ticket. Track shipment routes in the Operator panel."
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setCurrentTab('admin');
                  }}
                  className="w-full py-3 bg-black text-white hover:bg-white hover:text-black border-2 border-black text-xs font-bold uppercase transition-all"
                >
                  TRACK IN OPERATOR PANEL
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase block">Step 1: Enter Delivery Coordinates</label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full p-2.5 border-2 border-black text-xs bg-white mt-1 text-black font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase block mb-1">Step 2: Select Payment Option</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentOption('COD')}
                      type="button"
                      className={`p-3 border-2 border-black text-xs font-black uppercase text-center transition-all ${
                        paymentOption === 'COD' ? 'bg-[#FFD400] text-black shadow-[2px_2px_0_0_#000]' : 'bg-white text-black'
                      }`}
                    >
                      CASH ON DELIVERY (COD)
                    </button>
                    <button
                      onClick={() => setPaymentOption('UPI')}
                      type="button"
                      className={`p-3 border-2 border-black text-xs font-black uppercase text-center transition-all ${
                        paymentOption === 'UPI' ? 'bg-[#FFD400] text-black shadow-[2px_2px_0_0_#000]' : 'bg-white text-black'
                      }`}
                    >
                      INSTANT UPI
                    </button>
                  </div>
                </div>

                <div className="p-4 border-2 border-black bg-[#E0F2FE] text-black space-y-1 text-xs font-bold uppercase">
                  <div className="flex justify-between">
                    <span>Products Count:</span>
                    <span>{cart.length} items</span>
                  </div>
                  <div className="flex justify-between font-black text-sm">
                    <span>Final Subtotal:</span>
                    <span className="text-[#FF4D4F] font-mono">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="w-full brutal-btn py-3 text-sm font-black"
                >
                  CONFIRM ORDER PLACEMENT
                </button>
              </div>
            )}
          </div>
        </div>
      )}



      {/* MODAL 5: VIRTUAL TRY-ON */}
      {triggerTryOnModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-none flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-[#111111] border-3 border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] relative overflow-hidden">
            <button
              onClick={() => setTriggerTryOnModal(false)}
              className="absolute top-4 right-4 z-10 px-4 py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-black uppercase"
            >
              CLOSE SANDBOX
            </button>
            <div className="max-h-[90vh] overflow-y-auto">
              <VirtualTryOn darkMode={darkMode} catalog={products} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
