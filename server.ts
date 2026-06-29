import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { initDb, sql } from './db';
import { verifyToken } from '@clerk/backend';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON bodies (increased limit for base64 image uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Clerk secret key
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  console.warn("WARNING: CLERK_SECRET_KEY is missing. Clerk validation middleware will bypass in development.");
}

// Initialize Cloudinary Backend SDK
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  console.log("Cloudinary configured successfully.");
} else {
  console.warn("WARNING: Cloudinary credentials missing. Image uploads will run in mock simulation mode.");
}

// Clerk token authentication middleware wrapper
const checkAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!clerkSecretKey) {
    // Bypass authentication in local dev if credentials are not configured yet
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No session token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const session = await verifyToken(token, { secretKey: clerkSecretKey });
    (req as any).auth = session;
    next();
  } catch (err: any) {
    console.error('Clerk verification error:', err);
    return res.status(401).json({ error: 'Unauthorized: Invalid session token' });
  }
};

// API: Health probe
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: sql ? 'configured' : 'offline', time: new Date().toISOString() });
});

// ----------------------------------------------------
// DATABASE API ENDPOINTS
// ----------------------------------------------------

// 1. PRODUCTS
app.get('/api/products', async (req, res) => {
  if (!sql) {
    return res.json([]);
  }
  try {
    const result = await sql`SELECT * FROM products ORDER BY id DESC`;
    const mappedProducts = result.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      subCategory: p.sub_category || '',
      price: Number(p.price),
      originalPrice: Number(p.original_price),
      image: p.image,
      description: p.description || '',
      material: p.material || '',
      rating: Number(p.rating || 4.5),
      reviewsCount: p.reviews_count || 0,
      stock: p.stock || 10,
      tags: p.tags || [],
      size: p.size || [],
      region: p.region || ''
    }));
    res.json(mappedProducts);
  } catch (error: any) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', checkAuth, async (req, res) => {
  if (!sql) {
    return res.status(503).json({ error: 'Database client not connected' });
  }
  const p = req.body;
  try {
    await sql`
      INSERT INTO products (id, name, category, sub_category, price, original_price, image, description, material, rating, reviews_count, stock, tags, size, region)
      VALUES (${p.id}, ${p.name}, ${p.category}, ${p.subCategory || ''}, ${p.price}, ${p.originalPrice}, ${p.image},
        ${p.description || ''}, ${p.material || ''}, ${p.rating || 4.5}, ${p.reviewsCount || 0}, ${p.stock || 10},
        ${p.tags || []}, ${p.size || []}, ${p.region || ''})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        sub_category = EXCLUDED.sub_category,
        price = EXCLUDED.price,
        original_price = EXCLUDED.original_price,
        image = EXCLUDED.image,
        description = EXCLUDED.description,
        material = EXCLUDED.material,
        stock = EXCLUDED.stock,
        tags = EXCLUDED.tags,
        size = EXCLUDED.size,
        region = EXCLUDED.region
    `;
    res.json({ success: true, product: p });
  } catch (error: any) {
    console.error('Create/Update product error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', checkAuth, async (req, res) => {
  if (!sql) {
    return res.status(503).json({ error: 'Database client not connected' });
  }
  const { id } = req.params;
  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. ORDERS
app.get('/api/orders', async (req, res) => {
  if (!sql) {
    return res.json([]);
  }
  try {
    const result = await sql`SELECT * FROM orders ORDER BY date DESC`;
    const mappedOrders = result.map(o => ({
      id: o.id,
      date: o.date,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
      total: Number(o.total),
      status: o.status,
      address: o.address,
      paymentMethod: o.payment_method,
      trackingNumber: o.tracking_number || ''
    }));
    res.json(mappedOrders);
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  if (!sql) {
    return res.status(503).json({ error: 'Database client not connected' });
  }
  const o = req.body;
  try {
    await sql`
      INSERT INTO orders (id, date, items, total, status, address, payment_method, tracking_number)
      VALUES (${o.id}, ${o.date}, ${JSON.stringify(o.items)}, ${o.total}, ${o.status}, ${o.address}, ${o.paymentMethod}, ${o.trackingNumber || ''})
    `;
    res.json({ success: true, order: o });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', checkAuth, async (req, res) => {
  if (!sql) {
    return res.status(503).json({ error: 'Database client not connected' });
  }
  const { id } = req.params;
  const { status } = req.body;
  try {
    await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. COUPONS
app.get('/api/coupons', async (req, res) => {
  if (!sql) {
    return res.json([]);
  }
  try {
    const result = await sql`SELECT * FROM coupons ORDER BY code ASC`;
    res.json(result);
  } catch (error: any) {
    console.error('Fetch coupons error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/coupons', checkAuth, async (req, res) => {
  if (!sql) {
    return res.status(503).json({ error: 'Database client not connected' });
  }
  const { code, discount } = req.body;
  try {
    await sql`
      INSERT INTO coupons (code, discount) 
      VALUES (${code.toUpperCase()}, ${discount}) 
      ON CONFLICT (code) DO UPDATE SET discount = EXCLUDED.discount
    `;
    res.json({ success: true, coupon: { code: code.toUpperCase(), discount } });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/coupons/:code', checkAuth, async (req, res) => {
  if (!sql) {
    return res.status(503).json({ error: 'Database client not connected' });
  }
  const { code } = req.params;
  try {
    await sql`DELETE FROM coupons WHERE code = ${code.toUpperCase()}`;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. CLOUDINARY IMAGE UPLOAD
app.post('/api/upload', checkAuth, async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }
  if (!cloudName) {
    // Fallback representation if Cloudinary is not configured yet
    return res.json({ 
      url: image.startsWith('data:') 
        ? 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=400' 
        : image, 
      isMock: true 
    });
  }
  try {
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: 'apnawear',
    });
    res.json({ url: uploadResult.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// ----------------------------------------------------
// VITE SPA INTEGRATION AND LISTEN
// ----------------------------------------------------
async function startServer() {
  // Initialize Database tables on startup
  await initDb();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
