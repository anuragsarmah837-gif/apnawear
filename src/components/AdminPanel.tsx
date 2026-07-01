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
  Upload,
  Tags
} from 'lucide-react';
import { Product, Order, RegionalStory, GalleryConfig } from '../types';
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
  galleryConfigs: GalleryConfig[];
  setGalleryConfigs: React.Dispatch<React.SetStateAction<GalleryConfig[]>>;
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
      img.onerror = () => reject(new Error('Image load error'));
    };
    reader.onerror = () => reject(new Error('File read error'));
  });
};

export default function AdminPanel({
  darkMode: _darkMode,
  products,
  setProducts,
  orders,
  setOrders,
  couponCodes,
  setCouponCodes,
  regionalStories,
  setRegionalStories,
  galleryConfigs,
  setGalleryConfigs
}: AdminPanelProps) {
  
  const [customAlert, setCustomAlert] = React.useState<{message: string, type: 'success'|'error'} | null>(null);
  const [confirmModal, setConfirmModal] = React.useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const triggerAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setCustomAlert({message, type});
    setTimeout(() => setCustomAlert(null), 3000);
  };
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);

  const [activeSection, setActiveSection] = React.useState<'analytics' | 'products' | 'categories' | 'orders' | 'marketing' | 'regional_stories' | 'gallery'>('analytics');
  const { getToken } = useAuth();

  type CategoryData = { image: string; subcategories: Record<string, { image: string }> };
  const [categoriesMap, setCategoriesMap] = React.useState<Record<string, CategoryData>>(() => {
    const saved = localStorage.getItem('apnawear_categories_v2');
    if (saved) return JSON.parse(saved);
    
    // Migration from v1
    const savedV1 = localStorage.getItem('apnawear_categories');
    if (savedV1) {
       const parsed = JSON.parse(savedV1);
       const migrated: Record<string, CategoryData> = {};
       for (const key in parsed) {
         if (Array.isArray(parsed[key])) {
           migrated[key] = { image: '', subcategories: {} };
           parsed[key].forEach((sub: string) => {
             migrated[key].subcategories[sub] = { image: '' };
           });
         } else {
           migrated[key] = parsed[key] as CategoryData;
         }
       }
       return migrated;
    }

    return {
      'Men': { image: '', subcategories: { 'T-Shirts': { image: '' }, 'Pants': { image: '' }, 'Kurtas': { image: '' } } },
      'Women': { image: '', subcategories: { 'Sarees': { image: '' }, 'Kurtas': { image: '' } } },
      'Kids': { image: '', subcategories: { 'T-Shirts': { image: '' }, 'Toys': { image: '' } } },
      'Other': { image: '', subcategories: { 'Accessories': { image: '' } } }
    };
  });

  React.useEffect(() => {
    localStorage.setItem('apnawear_categories_v2', JSON.stringify(categoriesMap));
  }, [categoriesMap]);

  const uploadImageFile = async (file: File): Promise<string> => {
    const compressedBase64 = await compressImage(file);
    const token = await getToken();
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ image: compressedBase64 })
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, catName: string, subCatName?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      triggerAlert('Uploading image...');
      const url = await uploadImageFile(file);
      setCategoriesMap(prev => {
        const updated = { ...prev };
        if (subCatName) {
          updated[catName].subcategories[subCatName].image = url;
        } else {
          updated[catName].image = url;
        }
        return updated;
      });
      triggerAlert('Image uploaded successfully!');
    } catch (err: any) {
      triggerAlert('Error uploading image', 'error');
    }
  };

  // Categories Management State
  const [newCatName, setNewCatName] = React.useState('');
  const [newCatImagePreview, setNewCatImagePreview] = React.useState<string | null>(null);

  // Product register state
  const [newName, setNewName] = React.useState('');
  const [newCategory, setNewCategory] = React.useState(Object.keys(categoriesMap)[0] || '');
  const [newSubcategory, setNewSubcategory] = React.useState('');
  const [newPrice, setNewPrice] = React.useState('');
  const [newOrigPrice, setNewOrigPrice] = React.useState('');
  const [newImage, setNewImage] = React.useState('');
  const [newImages, setNewImages] = React.useState<string[]>([]);
  const [newDesc, setNewDesc] = React.useState('');
  const [newMaterial, setNewMaterial] = React.useState('');
  const [newTags, setNewTags] = React.useState('');
  const [newSizes, setNewSizes] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    if (!categoriesMap[newCategory]) {
      setNewCategory(Object.keys(categoriesMap)[0] || '');
    }
  }, [categoriesMap, newCategory]);
  
  // Custom Coupon state
  const [newCoupon, setNewCoupon] = React.useState('');
  const [newDiscount, setNewDiscount] = React.useState('50');

  // Push notifications logs state
  const [notifText, setNotifText] = React.useState('');
  const [sentNotifications, setSentNotifications] = React.useState<string[]>([]);

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
    
    try {
      const uploadPromises = Array.from(files).map(async (file: File) => {
        const compressedBase64 = await compressImage(file);
        const token = await getToken();
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: compressedBase64 })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Server error');
        }
        const data = await res.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (uploadedUrls.length > 0) {
        setNewImages(prev => [...prev, ...uploadedUrls]);
        if (!newImage) {
          setNewImage(uploadedUrls[0]);
        }
        triggerAlert(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
      }
    } catch (err: any) {
      console.error('Error uploading files:', err);
      triggerAlert(err.message || 'Error uploading files', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingStoryImage(true);
    try {
      const compressedBase64 = await compressImage(file);
      const token = await getToken();
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image: compressedBase64 })
      });
      if (res.ok) {
        const data = await res.json();
        setNewStoryImage(data.url);
        triggerAlert('Regional story image uploaded successfully!');
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }
    } catch (err: any) {
      triggerAlert('Upload error: ' + err.message, 'error');
    } finally {
      setIsUploadingStoryImage(false);
    }
  };

  // Form handle for products
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      triggerAlert('Product title is required.', 'error');
      return;
    }
    if (!newImage) {
      triggerAlert('Please upload at least one product image.', 'error');
      return;
    }
    const finalImage = newImage;
    const item: Product = {
      id: editingProductId || ('custom-' + Date.now().toString()),
      name: newName,
      category: newCategory,
      subCategory: newSubcategory,
      price: Number(newPrice),
      originalPrice: Number(newOrigPrice),
      image: finalImage,
      images: newImages,
      description: newDesc,
      material: newMaterial,
      rating: 0,
      reviewsCount: 0,
      stock: 10,
      tags: newTags.split(',').map(s => s.trim()).filter(Boolean),
      size: newSizes.split(',').map(s => s.trim()).filter(Boolean)
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
        setNewCategory(Object.keys(categoriesMap)[0] || '');
        setNewSubcategory('');
        setNewPrice('');
        setNewOrigPrice('');
        setNewImage('');
        setNewImages([]);
        setNewDesc('');
        setNewMaterial('');
        setNewTags('');
        setNewSizes('');
        // alert('Product successfully added to database!');
      } else {
        const err = await res.json();
        triggerAlert(err.error || 'Failed to add product', 'error');
      }
    } catch (_err: any) {
      console.error(_err);
      // alert('Error adding product: ' + err.message);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delist this product?',
      onConfirm: async () => {
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
            triggerAlert(err.error || 'Failed to delete product', 'error');
          }
        } catch (_err: any) {
          // alert('Error deleting product: ' + err.message);
        }
      }
    });
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
        triggerAlert(err.error || 'Failed to update status', 'error');
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
        triggerAlert(err.error || 'Failed to add coupon', 'error');
      }
    } catch (_err: any) {
      // alert('Error adding coupon: ' + err.message);
    }
  };

  const handleRemoveCoupon = (code: string) => {
    setConfirmModal({
      isOpen: true,
      message: `Are you sure you want to remove coupon ${code}?`,
      onConfirm: async () => {
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
            triggerAlert(err.error || 'Failed to delete coupon', 'error');
          }
        } catch (_err: any) {
          // alert('Error deleting coupon: ' + err.message);
        }
      }
    });
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

  const handleDeleteStory = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this regional story?',
      onConfirm: async () => {
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
      }
    });
  };

  // Safe calculators
  const totalRevenue = orders
    .filter(o => o.status !== 'Returned' && o.status !== 'Refunded')
    .reduce((sum, o) => sum + o.total, 0);

  const totalSalesCount = orders.length;

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, field: 'imageLeft' | 'imageCenter' | 'imageRight') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      triggerAlert('Uploading gallery image...');
      const url = await uploadImageFile(file);
      const newConfigs = [...galleryConfigs];
      newConfigs[index][field] = url;
      setGalleryConfigs(newConfigs);
      triggerAlert('Image uploaded successfully!');
    } catch (err: any) {
      triggerAlert('Error uploading image', 'error');
    }
  };
  


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
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] p-6 border-4 border-black ${customAlert.type === 'error' ? 'bg-[#FF4D4F]' : 'bg-[#FFD400]'} text-black shadow-[12px_12px_0_0_#000] font-mono text-center max-w-sm w-full animate-bounce`}>
          <p className="font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
            {customAlert.type === 'error' ? '⚠️ ERROR' : '✅ SUCCESS'}
          </p>
          <p className="font-bold text-sm mt-2">{customAlert.message}</p>
        </div>
      )}

      {/* Sidebar Controls */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider px-3 mb-3">Operator Controls</h3>
        {[
          { id: 'analytics', label: 'Revenue Analytics', icon: LineChart },
          { id: 'categories', label: 'Categories Management', icon: Tags },
          { id: 'products', label: 'Product Registry', icon: Package },
          { id: 'orders', label: 'Order Fulfillment', icon: Truck },
          { id: 'marketing', label: 'Campaigns & Coupons', icon: Percent },
          { id: 'regional_stories', label: 'Regional Stories', icon: MapPin },
          { id: 'gallery', label: 'Gallery Content', icon: Edit2 }
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

        {/* SECTION 2: CATEGORIES MANAGEMENT */}
        {activeSection === 'categories' && (
          <div className="space-y-6">
            <div className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black">
              <h4 className="text-base font-black mb-6 uppercase tracking-wider text-[#6D5EF9] flex items-center gap-2">
                <Tags className="w-5 h-5" /> Categories & Subcategories
              </h4>
              
              {/* Add New Category */}
              <div className="flex gap-2 max-w-lg mb-8 items-center h-12">
                <label className={`w-12 h-12 flex-shrink-0 border-3 border-black flex items-center justify-center cursor-pointer ${newCatImagePreview ? '' : 'bg-[#FFD400] hover:bg-black hover:text-white'} transition-colors`} title="Upload Category Image (Required)">
                  {newCatImagePreview ? (
                    <img src={newCatImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    triggerAlert('Uploading preview...');
                    try {
                      const url = await uploadImageFile(file);
                      setNewCatImagePreview(url);
                      triggerAlert('Image ready!');
                    } catch(err) { triggerAlert('Upload failed', 'error'); }
                  }} />
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New Category Name..."
                  className="w-full h-full brutal-input text-sm font-bold focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!newCatName.trim()) return;
                      if (!newCatImagePreview) {
                        triggerAlert('Category Image is required!', 'error');
                        return;
                      }
                      if (categoriesMap[newCatName]) {
                        triggerAlert('Category already exists!', 'error');
                        return;
                      }
                      setCategoriesMap(prev => ({ ...prev, [newCatName.trim()]: { image: newCatImagePreview, subcategories: {} } }));
                      setNewCatName('');
                      setNewCatImagePreview(null);
                      triggerAlert('Category created!');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (!newCatName.trim()) return;
                    if (!newCatImagePreview) {
                      triggerAlert('Category Image is required!', 'error');
                      return;
                    }
                    if (categoriesMap[newCatName]) {
                      triggerAlert('Category already exists!', 'error');
                      return;
                    }
                    setCategoriesMap(prev => ({ ...prev, [newCatName.trim()]: { image: newCatImagePreview, subcategories: {} } }));
                    setNewCatName('');
                    setNewCatImagePreview(null);
                    triggerAlert('Category created!');
                  }}
                  className="brutal-btn px-6 h-full whitespace-nowrap flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> CREATE
                </button>
              </div>

              {/* Existing Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(categoriesMap).map(([cat, catData]: [string, any]) => (
                  <div key={cat} className="border-3 border-black p-5 bg-gray-50 dark:bg-slate-900 shadow-[4px_4px_0_0_#000] flex flex-col h-full relative overflow-hidden group/catcard">
                    {catData.image && <img src={catData.image} alt={cat} className="absolute inset-0 w-full h-full object-cover opacity-[0.03] pointer-events-none" />}
                    <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-black relative z-10">
                      <div className="flex items-center gap-3">
                        {catData.image ? (
                           <div className="relative group/catimg">
                             <img src={catData.image} alt={cat} className="w-10 h-10 rounded-full border-2 border-black object-cover bg-white" />
                             <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded-full opacity-0 group-hover/catimg:opacity-100 cursor-pointer transition-opacity">
                               <Upload className="w-4 h-4" />
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCatImageUpload(e, cat)} />
                             </label>
                           </div>
                        ) : (
                           <label className="w-10 h-10 rounded-full border-2 border-black bg-[#FFD400] flex flex-col items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors" title="Upload Category Image">
                             <Upload className="w-3.5 h-3.5 mb-0.5" />
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCatImageUpload(e, cat)} />
                           </label>
                        )}
                        <span className="font-black text-xl uppercase tracking-tight">{cat}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (Object.keys(categoriesMap).length <= 1) {
                            triggerAlert('Cannot delete the last category', 'error');
                            return;
                          }
                          if (!window.confirm(`Are you sure you want to delete the category "${cat}" and all its subcategories?`)) return;
                          const updated = { ...categoriesMap };
                          delete updated[cat];
                          setCategoriesMap(updated);
                          triggerAlert('Category deleted');
                        }}
                        className="text-[#FF4D4F] hover:bg-[#FF4D4F] hover:text-white border-2 border-transparent hover:border-black p-1.5 transition-all"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Subcategories List */}
                    <div className="flex-1 flex flex-wrap gap-2 mb-4 content-start relative z-10">
                      {Object.entries(catData.subcategories).map(([sub, subData]: [string, any]) => (
                        <div key={sub} className="text-xs font-bold bg-white dark:bg-black border-2 border-black flex items-center group overflow-hidden shadow-[2px_2px_0_0_#000]">
                          {subData.image ? (
                             <label className="w-7 h-7 flex-shrink-0 cursor-pointer relative group/subimg border-r-2 border-black" title="Change Image">
                               <img src={subData.image} alt={sub} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/subimg:opacity-100 transition-opacity">
                                 <Upload className="w-3 h-3 text-white" />
                               </div>
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCatImageUpload(e, cat, sub)} />
                             </label>
                          ) : (
                             <label className="w-7 h-7 flex-shrink-0 min-h-[28px] bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center border-r-2 border-black cursor-pointer hover:bg-[#FFD400] transition-colors" title="Upload Subcategory Image">
                               <Upload className="w-3 h-3" />
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCatImageUpload(e, cat, sub)} />
                             </label>
                          )}
                          <span className="px-2 whitespace-nowrap">{sub}</span>
                          <button
                            onClick={() => {
                              if (!window.confirm(`Are you sure you want to delete the subcategory "${sub}"?`)) return;
                              setCategoriesMap(prev => {
                                const updated = { ...prev };
                                delete updated[cat].subcategories[sub];
                                return updated;
                              });
                            }}
                            className="text-gray-400 hover:text-white hover:bg-[#FF4D4F] transition-colors border-l-2 border-transparent group-hover:border-black px-1.5 h-full flex items-center justify-center"
                            title="Remove Subcategory"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {Object.keys(catData.subcategories).length === 0 && <span className="text-xs text-gray-400 font-bold italic w-full">No subcategories yet.</span>}
                    </div>

                    {/* Add Inline Subcategory */}
                    <div className="mt-auto pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-700 relative z-10">
                      <div className="flex gap-2 h-10">
                        <label className="w-10 h-full flex-shrink-0 border-2 border-black bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-[#FFD400] transition-colors" id={`subcat-img-label-${cat}`} title="Upload Subcategory Image (Required)">
                           <Upload className="w-4 h-4 text-gray-600" />
                           <input type="file" className="hidden" accept="image/*" id={`subcat-file-${cat}`} onChange={(e) => {
                              const label = document.getElementById(`subcat-img-label-${cat}`);
                              if (label && e.target.files?.[0]) {
                                 label.classList.add('!bg-[#00C853]');
                                 label.classList.add('text-white');
                                 triggerAlert('Image attached for ' + cat);
                              }
                           }} />
                        </label>
                        <input
                          type="text"
                          id={`subcat-input-${cat}`}
                          placeholder={`Add to ${cat}...`}
                          className="w-full h-full brutal-input text-xs font-bold focus:outline-none"
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget;
                              const val = input.value.trim();
                              if (!val) return;
                              const fileInput = document.getElementById(`subcat-file-${cat}`) as HTMLInputElement;
                              const file = fileInput.files?.[0];
                              if (!file) {
                                triggerAlert('Subcategory Image is required!', 'error');
                                return;
                              }
                              if (categoriesMap[cat].subcategories[val]) {
                                triggerAlert('Subcategory already exists!', 'error');
                                return;
                              }
                              triggerAlert('Creating Subcategory...');
                              try {
                                const url = await uploadImageFile(file);
                                setCategoriesMap(prev => ({
                                  ...prev,
                                  [cat]: { ...prev[cat], subcategories: { ...prev[cat].subcategories, [val]: { image: url } } }
                                }));
                                input.value = '';
                                fileInput.value = '';
                                const label = document.getElementById(`subcat-img-label-${cat}`);
                                if(label) { label.classList.remove('!bg-[#00C853]', 'text-white'); }
                                triggerAlert('Subcategory added!');
                              } catch(err) {
                                triggerAlert('Failed to create subcategory', 'error');
                              }
                            }
                          }}
                        />
                        <button
                          onClick={async () => {
                            const input = document.getElementById(`subcat-input-${cat}`) as HTMLInputElement;
                            const fileInput = document.getElementById(`subcat-file-${cat}`) as HTMLInputElement;
                            const val = input.value.trim();
                            if (!val) return;
                            const file = fileInput.files?.[0];
                            if (!file) {
                              triggerAlert('Subcategory Image is required!', 'error');
                              return;
                            }
                            if (categoriesMap[cat].subcategories[val]) {
                              triggerAlert('Subcategory already exists!', 'error');
                              return;
                            }
                            triggerAlert('Creating Subcategory...');
                            try {
                              const url = await uploadImageFile(file);
                              setCategoriesMap(prev => ({
                                ...prev,
                                [cat]: { ...prev[cat], subcategories: { ...prev[cat].subcategories, [val]: { image: url } } }
                              }));
                              input.value = '';
                              fileInput.value = '';
                              const label = document.getElementById(`subcat-img-label-${cat}`);
                              if(label) { label.classList.remove('!bg-[#00C853]', 'text-white'); }
                              triggerAlert('Subcategory added!');
                            } catch(err) {
                              triggerAlert('Failed to create subcategory', 'error');
                            }
                          }}
                          className="brutal-btn px-3 flex shrink-0 items-center justify-center"
                          title="Add Subcategory"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    required
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      setNewSubcategory('');
                    }}
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {Object.keys(categoriesMap).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Subcategory</label>
                  <select
                    required
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                    disabled={!newCategory}
                  >
                    <option value="">Select Subcategory</option>
                    {Object.keys(categoriesMap[newCategory]?.subcategories || {}).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
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
                    required
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Tags (comma separated)</label>
                  <input
                    required
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g. NewArrival, Under499"
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Sizes (comma separated)</label>
                  <input
                    required
                    type="text"
                    value={newSizes}
                    onChange={(e) => setNewSizes(e.target.value)}
                    placeholder="e.g. S, M, L, XL"
                    className="w-full brutal-input text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Product Description</label>
                <textarea
                  required
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
                    setNewCategory(Object.keys(categoriesMap)[0] || '');
                    setNewSubcategory('');
                    setNewPrice('');
                    setNewOrigPrice('');
                    setNewImage('');
                    setNewImages([]);
                    setNewDesc('');
                    setNewMaterial('');
                    setNewTags('');
                    setNewSizes('');
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
                      <img 
                        src={p.image || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=400'} 
                        alt={p.name} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=400';
                        }}
                        className="w-12 h-12 object-cover border-2 border-black shrink-0" 
                      />
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
                            setNewCategory(prod.category);
                            setNewSubcategory(prod.subCategory || '');
                            setNewPrice(prod.price.toString());
                            setNewOrigPrice((prod.originalPrice || '').toString());
                            setNewImage(prod.image);
                            setNewImages(prod.images || []);
                            setNewDesc(prod.description);
                            setNewMaterial(prod.material || '');
                            setNewTags((prod.tags || []).join(', '));
                            setNewSizes((prod.size || []).join(', '));
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
                        <img 
                          src={story.image} 
                          alt={story.name} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400';
                          }}
                          className="w-12 h-12 object-cover border-2 border-black shrink-0" 
                        />
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

        {/* SECTION 7: GALLERY CONTENT */}
        {activeSection === 'gallery' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Style Diaries Gallery</h2>
                <p className="text-sm font-bold text-gray-500">Customize the aesthetic grid layout on the shop page.</p>
              </div>
              <button 
                onClick={() => {
                  const newGallery: GalleryConfig = {
                    id: Date.now().toString(),
                    layoutStyle: 'bento',
                    title: "",
                    subtitle: "",
                    imageLeft: "",
                    imageCenter: "",
                    imageRight: "",
                    ctaTitle: "",
                    ctaSubtext: "",
                    ctaButtonText: "",
                    visibility: "shop"
                  };
                  setGalleryConfigs([...galleryConfigs, newGallery]);
                }}
                className="brutal-btn py-2 px-4 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </div>
            
            {galleryConfigs.length === 0 ? (
               <div className="brutal-card-no-hover p-12 text-center bg-white dark:bg-[#1a1a1a] border-3 border-black space-y-4">
                  <h4 className="text-xl font-black uppercase">No Gallery Sections</h4>
                  <p className="text-sm font-bold text-gray-500">Create a new section to start displaying galleries on your store.</p>
               </div>
            ) : (
              galleryConfigs.map((config, index) => (
                <div key={config.id} className="brutal-card-no-hover p-6 bg-white dark:bg-[#1a1a1a] border-3 border-black mb-6">
                  <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
                    <h4 className="text-sm font-black uppercase tracking-wider text-gray-400 font-mono">Gallery Content #{index + 1}</h4>
                    <button 
                      onClick={() => {
                         setConfirmModal({
                           isOpen: true,
                           message: 'Are you sure you want to delete this gallery section?',
                           onConfirm: () => {
                             setGalleryConfigs(galleryConfigs.filter(g => g.id !== config.id));
                             triggerAlert('Gallery section deleted');
                           }
                         });
                      }}
                      className="p-2 border-2 border-black bg-[#FCE7F3] text-black hover:bg-[#FF4D4F] hover:text-white transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-b-2 border-black pb-4 mb-4">
                      <label className="text-xs font-black uppercase tracking-wider block mb-3">Gallery Style</label>
                      <div className="flex gap-4">
                        {['bento', 'classic'].map((styleOpt) => (
                          <label key={styleOpt} className="flex items-center gap-2 cursor-pointer text-sm font-bold uppercase">
                            <input 
                              type="radio" 
                              name={`galleryStyle-${config.id}`}
                              value={styleOpt} 
                              checked={config.layoutStyle === styleOpt} 
                              onChange={(e) => {
                                const newConfigs = [...galleryConfigs];
                                newConfigs[index].layoutStyle = e.target.value as any;
                                setGalleryConfigs(newConfigs);
                              }}
                              className="accent-black w-4 h-4 cursor-pointer"
                            />
                            {styleOpt === 'bento' ? 'Bento Box (Asymmetrical)' : 'Classic (3 Columns)'}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider block mb-1">Main Heading</label>
                        <input 
                          type="text" 
                          value={config.title} 
                          onChange={(e) => {
                            const newConfigs = [...galleryConfigs];
                            newConfigs[index].title = e.target.value;
                            setGalleryConfigs(newConfigs);
                          }}
                          placeholder="e.g. STYLE DIARIES"
                          className="w-full p-2 border-2 border-black bg-[#f0f0f0] dark:bg-[#2d2d2d] focus:bg-white text-xs font-bold font-mono outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider block mb-1">Sub Heading</label>
                        <input 
                          type="text" 
                          value={config.subtitle} 
                          onChange={(e) => {
                            const newConfigs = [...galleryConfigs];
                            newConfigs[index].subtitle = e.target.value;
                            setGalleryConfigs(newConfigs);
                          }}
                          placeholder="e.g. Real Fashion • Real People"
                          className="w-full p-2 border-2 border-black bg-[#f0f0f0] dark:bg-[#2d2d2d] focus:bg-white text-xs font-bold font-mono outline-none" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-black pt-4">
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider block mb-1">Left Image</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={config.imageLeft} 
                            onChange={(e) => {
                              const newConfigs = [...galleryConfigs];
                              newConfigs[index].imageLeft = e.target.value;
                              setGalleryConfigs(newConfigs);
                            }}
                            placeholder="Image URL"
                            className="w-full p-2 border-2 border-black bg-[#f0f0f0] dark:bg-[#2d2d2d] focus:bg-white text-xs font-bold font-mono outline-none" 
                          />
                          <label className="p-2 border-2 border-black bg-[#FFD400] text-black cursor-pointer hover:bg-black hover:text-white transition-colors shrink-0" title="Upload Image">
                            <Upload className="w-4 h-4" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e, index, 'imageLeft')} />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider block mb-1">Center Image</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={config.imageCenter} 
                            onChange={(e) => {
                              const newConfigs = [...galleryConfigs];
                              newConfigs[index].imageCenter = e.target.value;
                              setGalleryConfigs(newConfigs);
                            }}
                            placeholder="Image URL"
                            className="w-full p-2 border-2 border-black bg-[#f0f0f0] dark:bg-[#2d2d2d] focus:bg-white text-xs font-bold font-mono outline-none" 
                          />
                          <label className="p-2 border-2 border-black bg-[#FFD400] text-black cursor-pointer hover:bg-black hover:text-white transition-colors shrink-0" title="Upload Image">
                            <Upload className="w-4 h-4" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e, index, 'imageCenter')} />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider block mb-1">Right Image</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={config.imageRight} 
                            onChange={(e) => {
                              const newConfigs = [...galleryConfigs];
                              newConfigs[index].imageRight = e.target.value;
                              setGalleryConfigs(newConfigs);
                            }}
                            placeholder="Image URL"
                            className="w-full p-2 border-2 border-black bg-[#f0f0f0] dark:bg-[#2d2d2d] focus:bg-white text-xs font-bold font-mono outline-none" 
                          />
                          <label className="p-2 border-2 border-black bg-[#FFD400] text-black cursor-pointer hover:bg-black hover:text-white transition-colors shrink-0" title="Upload Image">
                            <Upload className="w-4 h-4" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e, index, 'imageRight')} />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-black pt-4">
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider block mb-1">CTA Block Title</label>
                        <input 
                          type="text" 
                          value={config.ctaTitle} 
                          onChange={(e) => {
                            const newConfigs = [...galleryConfigs];
                            newConfigs[index].ctaTitle = e.target.value;
                            setGalleryConfigs(newConfigs);
                          }}
                          placeholder="Use \n for new lines"
                          className="w-full p-2 border-2 border-black bg-[#f0f0f0] dark:bg-[#2d2d2d] focus:bg-white text-xs font-bold font-mono outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider block mb-1">CTA Subtext</label>
                        <input 
                          type="text" 
                          value={config.ctaSubtext} 
                          onChange={(e) => {
                            const newConfigs = [...galleryConfigs];
                            newConfigs[index].ctaSubtext = e.target.value;
                            setGalleryConfigs(newConfigs);
                          }}
                          className="w-full p-2 border-2 border-black bg-[#f0f0f0] dark:bg-[#2d2d2d] focus:bg-white text-xs font-bold font-mono outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider block mb-1">CTA Button Text</label>
                        <input 
                          type="text" 
                          value={config.ctaButtonText} 
                          onChange={(e) => {
                            const newConfigs = [...galleryConfigs];
                            newConfigs[index].ctaButtonText = e.target.value;
                            setGalleryConfigs(newConfigs);
                          }}
                          className="w-full p-2 border-2 border-black bg-[#f0f0f0] dark:bg-[#2d2d2d] focus:bg-white text-xs font-bold font-mono outline-none" 
                        />
                      </div>
                    </div>

                    <div className="border-t-2 border-black pt-4">
                      <label className="text-xs font-black uppercase tracking-wider block mb-3">Display Section On</label>
                      <div className="flex flex-wrap gap-6">
                        {['home', 'shop', 'regional'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm font-bold uppercase">
                            <input 
                              type="radio" 
                              name={`galleryVisibility-${config.id}`}
                              value={opt} 
                              checked={config.visibility === opt} 
                              onChange={(e) => {
                                const newConfigs = [...galleryConfigs];
                                newConfigs[index].visibility = e.target.value as any;
                                setGalleryConfigs(newConfigs);
                              }}
                              className="accent-black w-4 h-4 cursor-pointer"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
