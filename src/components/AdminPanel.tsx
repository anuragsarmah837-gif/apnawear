import React from 'react';
import { 
  LineChart, 
  Settings, 
  Package, 
  Plus, 
  Truck, 
  Percent, 
  UserCheck, 
  Coins, 
  TrendingUp, 
  Users, 
  FileSpreadsheet, 
  Trash2,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { Product, Order, CommunityPost } from '../types';

interface AdminPanelProps {
  darkMode: boolean;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  communityFeed: CommunityPost[];
  setCommunityFeed: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  couponCodes: { code: string; discount: number }[];
  setCouponCodes: React.Dispatch<React.SetStateAction<{ code: string; discount: number }[]>>;
}

export default function AdminPanel({
  darkMode,
  products,
  setProducts,
  orders,
  setOrders,
  communityFeed,
  setCommunityFeed,
  couponCodes,
  setCouponCodes
}: AdminPanelProps) {
  const [activeSection, setActiveSection] = React.useState<'analytics' | 'products' | 'orders' | 'marketing' | 'customers' | 'finance'>('analytics');

  // Product register state
  const [newName, setNewName] = React.useState('');
  const [newCategory, setNewCategory] = React.useState<'Men' | 'Women' | 'Kids' | 'Regional'>('Men');
  const [newPrice, setNewPrice] = React.useState('299');
  const [newOrigPrice, setNewOrigPrice] = React.useState('699');
  const [newImage, setNewImage] = React.useState('https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=400');
  const [newDesc, setNewDesc] = React.useState('Premium fabric perfect for active styling.');
  const [newMaterial, setNewMaterial] = React.useState('100% Breathable Cotton');
  
  // Custom Coupon state
  const [newCoupon, setNewCoupon] = React.useState('');
  const [newDiscount, setNewDiscount] = React.useState('50');

  // Push notifications logs state
  const [notifText, setNotifText] = React.useState('');
  const [sentNotifications, setSentNotifications] = React.useState<string[]>([
    'Monsoon Special: Everything Under ₹299 for next 4 hours!',
    'Assam handloom collection was updated. Get hand-weaved Eri cotton now'
  ]);

  // Form handle
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const item: Product = {
      id: 'custom-' + Date.now().toString(),
      name: newName,
      category: newCategory,
      price: Number(newPrice),
      originalPrice: Number(newOrigPrice),
      image: newImage,
      description: newDesc,
      material: newMaterial,
      rating: 4.8,
      reviewsCount: 1,
      stock: 50,
      tags: ['NewArrival', 'Under499'],
      size: ['S', 'M', 'L', 'XL']
    };
    setProducts([item, ...products]);
    setNewName('');
    alert('Product successfully added to catalog!');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleAddCoupon = () => {
    if (!newCoupon) return;
    setCouponCodes([...couponCodes, { code: newCoupon.toUpperCase(), discount: Number(newDiscount) }]);
    setNewCoupon('');
    alert('Coupon added successfully!');
  };

  const handleRemoveCoupon = (code: string) => {
    setCouponCodes(couponCodes.filter(c => c.code !== code));
  };

  const handleSendNotif = () => {
    if (!notifText) return;
    setSentNotifications([notifText, ...sentNotifications]);
    setNotifText('');
    alert('Push notification dispatched to all devices!');
  };

  // Safe calculators
  const totalRevenue = orders
    .filter(o => o.status !== 'Returned' && o.status !== 'Refunded')
    .reduce((sum, o) => sum + o.total, 0);

  const totalSalesCount = orders.length;
  const gstCollected = totalRevenue * 0.05; // Representational 5% GST

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
      {/* Sidebar Controls */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-widest px-3 mb-3">Operator Controls</h3>
        {[
          { id: 'analytics', label: 'Revenue Analytics', icon: LineChart },
          { id: 'products', label: 'Product Registry', icon: Package },
          { id: 'orders', label: 'Order Fulfillment', icon: Truck },
          { id: 'marketing', label: 'Campaigns & Coupons', icon: Percent },
          { id: 'customers', label: 'Community Feed Moderator', icon: UserCheck },
          { id: 'finance', label: 'Finance & GST', icon: FileSpreadsheet }
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isActive 
                  ? 'bg-sky-500 text-white shadow-sm font-bold' 
                  : (darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-200')
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Section Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* SECTION 1: ANALYTICS */}
        {activeSection === 'analytics' && (
          <div className="space-y-6">
            {/* Quick counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-5 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-850' : 'bg-white shadow-neumorphic-sm'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Gross Simulated Revenue</span>
                <p className="text-2xl font-extrabold font-display text-sky-500 mt-1">₹{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-500 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% this week</span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-850' : 'bg-white shadow-neumorphic-sm'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Dispatched Items</span>
                <p className="text-2xl font-extrabold font-display text-emerald-400 mt-1">{totalSalesCount}</p>
                <span className="text-[10px] text-gray-400">98.3% Delivery success rate</span>
              </div>

              <div className={`p-5 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-850' : 'bg-white shadow-neumorphic-sm'}`}>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Estimated conversion</span>
                <p className="text-2xl font-extrabold font-display text-purple-400 mt-1">4.3%</p>
                <span className="text-[10px] text-gray-400">Industry avg: 1.8%</span>
              </div>
            </div>

            {/* Simulated Charts using HTML divs */}
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'}`}>
              <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                Hourly Orders & Visitors Traffic Analytics
              </h4>
              <div className="h-44 flex items-end justify-between gap-1.5 pt-4">
                {[45, 89, 78, 120, 180, 210, 249, 190, 310, 280, 340, 480].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-sky-400 to-indigo-500 rounded-t-lg transition-all duration-1000" 
                      style={{ height: `${(val / 480) * 120}px` }}
                      title={`Traffic index: ${val}`}
                    ></div>
                    <span className="text-[8px] font-mono mt-1.5 text-gray-400">{(i + 1) * 2}h</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3 font-mono">
                Real-time active visitors count: 3,450 (92% searching under ₹299 products)
              </p>
            </div>
          </div>
        )}

        {/* SECTION 2: PRODUCT REGISTRY */}
        {activeSection === 'products' && (
          <div className="space-y-6">
            <form onSubmit={handleAddProduct} className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'} space-y-4`}>
              <h4 className="text-sm font-bold flex items-center gap-2 text-indigo-500">
                <Plus className="w-4 h-4" /> Add Premium Fashion Product (Under ₹499)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Product title</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Sanganeri Indigo short jacket"
                    className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-950 focus:outline-none"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Regional">Regional Collectors</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Price (₹) - max 499</label>
                  <input
                    type="number"
                    max="499"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Original Price (₹)</label>
                  <input
                    type="number"
                    value={newOrigPrice}
                    onChange={(e) => setNewOrigPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Image URL (Unsplash)</label>
                  <input
                    type="text"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-950 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Material/Weave Info</label>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-950 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Product Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl text-xs bg-gray-50 dark:bg-slate-950 focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Save Product to Catalog
              </button>
            </form>

            {/* Manage live listings */}
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'}`}>
              <h4 className="text-sm font-bold mb-4 uppercase text-gray-400 tracking-wider">Catalog Listings ({products.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl flex gap-3 bg-gray-50 dark:bg-slate-950 items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{p.name}</p>
                        <p className="text-[11px] font-mono text-gray-400">
                          {p.category} | <span className="text-[#FB7185] font-bold">₹{p.price}</span>
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1 text-red-500 hover:text-red-700 bg-red-50 dark:bg-slate-900 rounded-lg"
                      title="Delist product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: ORDER FULFILLMENT */}
        {activeSection === 'orders' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold pb-2 border-b border-gray-100 dark:border-slate-850 flex items-center justify-between">
              <span>Delivery Status Check ({orders.length} active logs)</span>
              <span className="text-xs text-gray-400 font-normal">Manage tracking updates in real-time</span>
            </h4>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center italic text-soft-glow">No customer files initialized. Play around checkout first!</p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className={`p-4 rounded-xl space-y-3 ${darkMode ? 'bg-slate-950' : 'bg-white shadow-neumorphic-xs'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-mono font-bold text-sky-500">Order ID: {o.id}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Buyer Address: {o.address} | Method: {o.paymentMethod}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    {/* Products details */}
                    <div className="flex gap-2 flex-wrap pb-2 border-b border-gray-100 dark:border-slate-850">
                      {o.items.map((i, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-900 p-1 rounded-lg text-[10px]">
                          <img src={i.image} alt={i.name} className="w-5 h-5 rounded object-cover" />
                          <span className="font-semibold">{i.name} x{i.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Fulfillment Buttons */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#FB7185]">Total: ₹{o.total}</span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleUpdateStatus(o.id, 'Shipped')}
                          className="px-2.5 py-1 text-[10px] font-bold bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200"
                        >
                          Ship Out
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(o.id, 'Delivered')}
                          className="px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                        >
                          Deliver
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(o.id, 'Returned')}
                          className="px-2.5 py-1 text-[10px] font-bold bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          Trigger Refund
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: MARKETING CAMPAIGNS */}
        {activeSection === 'marketing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Coupons manager */}
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'}`}>
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-sky-500 mb-3">
                <Percent className="w-4 h-4" /> Add Special Coupon
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block">Promo Code Name</label>
                  <input
                    type="text"
                    value={newCoupon}
                    onChange={(e) => setNewCoupon(e.target.value)}
                    placeholder="e.g. MONSOON20"
                    className="w-full p-2 rounded-xl text-xs bg-gray-100 dark:bg-slate-950 border-none outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block">Value Discount Amount (₹)</label>
                  <input
                    type="number"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    className="w-full p-2 rounded-xl text-xs bg-gray-100 dark:bg-slate-950 border-none outline-none"
                  />
                </div>
                <button
                  onClick={handleAddCoupon}
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Create Code
                </button>
              </div>

              {/* Active Coupons List */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-850">
                <p className="text-xs font-bold text-gray-400 mb-2">Live Promotional Codes</p>
                <div className="space-y-1.5">
                  {couponCodes.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-gray-100 dark:bg-slate-950 text-xs">
                      <span className="font-mono font-bold text-sky-500">{c.code}</span>
                      <div className="flex gap-2 items-center">
                        <span className="font-semibold text-emerald-500">₹{c.discount} Off</span>
                        <button onClick={() => handleRemoveCoupon(c.code)} className="text-red-500 font-mono text-[10px] hover:underline">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Push Notifications Generator */}
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'}`}>
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-[#FB7185] mb-3">
                <MessageSquare className="w-4 h-4" /> Dispatch Push Messages
              </h4>
              <div className="space-y-3 mb-4">
                <textarea
                  value={notifText}
                  onChange={(e) => setNotifText(e.target.value)}
                  placeholder="Type an exciting discount message to push to family devices..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl text-xs bg-gray-105 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
                <button
                  onClick={handleSendNotif}
                  className="w-full py-2 bg-pink-500 text-white rounded-xl text-xs font-bold hover:bg-pink-600"
                >
                  Broadcast Alerts (Simulate API Push)
                </button>
              </div>

              {/* Sent Logs */}
              <div>
                <p className="text-xs font-bold text-gray-400 mb-2">Push Dispatch History</p>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {sentNotifications.map((not, idx) => (
                    <div key={idx} className="p-2 border-l-2 border-indigo-400 bg-gray-50 dark:bg-slate-950 rounded text-[11px] leading-snug">
                      {not}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: CUSTOMER REVIEWS & FEED MODERATION */}
        {activeSection === 'customers' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-400 tracking-wider uppercase">Social Commerce Moderation Panel</h4>
            <p className="text-xs text-gray-550 leading-relaxed">
              Verify looks uploaded by buyers to our community feed. Awarding coins unlocks loyalty circles!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communityFeed.map((post) => (
                <div key={post.id} className="p-3 rounded-xl flex gap-3 bg-gray-100 dark:bg-slate-950 items-start">
                  <img src={post.image} alt="look" className="w-16 h-16 object-cover rounded-lg" />
                  <div className="text-left space-y-1 flex-1">
                    <p className="text-xs font-bold">@{post.username}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-2">{post.caption}</p>
                    <p className="text-[9px] font-mono text-amber-500 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      Coins awarded for this: {post.coinsAwarded} Coins
                    </p>
                    <div className="pt-1 flex gap-2">
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg font-bold">Approved</span>
                      <button 
                        onClick={() => {
                          setCommunityFeed(communityFeed.filter(p => p.id !== post.id));
                        }}
                        className="text-[9px] text-red-500 hover:underline"
                      >
                        Hide Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: GST FINANCE STATS */}
        {activeSection === 'finance' && (
          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'} space-y-5`}>
            <h4 className="text-sm font-bold flex items-center gap-1.5 text-indigo-400">
              <FileSpreadsheet className="w-4 h-4" /> Tax Accountant & Vendor Revenue Reports
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-100 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400">Tax Type</span>
                <p className="text-xs font-bold text-gray-800 dark:text-slate-100 mt-1">E-Commerce GST (5%)</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400">Total GST Liability</span>
                <p className="text-xs font-bold text-emerald-500 mt-1">₹{gstCollected.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400">Vendor payout (90%)</span>
                <p className="text-xs font-bold text-indigo-400 mt-1">₹{(totalRevenue * 0.9).toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-slate-950 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400">Net platform margin (5%)</span>
                <p className="text-xs font-bold text-purple-400 mt-1">₹{(totalRevenue * 0.05).toFixed(2)}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-slate-850 text-xs text-amber-800 dark:text-slate-300 leading-relaxed font-mono">
              <strong>Notice:</strong> This spreadsheet serves as an instant representational compliance worksheet. Real values update automatically upon successful checking out of men, women, or regional shopping cards on our front-end simulator.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
