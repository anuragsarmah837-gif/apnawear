import React from 'react';
import { Heart, Coins, Camera, Share2, Tag, Upload } from 'lucide-react';
import { CommunityPost, Product } from '../types';

interface CommunityFeedProps {
  darkMode: boolean;
  communityFeed: CommunityPost[];
  setCommunityFeed: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  catalog: Product[];
  onSelectProduct: (product: Product) => void;
  onAwardCoins: (coins: number) => void;
}

export default function CommunityFeed({
  darkMode,
  communityFeed,
  setCommunityFeed,
  catalog,
  onSelectProduct,
  onAwardCoins
}: CommunityFeedProps) {
  // Post Creator State
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [newCaption, setNewCaption] = React.useState('');
  const [newPostImage, setNewPostImage] = React.useState('https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400');
  const [taggedItem, setTaggedItem] = React.useState<string>('w1');

  const handleLikePost = (id: string) => {
    setCommunityFeed(communityFeed.map(post => {
      if (post.id === id) {
        const liked = !post.hasLiked;
        return {
          ...post,
          hasLiked: liked,
          likes: liked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const handleUploadLookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption) return;

    const matchedProd = catalog.find(p => p.id === taggedItem);
    const taggedNames = matchedProd ? [matchedProd.name] : [];

    const newPost: CommunityPost = {
      id: 'post-' + Date.now().toString(),
      username: 'swadeshi_stylist_you',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      image: newPostImage,
      caption: newCaption,
      likes: 1,
      hasLiked: true,
      tags: ['SwaroopLook', 'Under499Style'],
      productsTagged: taggedNames,
      coinsAwarded: 50
    };

    setCommunityFeed([newPost, ...communityFeed]);
    onAwardCoins(50); // Direct reward!
    setNewCaption('');
    setShowUploadModal(false);
    alert('Look Uploaded! E-commerce validation engine approved your style, +50 Coins awarded to your wallet!');
  };

  // Local look reader
  const handleLocalPostInflow = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setNewPostImage(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const shareOutfitAlert = (postUsername: string) => {
    alert(`Link copied! Spread @${postUsername}'s trendy look to WhatsApp or Facebook to claim referral bonus coins!`);
  };

  return (
    <div className="space-y-6">
      {/* Upload Banner CTA */}
      <div className={`p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between text-left gap-4 ${
        darkMode ? 'bg-slate-900 border border-slate-850' : 'neu-flat'
      }`}>
        <div className="space-y-1">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
            Upload Your Look & Earn ₹50 Worth of Coins!
          </h3>
          <p className="text-xs text-gray-500 max-w-xl">
            Celebrate real Indian families! Upload a portrait wearing any of our Under ₹499 selections. Every approved post instantly grants 50 Fashion Coins to your Wallet.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white transition-all flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Style Portrait</span>
        </button>
      </div>

      {/* Styled Grid of Social Looks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {communityFeed.map((post) => (
          <div key={post.id} className={`rounded-3xl overflow-hidden p-4 ${
            darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-neumorphic'
          } space-y-4`}>
            {/* Header / Avatar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={post.avatar} alt={post.username} className="w-9 h-9 rounded-full object-cover border-2 border-white" />
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-white">@{post.username}</p>
                  <p className="text-[10px] text-gray-400">Guwahati Verified Buyer</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                <Coins className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-300">+{post.coinsAwarded} Coins</span>
              </div>
            </div>

            {/* Look Image with tagged banner Overlay */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img src={post.image} alt="outfit" className="w-full h-full object-cover" />
              
              {/* Product tagged indicator overlay */}
              {post.productsTagged.length > 0 && (
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-xl shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-sky-400" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400">Wearing Product Item</p>
                      <p className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1">
                        {post.productsTagged[0]}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const mat = catalog.find(p => p.name === post.productsTagged[0]);
                      if (mat) onSelectProduct(mat);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[9px] font-bold"
                  >
                    View Under ₹499 Item
                  </button>
                </div>
              )}
            </div>

            {/* Caption */}
            <p className="text-xs text-gray-600 dark:text-slate-350 leading-relaxed font-sans">
              {post.caption}
            </p>

            {/* Interaction Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-3 text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-1.5 font-bold transition-all ${
                    post.hasLiked ? 'text-red-500 scale-105' : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{post.likes} likes</span>
                </button>
                <div className="flex gap-1.5">
                  {post.tags.map((tg, i) => (
                    <span key={i} className="text-[10px] bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-300 px-2 py-0.5 rounded-full font-semibold">
                      #{tg}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => shareOutfitAlert(post.username)}
                className="p-1.5 text-gray-400 hover:text-sky-400 rounded-lg"
                title="Share Look link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Styled Portrait upload dialog */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 ${darkMode ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-gray-800'} shadow-2xl text-left space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-850">
              <h4 className="font-bold text-base flex items-center gap-1.5">
                <Camera className="w-5 h-5 text-pink-500" />
                Upload New Style Selfie Look
              </h4>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600 font-mono"
              >
                [Close]
              </button>
            </div>

            <form onSubmit={handleUploadLookSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Step 1: Upload portrait image</label>
                <div className="flex gap-3 items-center mt-1.5">
                  <img src={newPostImage} alt="Preview style" className="w-16 h-16 rounded-xl object-cover border" />
                  <label className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-gray-300 cursor-pointer text-center hover:bg-gray-50 text-[11px] dark:hover:bg-slate-850 text-gray-500">
                    <Upload className="w-4 h-4 mb-1" />
                    <span>Click to browse photo file</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLocalPostInflow} />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Step 2: Match Catalog Product</label>
                <select
                  value={taggedItem}
                  onChange={(e) => setTaggedItem(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 mt-1.5 dark:bg-slate-850 dark:border-slate-800"
                >
                  {catalog.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Step 3: What do you love about it?</label>
                <textarea
                  required
                  rows={2}
                  maxLength={180}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="e.g. Gorgeous Sanganeri print cotton! Felt incredibly premium and light."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-250 mt-1.5 dark:bg-slate-850 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-slate-850 text-[10px] text-amber-800 dark:text-amber-300 font-mono flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Upon successful submit, our verification compiler will award 50 coins instantly!</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold bg-pink-500 hover:bg-pink-600 text-white text-xs uppercase"
              >
                Submit Look & Collect Coins
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
