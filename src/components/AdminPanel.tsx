import React from 'react';
import { 
  LineChart, 
  Package, 
  Plus, 
  Truck, 
  Percent, 
  TrendingUp, 
  FileSpreadsheet, 
  Trash2,
  MessageSquare
} from 'lucide-react';
import { Product, Order } from '../types';
import { useAuth } from '@clerk/clerk-react';

interface AdminPanelProps {
  darkMode: boolean;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  couponCodes: { code: string; discount: number }[];
  setCouponCodes: React.Dispatch<React.SetStateAction<{ code: string; discount: number }[]>>;
}

export default function AdminPanel({
  darkMode,
  products,
  setProducts,
  orders,
  setOrders,
  couponCodes,
  setCouponCodes
}: AdminPanelProps) {
  const [activeSection, setActiveSection] = React.useState<'analytics' | 'products' | 'orders' | 'marketing' | 'finance'>('analytics');
  const { getToken } = useAuth();

  // Product register state
  const [newName, setNewName] = React.useState('');
  const [newCategory, setNewCategory] = React.useState<'Men' | 'Women' | 'Kids' | 'Regional'>('Men');
  const [newPrice, setNewPrice] = React.useState('299');
  const [newOrigPrice, setNewOrigPrice] = React.useState('699');
  const [newImage, setNewImage] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('Premium fabric perfect for active styling.');
  const [newMaterial, setNewMaterial] = React.useState('100% Breathable Cotton');
  const [isUploading, setIsUploading] = React.useState(false);
  
  // Custom Coupon state
  const [newCoupon, setNewCoupon] = React.useState('');
  const [newDiscount, setNewDiscount] = React.useState('50');

  // Push notifications logs state
  const [notifText, setNotifText] = React.useState('');
  const [sentNotifications, setSentNotifications] = React.useState<string[]>([
    'Monsoon Special: Everything Under ₹299 for next 4 hours!',
    'Assam handloom collection was updated. Get hand-weaved Eri cotton now'
  ]);

  // Handle Cloudinary Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const token = await getToken();
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64data })
        });
        if (res.ok) {
          const data = await res.json();
          setNewImage(data.url);
          alert('Image uploaded to Cloudinary successfully!');
        } else {
          const err = await res.json();
          alert(`Upload failed: ${err.error || 'Server error'}`);
        }
      } catch (err: any) {
        alert('Upload error: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Form handle for products
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const finalImage = newImage || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=400';
    const item: Product = {
      id: 'custom-' + Date.now().toString(),
      name: newName,
      category: newCategory,
      price: Number(newPrice),
      originalPrice: Number(newOrigPrice),
      image: finalImage,
      description: newDesc,
      material: newMaterial,
      rating: 4.8,
      reviewsCount: 1,
      stock: 50,
      tags: ['NewArrival', 'Under499'],
      size: ['S', 'M', 'L', 'XL']
    };

    try {
      const token = await getToken();
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        setProducts([item, ...products]);
        setNewName('');
        setNewImage('');
        alert('Product successfully added to database!');
      } else {
        const err = await res.json();
        alert(`Failed to add product: ${err.error || 'Server error'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error adding product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delist this product?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        alert('Product successfully removed from database.');
      } else {
        const err = await res.json();
        alert(`Failed to delete product: ${err.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
        alert(`Order status updated to ${status}`);
      } else {
        const err = await res.json();
        alert(`Failed to update status: ${err.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleAddCoupon = async () => {
    if (!newCoupon) return;
    try {
      const token = await getToken();
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: newCoupon, discount: Number(newDiscount) })
      });
      if (res.ok) {
        setCouponCodes([...couponCodes, { code: newCoupon.toUpperCase(), discount: Number(newDiscount) }]);
        setNewCoupon('');
        alert('Coupon successfully saved to database!');
      } else {
        const err = await res.json();
        alert(`Failed to add coupon: ${err.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert('Error adding coupon: ' + err.message);
    }
  };

  const handleRemoveCoupon = async (code: string) => {
    if (!confirm(`Are you sure you want to remove coupon ${code}?`)) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/coupons/${code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setCouponCodes(couponCodes.filter(c => c.code !== code));
        alert('Coupon deleted successfully.');
      } else {
        const err = await res.json();
        alert(`Failed to delete coupon: ${err.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert('Error deleting coupon: ' + err.message);
    }
  };

  const handleSendNotif = () => {
    if (!notifText) return;
    setSentNotifications([notifText, ...sentNotifications]);
    setNotifText('');
    alert('Push notification dispatched!');
  };

  // Safe calculators
  const totalRevenue = orders
    .filter(o => o.status !== 'Returned' && o.status !== 'Refunded')
    .reduce((sum, o) => sum + o.total, 0);

  const totalSalesCount = orders.length;
  const gstCollected = totalRevenue * 0.05; // Representational 5% GST

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left text-black dark:text-white">
      {/* Sidebar Controls */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider px-3 mb-3">Operator Controls</h3>
        {[
          { id: 'analytics', label: 'Revenue Analytics', icon: LineChart },
          { id: 'products', label: 'Product Registry', icon: Package },
          { id: 'orders', label: 'Order Fulfillment', icon: Truck },
          { id: 'marketing', label: 'Campaigns & Coupons', icon: Percent },
          { id: 'finance', label: 'Finance & GST', icon: FileSpreadsheet }
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 border-2 border-black text-xs font-black uppercase tracking-wider transition-all shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#fff] ${
                isActive 
                  ? 'bg-[#FFD400] text-black translate-x-[2px] translate-y-[2px] shadow-none' 
                  : 'bg-white dark:bg-[#1a1a1a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Section Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* SECTION 1: ANALYTICS */}
        {activeSection === 'analytics' && (
          <div className="space-y-8">
            {/* Quick counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="brutal-card-no-hover p-5 bg-[#E0F2FE] text-black border-3 border-black shadow-[4px_4px_0_0_#000]">
                <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Gross Revenue</span>
                <p className="text-3xl font-black mt-2">₹{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-[#00C853]">
                  <TrendingUp className="w-4 h-4" />
                  <span>+18.4% this week</span>
                </div>
              </div>

              <div className="brutal-card-no-hover p-5 bg-[#DCFCE7] text-black border-3 border-black shadow-[4px_4px_0_0_#000]">
                <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Dispatched Items</span>
                <p className="text-3xl font-black mt-2">{totalSalesCount}</p>
                <span className="text-[10px] font-bold text-gray-550 block mt-3">98.3% Delivery success rate</span>
              </div>

              <div className="brutal-card-no-hover p-5 bg-[#FCE7F3] text-black border-3 border-black shadow-[4px_4px_0_0_#000]">
                <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Estimated conversion</span>
                <p className="text-3xl font-black mt-2">4.3%</p>
                <span className="text-[10px] font-bold text-gray-550 block mt-3">Industry avg: 1.8%</span>
              </div>
            </div>

            {/* Simulated Charts */}
            <div className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black">
              <h4 className="text-sm font-black mb-4 flex items-center gap-2 uppercase tracking-wide">
                <TrendingUp className="w-5 h-5 text-[#6D5EF9]" />
                Hourly Orders & Visitors Traffic Analytics
              </h4>
              <div className="h-44 flex items-end justify-between gap-2.5 pt-4 border-b-2 border-black dark:border-white">
                {[45, 89, 78, 120, 180, 210, 249, 190, 310, 280, 340, 480].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-[#FFD400] border-2 border-black rounded-t transition-all hover:bg-[#6D5EF9]" 
                      style={{ height: `${(val / 480) * 120}px` }}
                      title={`Traffic index: ${val}`}
                    ></div>
                    <span className="text-[8px] font-mono font-bold mt-2 text-gray-400">{(i + 1) * 2}H</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3 font-mono font-bold">
                Real-time active visitors count: 3,450 (92% searching under ₹299 products)
              </p>
            </div>
          </div>
        )}

        {/* SECTION 2: PRODUCT REGISTRY */}
        {activeSection === 'products' && (
          <div className="space-y-8">
            <form onSubmit={handleAddProduct} className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black space-y-4">
              <h4 className="text-base font-black flex items-center gap-2 text-[#6D5EF9]">
                <Plus className="w-5 h-5" /> Add Premium Fashion Product (Under ₹499)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Product Title</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Sanganeri Indigo short jacket"
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Regional">Regional Collectors</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Price (₹) - max 499</label>
                  <input
                    type="number"
                    max="499"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Original Price (₹)</label>
                  <input
                    type="number"
                    value={newOrigPrice}
                    onChange={(e) => setNewOrigPrice(e.target.value)}
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Image Asset</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-xs"
                    />
                    {isUploading && <span className="text-xs text-gray-400 italic">Uploading to Cloudinary...</span>}
                    <input
                      type="text"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="Or enter image URL directly"
                      className="w-full brutal-input text-xs font-bold focus:outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Material/Weave Info</label>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Product Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full brutal-input text-xs font-bold focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                className="brutal-btn"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading image...' : 'Save Product to Database'}
              </button>
            </form>

            {/* Manage live listings */}
            <div className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black">
              <h4 className="text-sm font-black mb-4 uppercase tracking-wider text-gray-400">Catalog Listings ({products.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id} className="p-3 border-2 border-black flex gap-3 bg-gray-50 dark:bg-slate-900 items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover border-2 border-black shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-xs font-black uppercase truncate text-black dark:text-gray-100">{p.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                          {p.category.toUpperCase()} | <span className="text-[#FF4D4F] font-black">₹{p.price}</span>
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 border-2 border-black bg-[#FCE7F3] text-black hover:bg-[#FF4D4F] hover:text-white transition-all shrink-0"
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
          <div className="space-y-6">
            <h4 className="text-xl font-black uppercase pb-3 border-b-3 border-black dark:border-white flex justify-between items-center">
              <span>Delivery Status Check ({orders.length} active logs)</span>
              <span className="text-xs text-gray-400 font-semibold uppercase">Real-time status tracking</span>
            </h4>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-xs font-black text-gray-400 py-10 text-center italic">No customer files initialized. Play around checkout first!</p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-4 border-3 border-black bg-white dark:bg-[#1a1a1a] space-y-4 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-xs font-mono font-black text-[#6D5EF9]">Order ID: {o.id}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1">Buyer Address: {o.address} | Method: {o.paymentMethod}</p>
                      </div>
                      <span className={`px-3 py-1 border-2 border-black text-[9px] font-black uppercase ${
                        o.status === 'Delivered' ? 'bg-[#DCFCE7] text-black' : 'bg-[#FEF9C3] text-black'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    {/* Products details */}
                    <div className="flex gap-2.5 flex-wrap pb-3 border-b-2 border-black/10">
                      {o.items.map((i, idx) => (
                        <div key={idx} className="flex items-center gap-2 border-2 border-black bg-gray-50 dark:bg-slate-900 p-1.5 text-[10px] font-bold">
                          <img src={i.image} alt={i.name} className="w-6 h-6 object-cover border border-black" />
                          <span className="uppercase">{i.name} x{i.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Fulfillment Buttons */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-[#FF4D4F] text-sm">Total: ₹{o.total}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(o.id, 'Shipped')}
                          className="px-3 py-1.5 border-2 border-black bg-[#E0F2FE] text-black text-[10px] font-black uppercase hover:bg-black hover:text-white"
                        >
                          Ship Out
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(o.id, 'Delivered')}
                          className="px-3 py-1.5 border-2 border-black bg-[#DCFCE7] text-black text-[10px] font-black uppercase hover:bg-black hover:text-white"
                        >
                          Deliver
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(o.id, 'Returned')}
                          className="px-3 py-1.5 border-2 border-black bg-[#FCE7F3] text-black text-[10px] font-black uppercase hover:bg-black hover:text-white"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Coupons manager */}
            <div className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black space-y-4">
              <h4 className="text-base font-black flex items-center gap-2 text-[#6D5EF9]">
                <Percent className="w-5 h-5" /> Add Special Coupon
              </h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Promo Code Name</label>
                  <input
                    type="text"
                    value={newCoupon}
                    onChange={(e) => setNewCoupon(e.target.value)}
                    placeholder="e.g. MONSOON20"
                    className="w-full brutal-input text-xs font-bold font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Discount Amount (₹)</label>
                  <input
                    type="number"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleAddCoupon}
                  className="w-full brutal-btn"
                >
                  Create Code
                </button>
              </div>

              {/* Active Coupons List */}
              <div className="mt-4 pt-4 border-t-2 border-black/10">
                <p className="text-xs font-black uppercase text-gray-400 mb-2">Live Promo Codes</p>
                <div className="space-y-2">
                  {couponCodes.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 border-2 border-black bg-gray-50 dark:bg-slate-900 text-xs font-bold">
                      <span className="font-mono font-black text-[#6D5EF9]">{c.code}</span>
                      <div className="flex gap-3 items-center">
                        <span className="text-[#00C853]">₹{c.discount} Off</span>
                        <button onClick={() => handleRemoveCoupon(c.code)} className="text-[#FF4D4F] hover:underline uppercase text-[10px] font-black">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Push Notifications Generator */}
            <div className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black space-y-4">
              <h4 className="text-base font-black flex items-center gap-2 text-[#FF4D4F]">
                <MessageSquare className="w-5 h-5" /> Dispatch Push Messages
              </h4>
              <div className="space-y-4">
                <textarea
                  value={notifText}
                  onChange={(e) => setNotifText(e.target.value)}
                  placeholder="Type an exciting discount message to push to family devices..."
                  rows={2}
                  className="w-full brutal-input text-xs font-bold focus:outline-none"
                />
                <button
                  onClick={handleSendNotif}
                  className="w-full brutal-btn bg-[#FF4D4F] text-white"
                >
                  Broadcast Alerts
                </button>
              </div>

              {/* Sent Logs */}
              <div className="pt-4 border-t-2 border-black/10">
                <p className="text-xs font-black uppercase text-gray-400 mb-2">Push Dispatch History</p>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {sentNotifications.map((not, idx) => (
                    <div key={idx} className="p-2 border-l-4 border-[#6D5EF9] bg-gray-50 dark:bg-slate-900 text-[11px] font-semibold leading-relaxed">
                      {not}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: GST FINANCE STATS */}
        {activeSection === 'finance' && (
          <div className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black space-y-6">
            <h4 className="text-base font-black flex items-center gap-2 text-[#6D5EF9]">
              <FileSpreadsheet className="w-5 h-5" /> Tax Accountant & Vendor Revenue Reports
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {[
                { title: 'Tax Type', desc: 'E-Commerce GST (5%)', col: 'bg-white' },
                { title: 'GST Liability', desc: `₹${gstCollected.toFixed(2)}`, col: 'bg-[#DCFCE7]' },
                { title: 'Vendor payout (90%)', desc: `₹${(totalRevenue * 0.9).toFixed(2)}`, col: 'bg-[#E0F2FE]' },
                { title: 'Net margin (5%)', desc: `₹${(totalRevenue * 0.05).toFixed(2)}`, col: 'bg-[#FCE7F3]' }
              ].map((report, idx) => (
                <div key={idx} className={`p-4 border-2 border-black text-black ${report.col} flex flex-col justify-center min-h-[90px]`}>
                  <span className="text-[9px] font-black uppercase opacity-60">{report.title}</span>
                  <p className="text-sm font-black uppercase mt-1 leading-snug">{report.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-2 border-black bg-[#FEF9C3] text-black text-xs font-mono leading-relaxed font-bold">
              <strong>Notice:</strong> This spreadsheet serves as an instant representational compliance worksheet. Real values update automatically upon successful checking out of men, women, or regional shopping cards on our front-end simulator.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
