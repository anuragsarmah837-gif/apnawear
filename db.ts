import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("WARNING: DATABASE_URL is not set in environment variables. Neon DB queries will fail.");
}

export const sql = databaseUrl ? neon(databaseUrl) : null;

export async function initDb() {
  if (!sql) {
    console.warn("Database client not initialized because DATABASE_URL is empty.");
    return;
  }
  try {
    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        sub_category VARCHAR(100),
        price NUMERIC(10, 2) NOT NULL,
        original_price NUMERIC(10, 2) NOT NULL,
        image TEXT NOT NULL,
        description TEXT,
        material VARCHAR(255),
        rating NUMERIC(3, 2) DEFAULT 4.5,
        reviews_count INT DEFAULT 0,
        stock INT DEFAULT 10,
        tags TEXT[] DEFAULT '{}',
        size TEXT[] DEFAULT '{}',
        region VARCHAR(100)
      );
    `;

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        items JSONB NOT NULL,
        total NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        payment_method VARCHAR(100) NOT NULL,
        tracking_number VARCHAR(100),
        user_email VARCHAR(255)
      );
    `;

    try {
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);`;
    } catch (err) {
      console.log("Migration log: user_email check complete.");
    }

    // Create coupons table
    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        code VARCHAR(50) PRIMARY KEY,
        discount INT NOT NULL
      );
    `;

    // Create regional_stories table
    await sql`
      CREATE TABLE IF NOT EXISTS regional_stories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        color VARCHAR(50) NOT NULL,
        border_col VARCHAR(50) DEFAULT 'border-black',
        region VARCHAR(100) NOT NULL
      );
    `;

    try {
      await sql`ALTER TABLE regional_stories ADD COLUMN IF NOT EXISTS image TEXT;`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';`;
    } catch (err) {
      console.log("Migration log: column checks complete.");
    }

    // Seed products check is removed as per request to manage products exclusively from the admin panel

    console.log("Neon DB tables initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize database tables:", error);
  }
}
