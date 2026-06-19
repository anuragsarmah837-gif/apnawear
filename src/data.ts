import { Product, CommunityPost } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'm1',
    name: 'Sanganeri Block Printed Mens Cotton Kurta',
    category: 'Men',
    subCategory: 'Kurtas & Tunics',
    price: 399,
    originalPrice: 799,
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=400',
    description: 'Authentic 100% fine cotton printed by traditional block-weavers of Jaipur. Perfect lightweight wear for pujas and mild afternoons.',
    material: 'Bagru Stamp Organic Cotton',
    rating: 4.8,
    reviewsCount: 24,
    stock: 45,
    tags: ['Traditional', 'Artisanal', 'Under499'],
    size: ['S', 'M', 'L', 'XL'],
    region: 'Rajasthan'
  },
  {
    id: 'm2',
    name: 'Khadi Textured Minimalist Casual Shirt',
    category: 'Men',
    subCategory: 'Shirts',
    price: 349,
    originalPrice: 699,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=400',
    description: 'Tailored using hand-combed native khadi threads for a soft premium earthy slub texture. Styled with formal short button closures.',
    material: 'Earthy Hand-spun Khadi',
    rating: 4.7,
    reviewsCount: 18,
    stock: 30,
    tags: ['Minimalist', 'SummerWear', 'Earthy'],
    size: ['M', 'L', 'XL'],
    region: 'Bengal'
  },
  {
    id: 'm3',
    name: 'Teal Green Organic Cotton Short Jacket',
    category: 'Men',
    subCategory: 'Bundi Jackets',
    price: 449,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1621243804936-775306a8f2e3?auto=format&fit=crop&q=80&w=400',
    description: 'Neat stand collar sleeveless jacket with wooden buttons. Hand-pigmented natural vegetable forest green dyes.',
    material: 'Indigo-dyed Handloom Denim cotton',
    rating: 4.6,
    reviewsCount: 12,
    stock: 15,
    tags: ['Festive', 'Under499', 'Organic'],
    size: ['S', 'M', 'L'],
    region: 'Rajasthan'
  },
  {
    id: 'w1',
    name: 'Majuli Eri Cotton Pastel Flared Anarkali',
    category: 'Women',
    subCategory: 'Kurtis & Sets',
    price: 429,
    originalPrice: 899,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400',
    description: 'Gorgeously flared silhouette utilizing Assam islands vegan Eri silks. Incredibly breathable and durable over multiple washes.',
    material: 'Cruelty-free Hand-weaved Eri Slik combo',
    rating: 4.9,
    reviewsCount: 42,
    stock: 22,
    tags: ['RegionalHeritage', 'Elegant', 'Pastel'],
    size: ['S', 'M', 'L', 'XL'],
    region: 'Assam'
  },
  {
    id: 'w2',
    name: 'Bagru Stamp Indigo Palazzo set',
    category: 'Women',
    subCategory: 'Kurti Sets',
    price: 459,
    originalPrice: 990,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=400',
    description: 'Traditional deep extracted botanical indigo print with parallel ventilated broad palazzo trousers. Ideal for high active humidity.',
    material: 'Botanical Fermented Indigo Cotton',
    rating: 4.7,
    reviewsCount: 30,
    stock: 19,
    tags: ['Flowy', 'Indigo', 'ComfortFit'],
    size: ['M', 'L', 'XL'],
    region: 'Rajasthan'
  },
  {
    id: 'w3',
    name: 'Kasavu Border Handloom Off-White Tunic',
    category: 'Women',
    subCategory: 'Tunics',
    price: 299,
    originalPrice: 599,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400',
    description: 'Plain elegant cream beige base with authentic bright gold zari stitching. Classic elite representation of southern loom cooperatives.',
    material: 'Stiff Gold-zari Combed Cotton',
    rating: 4.8,
    reviewsCount: 15,
    stock: 25,
    tags: ['GoldZari', 'ComfortTunic', 'Under299'],
    size: ['S', 'M', 'L'],
    region: 'South India'
  },
  {
    id: 'w4',
    name: 'Amritsar Phulkari Scarlet Red Dupatta',
    category: 'Regional',
    subCategory: 'Dupattas & Stoles',
    price: 199,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1590540179852-211d6b45e591?auto=format&fit=crop&q=80&w=400',
    description: 'High-density geometric cross stitching crafted in Amritsar. Lends an instant celebratory splash to plain white kurtas.',
    material: 'Multi-color Acrylic Thread Embroidered',
    rating: 4.9,
    reviewsCount: 52,
    stock: 40,
    tags: ['Dupatta', 'Embroidery', 'FestivePop'],
    size: ['FreeSize'],
    region: 'Punjab'
  },
  {
    id: 'w5',
    name: 'Bengal Tant Handloom Scarlet Red Saree',
    category: 'Regional',
    subCategory: 'Saree Look',
    price: 489,
    originalPrice: 1199,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400',
    description: 'Very soft, ultra air-permeable cotton saree from rural Bengal handloom clusters. Red and white traditional festival edition.',
    material: 'Thread-combed Fine Tant Cotton',
    rating: 4.8,
    reviewsCount: 35,
    stock: 12,
    tags: ['Saree', 'Handloom', 'Tant'],
    size: ['FreeSize'],
    region: 'Bengal'
  },
  {
    id: 'k1',
    name: 'Kids Organic Cotton Elephant-motif Jumpsuit',
    category: 'Kids',
    subCategory: 'Jumpsuits',
    price: 249,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=400',
    description: 'Hypoallergenic infant-safe dyes. Features adorable hand-stamped elephant motifs. Shoulder snaps for easy layout alterations.',
    material: 'Hypoallergenic Combed Soft Cotton',
    rating: 4.8,
    reviewsCount: 14,
    stock: 50,
    tags: ['Infant', 'EcoFriendly', 'Under299'],
    size: ['6-12M', '1-2Y', '2-3Y'],
    region: 'Rajasthan'
  },
  {
    id: 'k2',
    name: 'Boys Cotton Nehru Jacket & Kurta Set',
    category: 'Kids',
    subCategory: 'Festive Sets',
    price: 479,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=400',
    description: 'A handsome 2-item set combining a saffron short kurta and dark indigo jacket. Zero inner seams to completely prevent scratching.',
    material: 'Super-soft brushed poly-cotton thread',
    rating: 4.7,
    reviewsCount: 20,
    stock: 18,
    tags: ['FestiveSets', 'ScratchFree', 'ComfortStyle'],
    size: ['3-4Y', '5-6Y', '7-8Y'],
    region: 'All'
  }
];

export const DAILY_DEALS = [
  {
    id: 'deal1',
    name: 'Premium Bagru Block Print Cotton Face Mask Pack',
    category: 'Women' as const,
    subCategory: 'Daily Essentials',
    price: 99,
    originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200',
    description: 'Certified 3-layer washable organic face masks block-printed with real natural botanical extracts. Breathable soft fit.',
    rating: 4.9,
    reviewsCount: 154,
    stock: 200,
    tags: ['FlashSale', 'Essentials']
  },
  {
    id: 'deal2',
    name: 'Handcrafted Khadi Pocket Diary & Pen Kit',
    category: 'Men' as const,
    subCategory: 'Stationery',
    price: 99,
    originalPrice: 350,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200',
    description: 'Earthy notebook wrapped entirely in hand-spun scarlet khadi cotton. Recycled zero-carbon fiber sheets.',
    rating: 4.8,
    reviewsCount: 78,
    stock: 85,
    tags: ['FlashSale', 'KhadiTextred']
  },
  {
    id: 'deal3',
    name: 'Organic Cotton Toddler Bib Set (Elephant Blue)',
    category: 'Kids' as const,
    subCategory: 'Essentials',
    price: 99,
    originalPrice: 199,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=200',
    description: 'Set of 2 ultra absorbent drool shields finished with soft hook-and-loop adjustments.',
    rating: 4.7,
    reviewsCount: 42,
    stock: 120,
    tags: ['FlashSale', 'InfantSafe']
  }
];

export const FASHION_BUNDLES = [
  {
    id: 'bun1',
    name: 'Father & Son Festive Match Box',
    description: 'Save big on cultural coordinates! Get (1) Mens Sanganeri Kurta and (1) Boys Saffron Kurta Combo in matching colors.',
    price: 499,
    originalPrice: 1499,
    savings: 1000,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=300',
    type: 'Men & Kids',
    products: [
      'Sanganeri Block Printed Mens Cotton Kurta (Size L)',
      'Boys Cotton Nehru Jacket & Kurta Set (Size 5-6Y)'
    ]
  },
  {
    id: 'bun2',
    name: 'Swaroop Indian Wardrobe starter (Assam & Bengal)',
    description: 'Immaculate traditional package that merges finest wearied Tant cotton saree and Majuli Eri cotton flared tunic combo.',
    price: 499,
    originalPrice: 1899,
    savings: 1400,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300',
    type: 'Women Special',
    products: [
      'Majuli Eri Cotton Pastel Flared Anarkali (Size M)',
      'Bengal Tant Handloom Scarlet Red Saree (Free Size)'
    ]
  }
];

export const INITIAL_COMMUNITY_FEED: CommunityPost[] = [
  {
    id: 'p1',
    username: 'poulomi_banerjee_99',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400',
    caption: 'Felt absolutely majestic in this Tant cotton saree during evening puja! Absolute cotton magic under ₹490! 💮 #TantWeaves #GuwahatiDiaries #SwaroopStyles',
    likes: 142,
    hasLiked: false,
    tags: ['TantWeaves', 'PoojaLook'],
    productsTagged: ['Bengal Tant Handloom Scarlet Red Saree'],
    coinsAwarded: 50
  },
  {
    id: 'p2',
    username: 'abhijit_guwahatian',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=400',
    caption: 'Highly endorse this Sanganeri soft block print kurta. Kept me completely cool in Guwahati mid-summer afternoons. 🍃 #BagruStyle #CozyWear',
    likes: 85,
    hasLiked: false,
    tags: ['RajasthanHeritage', 'KurtaLife'],
    productsTagged: ['Sanganeri Block Printed Mens Cotton Kurta'],
    coinsAwarded: 50
  },
  {
    id: 'p3',
    username: 'sneha_borbaruah',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400',
    caption: 'My Majuli Eri Tunic has the most dreamy pastel feel. Love supporting artisanal women weavers through Fashion For Every Home! 🌸',
    likes: 210,
    hasLiked: true,
    tags: ['MajuliVeganSilk', 'ProudSwadeshi'],
    productsTagged: ['Majuli Eri Cotton Pastel Flared Anarkali'],
    coinsAwarded: 50
  }
];
