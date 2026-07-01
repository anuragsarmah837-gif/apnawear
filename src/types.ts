export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[];
  description: string;
  material?: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  tags: string[];
  size?: string[];
  region?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Returned' | 'Refunded';
  address: string;
  paymentMethod: string;
  trackingNumber?: string;
  userEmail?: string;
}

export interface CoinLog {
  date: string;
  amount: number;
  reason: string;
  type: 'coins' | 'bonus';
}

export interface UserWallet {
  coins: number;
  balanceRupees: number;
  history: CoinLog[];
}

export interface CommunityPost {
  id: string;
  username: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  hasLiked?: boolean;
  tags: string[];
  productsTagged: string[];
  coinsAwarded: number;
}

export interface StylistOutfitBoard {
  title: string;
  vibe: string;
  occasion: string;
  description: string;
  items: {
    slot: string;
    styleIdea: string;
    suggestedColor: string;
    productMatchId?: string;
  }[];
  expertTip: string;
  trendForecast: string;
  isOffline?: boolean;
}

export interface RegionalStory {
  id: string;
  name: string;
  description: string;
  color: string;
  borderCol: string;
  region: string;
  image?: string;
}

export interface GalleryConfig {
  id: string;
  layoutStyle: 'bento' | 'classic';
  title: string;
  subtitle: string;
  imageLeft: string;
  imageCenter: string;
  imageRight: string;
  ctaTitle: string;
  ctaSubtext: string;
  ctaButtonText: string;
  visibility: 'home' | 'shop' | 'regional';
}
