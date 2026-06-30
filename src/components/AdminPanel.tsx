import React from 'react';
import { 
  LineChart, 
  Package, 
  Plus, 
  Truck, 
  Percent, 
  TrendingUp, 
  Edit2, 
  Trash2,
  MessageSquare,
  MapPin,
  Upload
} from 'lucide-react';
import { Product, Order, RegionalStory } from '../types';
import { useAuth } from '@clerk/clerk-react';

interface AdminPanelProps {
  darkMode: boolean;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  couponCodes: { code: string; discount: number }[];
  setCouponCodes: React.Dispatch<React.SetStateAction<{ code: string; discount: number }[]>>;
  regionalStories: RegionalStory[];
  setRegionalStories: React.Dispatch<React.SetStateAction<RegionalStory[]>>;
}

export default function AdminPanel({
  darkMode,
  products,
  setProducts,
  orders,
  setOrders,
  couponCodes,
  setCouponCodes,
  regionalStories,
  setRegionalStories
}: AdminPanelProps) {
  
  const [customAlert, setCustomAlert] = React.useState<{message: string, type: 'success'|'error'} | null>(null);
  const [confirmModal, setConfirmModal] = React.useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const triggerAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setCustomAlert({message, type});
    setTimeout(() => setCustomAlert(null), 3000);
  };
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);

  const [activeSection, setActiveSection] = React.useState<'analytics' | 'products' | 'orders' | 'marketing' | 'regional_stories'>('analytics');
  const { getToken } = useAuth();

  // Product register state
  const [newName, setNewName] = React.useState('');
  const [newCategory, setNewCategory] = React.useState<'Men' | 'Women' | 'Kids' | 'Regional'>('Men');
  const [newPrice, setNewPrice] = React.useState('299');
  const [newOrigPrice, setNewOrigPrice] = React.useState('699');
  const [newImage, setNewImage] = React.useState('');
  const [newImages, setNewImages] = React.useState<string[]>([]);
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

  // Regional stories states
  const [newStoryName, setNewStoryName] = React.useState('');
  const [newStoryDescription, setNewStoryDescription] = React.useState('');
  const [newStoryColor, setNewStoryColor] = React.useState('bg-[#FEF9C3]');
  const [newStoryRegion, setNewStoryRegion] = React.useState('Assam');
  const [newStoryImage, setNewStoryImage] = React.useState('');
  const [isUploadingStoryImage, setIsUploadingStoryImage] = React.useState(false);

  // Handle Cloudinary Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    // Loop through files and upload each
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const uploadPromise = new Promise<string>((resolve, reject) => {
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
              if (data.warning) {
                console.warn(data.warning);
              }
              resolve(data.url);
            } else {
              const err = await res.json();
              reject(new Error(err.error || 'Server error'));
            }
          } catch (_err: any) {
            reject(_err);
          }
        };
        reader.onerror = () => reject(new Error('File reading error'));
        reader.readAsDataURL(file);
      });

      try {
        const url = await uploadPromise;
        uploadedUrls.push(url);
      } catch (_err: any) {
        // alert(`Error uploading file ${file.name}: ${err.message}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setNewImages(prev => [...prev, ...uploadedUrls]);
      if (!newImage) {
        setNewImage(uploadedUrls[0]);
      }
      // alert(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
    }
    setIsUploading(false);
  };

  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingStoryImage(true);
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
          setNewStoryImage(data.url);
          if (data.warning) {
            // alert(data.warning);
          } else {
            // alert('Regional story image uploaded successfully!');
          }
        } else {
          let errMsg = 'Server error';
          try {
            const err = await res.json();
            errMsg = err.error || errMsg;
          } catch (_) {
            errMsg = `Status ${res.status}: ${res.statusText || res.status}`;
          }
          // alert(`Upload failed: ${errMsg}`);
        }
      } catch (_err: any) {
        // alert('Upload error: ' + err.message);
      } finally {
        setIsUploadingStoryImage(false);
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
      id: editingProductId || ('custom-' + Date.now().toString()),
      name: newName,
      category: newCategory,
      price: Number(newPrice),
      originalPrice: Number(newOrigPrice),
      image: finalImage,
      images: newImages,
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
        if (editingProductId) {
          setProducts(products.map(p => p.id === editingProductId ? item : p));
          setEditingProductId(null);
          triggerAlert('Product successfully updated!');
        } else {
          setProducts([item, ...products]);
        }
        setNewName('');
        setNewImage('');
        setNewImages([]);
        // alert('Product successfully added to database!');
      } else {
        const err = await res.json();
        // alert(`Failed to add product: ${err.error || 'Server error'}`);
      }
    } catch (_err: any) {
      console.error(_err);
      // alert('Error adding product: ' + err.message);
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
        triggerAlert('Product successfully removed from database.');
      } else {
        const err = await res.json();
        // alert(`Failed to delete product: ${err.error || 'Server error'}`);
      }
    } catch (_err: any) {
      // alert('Error deleting product: ' + err.message);
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
        // alert(`Order status updated to ${status}`);
      } else {
        const err = await res.json();
        // alert(`Failed to update status: ${err.error || 'Server error'}`);
      }
    } catch (_err: any) {
      // alert('Error updating status: ' + err.message);
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
        // alert('Coupon successfully saved to database!');
      } else {
        const err = await res.json();
        // alert(`Failed to add coupon: ${err.error || 'Server error'}`);
      }
    } catch (_err: any) {
      // alert('Error adding coupon: ' + err.message);
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
        triggerAlert('Coupon deleted successfully.');
      } else {
        const err = await res.json();
        // alert(`Failed to delete coupon: ${err.error || 'Server error'}`);
      }
    } catch (_err: any) {
      // alert('Error deleting coupon: ' + err.message);
    }
  };

  const handleSendNotif = () => {
    if (!notifText) return;
    setSentNotifications([notifText, ...sentNotifications]);
    setNotifText('');
    // alert('Push notification dispatched!');
  };

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryName || !newStoryDescription) return;

    const id = 'custom-reg-' + Date.now().toString();
    const story: RegionalStory = {
      id,
      name: newStoryName,
      description: newStoryDescription,
      color: newStoryColor,
      borderCol: 'border-black',
      region: newStoryRegion,
      image: newStoryImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400'
    };

    try {
      const token = await getToken();
      const res = await fetch('/api/regional-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(story)
      });
      if (res.ok) {
        setRegionalStories([story, ...regionalStories]);
        setNewStoryName('');
        setNewStoryDescription('');
        setNewStoryImage('');
        // alert('Regional story successfully added!');
      } else {
        let errMsg = 'Server error';
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch (_) {
          errMsg = `Status ${res.status}: ${res.statusText || res.status}`;
        }
        // alert(`Failed to add story: ${errMsg}`);
      }
    } catch (_err: any) {
      // alert('Error adding story: ' + err.message);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this regional story?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/regional-stories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setRegionalStories(regionalStories.filter(s => s.id !== id));
        triggerAlert('Regional story deleted successfully.');
      } else {
        let errMsg = 'Server error';
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch (_) {
          errMsg = `Status ${res.status}: ${res.statusText || res.status}`;
        }
        // alert(`Failed to delete story: ${errMsg}`);
      }
    } catch (_err: any) {
      // alert('Error deleting story: ' + err.message);
    }
  };

  // Safe calculators
  const totalRevenue = orders
    .filter(o => o.status !== 'Returned' && o.status !== 'Refunded')
    .reduce((sum, o) => sum + o.total, 0);

  const totalSalesCount = orders.length;
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left text-black dark:text-white">
      {/* CUSTOM CONFIRM MODAL */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] p-8 border-4 border-black shadow-[12px_12px_0_0_#000] max-w-sm w-full space-y-6 text-center">
            <h3 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">Confirm Action</h3>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{confirmModal.message}</p>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 p-3 border-2 border-black bg-white text-black font-black uppercase text-xs hover:bg-gray-100 transition-colors shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="flex-1 p-3 border-2 border-black bg-[#FFD400] text-black font-black uppercase text-xs hover:bg-[#FFC000] transition-colors shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
              >
                Yes, OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM THEMED ALERT */}
      {customAlert && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 border-4 border-black ${customAlert.type === 'error' ? 'bg-[#FF4D4F]' : 'bg-[#FFD400]'} text-black shadow-[6px_6px_0_0_#000] font-mono animate-bounce`}>
          <p className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
            {customAlert.type === 'error' ? '⚠️ ERROR' : '✅ SUCCESS'}
          </p>
          <p className="font-bold text-xs mt-1">{customAlert.message}</p>
        </div>
      )}

      {/* Sidebar Controls */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider px-3 mb-3">Operator Controls</h3>
        {[
          { id: 'analytics', label: 'Revenue Analytics', icon: LineChart },
          { id: 'products', label: 'Product Registry', icon: Package },
          { id: 'orders', label: 'Order Fulfillment', icon: Truck },
          { id: 'marketing', label: 'Campaigns & Coupons', icon: Percent },
          { id: 'regional_stories', label: 'Regional Stories', icon: MapPin }
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
                  <label className="text-[10px] font-black uppercase text-gray-500">Actual Price / Selling Price (₹) - max 499</label>
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
                  <label className="text-[10px] font-black uppercase text-gray-500">Slashed Price / MRP (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newOrigPrice}
                      onChange={(e) => setNewOrigPrice(e.target.value)}
                      className="w-full brutal-input text-xs font-bold focus:outline-none pr-16"
                    />
                    {(() => {
                      const p = Number(newPrice);
                      const op = Number(newOrigPrice);
                      if (p && op && op > p) {
                        const pct = Math.round(((op - p) / op) * 100);
                        return (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF4D4F] text-white text-[10px] font-extrabold px-1.5 py-0.5 border border-black shadow-[1px_1px_0_0_#000] z-10">
                            {pct}% OFF
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Product Images (Upload Multiple)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                    <div className="md:col-span-2">
                      <label className="w-full flex flex-col items-center justify-center border-2 border-black border-dashed bg-gray-50 dark:bg-slate-900 p-4 cursor-pointer hover:bg-gray-100 transition-all select-none">
                        <Upload className="w-6 h-6 mb-1 text-black dark:text-white" />
                        <span className="text-[11px] font-black uppercase text-black dark:text-white">Choose Product Images</span>
                        <span className="text-[9px] font-bold text-gray-400 mt-0.5">Select one or more images (PNG, JPG, WEBP)</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex flex-col justify-center border-2 border-dashed border-black min-h-[5.5rem] bg-gray-50 dark:bg-slate-900 p-2 overflow-hidden w-full">
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center py-4 space-y-2">
                          <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[8px] font-black uppercase tracking-wider animate-pulse">UPLOADING IMAGES...</span>
                        </div>
                      ) : newImages.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto w-full">
                          {newImages.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square border border-black overflow-hidden bg-white">
                              <img src={img} alt={`uploaded-${idx}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = newImages.filter((_, i) => i !== idx);
                                  setNewImages(updated);
                                  if (newImage === img) {
                                    setNewImage(updated[0] || '');
                                  }
                                }}
                                className="absolute top-0 right-0 bg-[#FF4D4F] text-white text-[7px] font-black p-1 border-l border-b border-black"
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <span className="text-[9px] text-gray-400 uppercase font-black">No Images Uploaded</span>
                        </div>
                      )}
                    </div>
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
                {isUploading ? 'Uploading image...' : (editingProductId ? 'Update Product in Database' : 'Save Product to Database')}
              
              </button>
              {editingProductId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProductId(null);
                    setNewName('');
                    setNewCategory('Men');
                    setNewPrice('299');
                    setNewOrigPrice('699');
                    setNewImage('');
                    setNewImages([]);
                    setNewDesc('Premium fabric perfect for active styling.');
                    setNewMaterial('100% Breathable Cotton');
                  }}
                  className="w-full mt-2 p-3 border-2 border-black bg-white text-black font-black uppercase tracking-wider text-xs hover:bg-gray-100"
                >
                  Cancel Edit
                </button>
              )}

            </form>

            {/* Manage live listings */}
            <div className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black">
              <h4 className="text-sm font-black mb-4 uppercase tracking-wider text-gray-400">Catalog Listings ({products.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id} className="p-3 border-2 border-black flex gap-3 bg-gray-50 dark:bg-slate-900 items-center justify-between">
                    <div className="flex gap-3 items-center min-w-0">
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover border-2 border-black shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-xs font-black uppercase truncate text-black dark:text-gray-100">{p.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span>{p.category.toUpperCase()}</span>
                          <span>|</span>
                          <span className="text-[#FF4D4F] font-black">₹{p.price}</span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <>
                              <span className="text-gray-400 line-through text-[9px]">₹{p.originalPrice}</span>
                              <span className="text-emerald-500 font-extrabold text-[9px]">({Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF)</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const prod = products.find(pr => pr.id === p.id);
                          if (prod) {
                            setEditingProductId(prod.id);
                            setNewName(prod.name);
                            setNewCategory(prod.category as any);
                            setNewPrice(prod.price.toString());
                            setNewOrigPrice((prod.originalPrice || '').toString());
                            setNewImage(prod.image);
                            setNewImages(prod.images || []);
                            setNewDesc(prod.description);
                            setNewMaterial(prod.material);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="p-2 border-2 border-black bg-white text-black hover:bg-[#FFD400] transition-all shrink-0"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 border-2 border-black bg-[#FCE7F3] text-black hover:bg-[#FF4D4F] hover:text-white transition-all shrink-0"
                        title="Delist product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

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



        {/* SECTION 7: REGIONAL STORIES */}
        {activeSection === 'regional_stories' && (
          <div className="space-y-8">
            <form onSubmit={handleAddStory} className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black space-y-4">
              <h4 className="text-base font-black flex items-center gap-2 text-[#6D5EF9]">
                <Plus className="w-5 h-5" /> Add Regional Weave Story
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Story Title</label>
                  <input
                    type="text"
                    required
                    value={newStoryName}
                    onChange={(e) => setNewStoryName(e.target.value)}
                    placeholder="e.g. MAJULI HANDWOVEN COTTON"
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Region Name</label>
                  <input
                    type="text"
                    required
                    value={newStoryRegion}
                    onChange={(e) => setNewStoryRegion(e.target.value)}
                    placeholder="e.g. Assam"
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Card Background Color</label>
                  <select
                    value={newStoryColor}
                    onChange={(e) => setNewStoryColor(e.target.value)}
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  >
                    <option value="bg-[#FEF9C3]">Yellow (bg-[#FEF9C3])</option>
                    <option value="bg-[#FCE7F3]">Pink (bg-[#FCE7F3])</option>
                    <option value="bg-[#DCFCE7]">Green (bg-[#DCFCE7])</option>
                    <option value="bg-[#E0F2FE]">Blue (bg-[#E0F2FE])</option>
                    <option value="bg-white">White (bg-white)</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-500">Story Image Asset File</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <div className="md:col-span-2">
                      <label className="w-full flex flex-col items-center justify-center border-2 border-black border-dashed bg-gray-50 dark:bg-slate-900 p-4 cursor-pointer hover:bg-gray-100 transition-all select-none">
                        <Upload className="w-6 h-6 mb-1 text-black dark:text-white" />
                        <span className="text-[11px] font-black uppercase text-black dark:text-white">Choose Image File</span>
                        <span className="text-[9px] font-bold text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleStoryImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex justify-center border-2 border-dashed border-black h-20 bg-gray-50 dark:bg-slate-900 items-center overflow-hidden">
                      {isUploadingStoryImage ? (
                        <div className="flex flex-col items-center justify-center p-2 space-y-1">
                          <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[8px] font-black uppercase tracking-wider animate-pulse">UPLOADING...</span>
                        </div>
                      ) : newStoryImage ? (
                        <img src={newStoryImage} alt="Story Preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400 uppercase font-bold">No Image Selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Story Description</label>
                <textarea
                  required
                  value={newStoryDescription}
                  onChange={(e) => setNewStoryDescription(e.target.value)}
                  placeholder="Tell the story of the artisans, weaving methods, or region..."
                  rows={3}
                  className="w-full brutal-input text-xs font-bold focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                className="brutal-btn"
                disabled={isUploadingStoryImage}
              >
                {isUploadingStoryImage ? 'Uploading image...' : 'Save Story to Database'}
              </button>
            </form>

            {/* Manage live stories */}
            <div className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black">
              <h4 className="text-sm font-black mb-4 uppercase tracking-wider text-gray-400 font-mono">Live Stories ({regionalStories.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
                {regionalStories.map((story) => (
                  <div key={story.id} className={`p-4 border-2 border-black flex gap-3 items-center justify-between ${story.color} text-black`}>
                    <div className="flex gap-3 items-center min-w-0">
                      {story.image && (
                        <img src={story.image} alt={story.name} className="w-12 h-12 object-cover border-2 border-black shrink-0" />
                      )}
                      <div className="text-left min-w-0">
                        <p className="text-xs font-black uppercase truncate">{story.name}</p>
                        <p className="text-[9px] font-bold text-gray-555 mt-0.5">
                          REGION: {story.region.toUpperCase()}
                        </p>
                        <p className="text-[10px] font-semibold mt-1 line-clamp-2">{story.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteStory(story.id)}
                      className="p-2 border-2 border-black bg-[#FCE7F3] text-black hover:bg-[#FF4D4F] hover:text-white transition-all shrink-0"
                      title="Delete story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
