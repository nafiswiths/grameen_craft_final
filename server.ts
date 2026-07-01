import express from "express";
import path from "path";
import dotenv from "dotenv";
import pg from "pg";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { ARTISANS, PRODUCTS } from "./src/data";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. PostgreSQL Database Configuration and Cleanup
const { Pool } = pg;
const rawDbUrl = process.env.DATABASE_URL || "";

// Clean up brackets in the database URL if present (e.g., :[password]@ -> :password@)
function cleanDatabaseUrl(url: string): string {
  if (!url) return "";
  const bracketRegex = /:\/\/([^:]+):\[([^\]]+)\]@/;
  if (bracketRegex.test(url)) {
    console.log("Database URL bracket pattern detected. Cleaning up password credentials...");
    return url.replace(bracketRegex, '://$1:$2@');
  }
  return url;
}

const cleanedDbUrl = cleanDatabaseUrl(rawDbUrl);

let pool: pg.Pool | null = null;
let dbConnected = false;
let dbErrorDetail = "";

if (cleanedDbUrl) {
  try {
    pool = new Pool({
      connectionString: cleanedDbUrl,
      ssl: {
        rejectUnauthorized: false, // Required for secure connections to hosted DBs like Supabase
      },
    });
    console.log("PostgreSQL Connection Pool initialized.");
  } catch (err: any) {
    console.error("Failed to initialize PostgreSQL pool:", err);
    dbErrorDetail = err.message || "Failed to initialize PostgreSQL pool";
  }
} else {
  dbErrorDetail = "DATABASE_URL environment variable is empty or not configured.";
  console.log("DATABASE_URL is not set. Operating in high-performance client/server offline mode.");
}

// 2. Schema Setup & Initial Database Seeding
async function initializeDatabase() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    console.log("Connected to Supabase PostgreSQL database successfully.");
    dbConnected = true;

    // Create grameen_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS grameen_users (
        email VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        address TEXT,
        district VARCHAR(255),
        role VARCHAR(50) NOT NULL,
        password VARCHAR(255)
      );
    `);

    // Create grameen_artisans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS grameen_artisans (
        id VARCHAR(100) PRIMARY KEY,
        "nameEn" VARCHAR(255) NOT NULL,
        "nameBn" VARCHAR(255) NOT NULL,
        "districtEn" VARCHAR(255),
        "districtBn" VARCHAR(255),
        "experienceYears" INTEGER,
        avatar TEXT,
        "bioEn" TEXT,
        "bioBn" TEXT,
        rating DECIMAL(3,2),
        "specialtyEn" VARCHAR(255),
        "specialtyBn" VARCHAR(255)
      );
    `);

    // Create grameen_products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS grameen_products (
        id VARCHAR(100) PRIMARY KEY,
        "nameEn" VARCHAR(255) NOT NULL,
        "nameBn" VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        rating DECIMAL(3,2),
        "reviewsCount" INTEGER,
        category VARCHAR(100),
        image TEXT,
        gallery TEXT[],
        "artisanId" VARCHAR(100),
        "materialsEn" TEXT[],
        "materialsBn" TEXT[],
        "deliveryDays" INTEGER,
        "descEn" TEXT,
        "descBn" TEXT,
        "inStock" BOOLEAN DEFAULT TRUE,
        featured BOOLEAN DEFAULT FALSE,
        trending BOOLEAN DEFAULT FALSE
      );
    `);

    // Create grameen_orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS grameen_orders (
        id VARCHAR(100) PRIMARY KEY,
        date VARCHAR(100) NOT NULL,
        "itemsCount" INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(100) NOT NULL,
        "productName" VARCHAR(255),
        "userEmail" VARCHAR(255)
      );
    `);

    // Seed grameen_artisans if empty
    const checkArtisans = await client.query("SELECT COUNT(*) FROM grameen_artisans");
    if (parseInt(checkArtisans.rows[0].count) === 0) {
      console.log("Seeding initial artisans into database...");
      for (const art of ARTISANS) {
        await client.query(`
          INSERT INTO grameen_artisans (
            id, "nameEn", "nameBn", "districtEn", "districtBn", "experienceYears", 
            avatar, "bioEn", "bioBn", rating, "specialtyEn", "specialtyBn"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          art.id, art.nameEn, art.nameBn, art.districtEn, art.districtBn, art.experienceYears,
          art.avatar, art.bioEn, art.bioBn, art.rating, art.specialtyEn, art.specialtyBn
        ]);
      }
    }

    // Seed grameen_products if empty
    const checkProducts = await client.query("SELECT COUNT(*) FROM grameen_products");
    if (parseInt(checkProducts.rows[0].count) === 0) {
      console.log("Seeding initial products into database...");
      for (const prod of PRODUCTS) {
        await client.query(`
          INSERT INTO grameen_products (
            id, "nameEn", "nameBn", price, rating, "reviewsCount", category, 
            image, gallery, "artisanId", "materialsEn", "materialsBn", 
            "deliveryDays", "descEn", "descBn", "inStock", featured, trending
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        `, [
          prod.id, prod.nameEn, prod.nameBn, prod.price, prod.rating, prod.reviewsCount, prod.category,
          prod.image, prod.gallery, prod.artisanId, prod.materialsEn, prod.materialsBn,
          prod.deliveryDays || 5, prod.descEn, prod.descBn, prod.inStock !== false, prod.featured || false, prod.trending || false
        ]);
      }
    }

    // Seed default users if empty
    const checkUsers = await client.query("SELECT COUNT(*) FROM grameen_users");
    if (parseInt(checkUsers.rows[0].count) === 0) {
      console.log("Seeding default users...");
      await client.query(`
        INSERT INTO grameen_users (email, name, phone, address, district, role, password)
        VALUES 
        ('sajid@dhaka.com', 'Sajid Ahmed', '+8801712345678', 'House 45, Road 12, Dhanmondi', 'Dhaka', 'buyer', 'password123'),
        ('rahima@jamalpur.org', 'Rahima Begum', '+8801987654321', 'Katha Palli, Melandaha', 'Jamalpur', 'seller', 'password123'),
        ('admin@grameencraft.org', 'GrameenCraft Admin', '+8801700000000', 'GrameenCraft Headquarters, Mirpur', 'Dhaka', 'admin', 'adminpassword')
      `);
    }

    // Seed default orders if empty
    const checkOrders = await client.query("SELECT COUNT(*) FROM grameen_orders");
    if (parseInt(checkOrders.rows[0].count) === 0) {
      console.log("Seeding default orders...");
      await client.query(`
        INSERT INTO grameen_orders (id, date, "itemsCount", total, status, "productName", "userEmail")
        VALUES ('ORD-9281', 'June 12, 2026', 1, 4500.00, 'Shipped', 'Traditional Jamalpur Nakshi Katha', 'sajid@dhaka.com')
      `);
    }

    client.release();
    console.log("PostgreSQL schema successfully initialized and verified.");
  } catch (err: any) {
    console.error("Failed to initialize database tables:", err);
    dbConnected = false;
    dbErrorDetail = err.message || "Database connection or table initialization failed.";
  }
}

// 3. Helper to lazily initialize GoogleGenAI to prevent crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// --- API ROUTES ---

// A. Get Database Status
app.get("/api/db-status", (req, res) => {
  res.json({
    connected: dbConnected,
    error: dbErrorDetail || null,
    configured: !!rawDbUrl,
    cleanedUrlUsed: cleanedDbUrl !== rawDbUrl
  });
});

// B. Sync All Data (Full load from DB or Static Fallbacks)
app.get("/api/sync", async (req, res) => {
  if (!dbConnected || !pool) {
    return res.json({
      source: "local-static",
      products: PRODUCTS,
      artisans: ARTISANS,
      users: [
        {
          name: "Sajid Ahmed",
          email: "sajid@dhaka.com",
          phone: "+8801712345678",
          address: "House 45, Road 12, Dhanmondi",
          district: "Dhaka",
          role: "buyer",
          password: "password123"
        },
        {
          name: "Rahima Begum",
          email: "rahima@jamalpur.org",
          phone: "+8801987654321",
          address: "Katha Palli, Melandaha",
          district: "Jamalpur",
          role: "seller",
          password: "password123"
        },
        {
          name: "GrameenCraft Admin",
          email: "admin@grameencraft.org",
          phone: "+8801700000000",
          address: "GrameenCraft Headquarters, Mirpur",
          district: "Dhaka",
          role: "admin",
          password: "adminpassword"
        }
      ],
      orders: [
        {
          id: "ORD-9281",
          date: "June 12, 2026",
          itemsCount: 1,
          total: 4500,
          status: "Shipped",
          productName: "Traditional Jamalpur Nakshi Katha",
          userEmail: "sajid@dhaka.com"
        }
      ]
    });
  }

  try {
    const usersRes = await pool.query("SELECT * FROM grameen_users");
    const artisansRes = await pool.query("SELECT * FROM grameen_artisans");
    const productsRes = await pool.query("SELECT * FROM grameen_products");
    const ordersRes = await pool.query("SELECT * FROM grameen_orders");

    res.json({
      source: "postgresql",
      users: usersRes.rows,
      artisans: artisansRes.rows,
      products: productsRes.rows.map(p => ({
        ...p,
        price: Number(p.price),
        rating: Number(p.rating),
        reviewsCount: Number(p.reviewsCount),
        deliveryDays: Number(p.deliveryDays) || 5,
        inStock: p.inStock !== false,
        featured: p.featured === true,
        trending: p.trending === true
      })),
      orders: ordersRes.rows.map(o => ({
        ...o,
        itemsCount: Number(o.itemsCount),
        total: Number(o.total)
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// C. Register/Update User
app.post("/api/users/register", async (req, res) => {
  const { email, name, phone, address, district, role, password } = req.body;
  if (!email || !name || !role) {
    return res.status(400).json({ error: "Email, Name, and Role are required." });
  }

  if (!dbConnected || !pool) {
    return res.json({ success: true, message: "Registered offline/locally.", user: req.body });
  }

  try {
    await pool.query(`
      INSERT INTO grameen_users (email, name, phone, address, district, role, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        district = EXCLUDED.district,
        role = EXCLUDED.role,
        password = EXCLUDED.password
    `, [email, name, phone, address, district, role, password || "password123"]);

    res.json({ success: true, user: req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// D. List a New Product
app.post("/api/products", async (req, res) => {
  const p = req.body;
  if (!p.id || !p.nameEn || !p.price) {
    return res.status(400).json({ error: "Product ID, English Name, and Price are required." });
  }

  if (!dbConnected || !pool) {
    return res.json({ success: true, product: p });
  }

  try {
    await pool.query(`
      INSERT INTO grameen_products (
        id, "nameEn", "nameBn", price, rating, "reviewsCount", category, 
        image, gallery, "artisanId", "materialsEn", "materialsBn", 
        "deliveryDays", "descEn", "descBn", "inStock", featured, trending
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        "nameEn" = EXCLUDED."nameEn",
        "nameBn" = EXCLUDED."nameBn",
        price = EXCLUDED.price,
        category = EXCLUDED.category,
        image = EXCLUDED.image,
        "descEn" = EXCLUDED."descEn",
        "descBn" = EXCLUDED."descBn",
        "inStock" = EXCLUDED."inStock"
    `, [
      p.id, p.nameEn, p.nameBn || p.nameEn, p.price, p.rating || 5, p.reviewsCount || 0, p.category,
      p.image, p.gallery || [p.image], p.artisanId, p.materialsEn || [], p.materialsBn || [],
      p.deliveryDays || 5, p.descEn || "", p.descBn || "", p.inStock !== false, p.featured || false, p.trending || false
    ]);

    res.json({ success: true, product: p });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// E. Submit an Order
app.post("/api/orders", async (req, res) => {
  const o = req.body;
  if (!o.id || !o.total) {
    return res.status(400).json({ error: "Order ID and Total are required." });
  }

  if (!dbConnected || !pool) {
    return res.json({ success: true, order: o });
  }

  try {
    await pool.query(`
      INSERT INTO grameen_orders (id, date, "itemsCount", total, status, "productName", "userEmail")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      o.id, o.date, o.itemsCount || 1, o.total, o.status || "Pending", o.productName, o.userEmail || "sajid@dhaka.com"
    ]);

    res.json({ success: true, order: o });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// F. Create/Update Artisan Profile
app.post("/api/artisans", async (req, res) => {
  const art = req.body;
  if (!art.id || !art.nameEn) {
    return res.status(400).json({ error: "Artisan ID and English Name are required." });
  }

  if (!dbConnected || !pool) {
    return res.json({ success: true, artisan: art });
  }

  try {
    await pool.query(`
      INSERT INTO grameen_artisans (
        id, "nameEn", "nameBn", "districtEn", "districtBn", "experienceYears", 
        avatar, "bioEn", "bioBn", rating, "specialtyEn", "specialtyBn"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        "nameEn" = EXCLUDED."nameEn",
        "nameBn" = EXCLUDED."nameBn",
        "districtEn" = EXCLUDED."districtEn",
        "districtBn" = EXCLUDED."districtBn",
        "experienceYears" = EXCLUDED."experienceYears",
        avatar = EXCLUDED.avatar,
        "bioEn" = EXCLUDED."bioEn",
        "bioBn" = EXCLUDED."bioBn",
        rating = EXCLUDED.rating,
        "specialtyEn" = EXCLUDED."specialtyEn",
        "specialtyBn" = EXCLUDED."specialtyBn"
    `, [
      art.id, art.nameEn, art.nameBn || art.nameEn, art.districtEn || "Jamalpur", art.districtBn || "জামালপুর",
      art.experienceYears || 1, art.avatar, art.bioEn || "", art.bioBn || "", art.rating || 5.0,
      art.specialtyEn || "", art.specialtyBn || ""
    ]);

    res.json({ success: true, artisan: art });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// G. Heritage Story Generation (AI)
app.post("/api/heritage-story", async (req, res) => {
  const { productName, artisanName, artisanDistrict, category } = req.body;

  if (!productName || !artisanName) {
    return res.status(400).json({ error: "Product name and artisan name are required." });
  }

  try {
    const ai = getAiClient();
    const prompt = `Write a beautiful, poetic, and heartwarming storytelling description for a traditional handmade craft called "${productName}" (Category: ${category}) crafted by artisan "${artisanName}" from the ${artisanDistrict || "rural"} district of Bangladesh. 
Include elements of cultural heritage (like the historic origin, raw materials like jute, bamboo, cotton, or clay, and traditional stitching/weaving/molding methods).
Ensure the tone is warm, elegant, and authentic, emphasizing how this product supports rural artisans and preserves Bangladesh's heritage. 
Keep it engaging and under 150 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const story = response.text || "Every thread is a whisper, and every fold holds a memory. Handcrafted with love.";
    res.json({ story });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message || error);
    const defaultStories: Record<string, string> = {
      "Nakshi Katha": "This exquisite quilt is a canvas of dreams woven together by Rahima Begum from Jamalpur. Passed down through maternal lineages, each tiny running stitch represents an evening of laughter, rain, and quiet resilience, telling stories of monsoon nights and golden harvests.",
      "Traditional Jute Bag": "Crafted from golden jute fibers by Jahanara Bibi in Mymensingh, this bag carries the essence of the Shitalakshya riverbanks. Hand-spun, organic, and dyed with plant extracts, it represents the heart of eco-friendly, timeless Bengali craftsmanship.",
      "Terracotta Clay Pots": "Molded on the potter's wheel by Subal Paul from Sonargaon, these clay pots capture the ancient soul of Lalmai hills clay. Baked in traditional earthen kilns, every curve is a testament to five generations of pottery heritage.",
      "Bamboo Utility Baskets": "Hand-plaited from wild green bamboo by Abdul Majid in Sylhet, this basket is a marvel of rural engineering. Light, durable, and organic, it carries the whispers of tea garden winds and rural simple living."
    };

    const fallbackStory = defaultStories[category] || defaultStories[productName] || 
      `This exquisite creation was hand-crafted with traditional methods passed down through generations of artisans in ${artisanDistrict || "rural Bangladesh"}. Each piece is completely unique, carrying the authentic heritage, spirit, and warmth of village craftsmanship.`;

    res.json({ 
      story: fallbackStory,
      isFallback: true,
      errorMsg: error.message || "Failed to query Gemini API"
    });
  }
});

// H. Admin API: Update User Role
app.post("/api/admin/users/role", async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: "Email and Role are required." });
  }

  if (!dbConnected || !pool) {
    return res.json({ success: true, message: "Role updated locally/offline." });
  }

  try {
    await pool.query("UPDATE grameen_users SET role = $1 WHERE email = $2", [role, email]);
    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// I. Admin API: Delete User
app.delete("/api/admin/users/:email", async (req, res) => {
  const { email } = req.params;

  if (!dbConnected || !pool) {
    return res.json({ success: true, message: "User deleted locally/offline." });
  }

  try {
    await pool.query("DELETE FROM grameen_users WHERE email = $1", [email]);
    res.json({ success: true, message: "User deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// J. Admin API: Update Order Status
app.post("/api/admin/orders/status", async (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: "Order ID and Status are required." });
  }

  if (!dbConnected || !pool) {
    return res.json({ success: true, message: "Order status updated locally/offline." });
  }

  try {
    await pool.query("UPDATE grameen_orders SET status = $1 WHERE id = $2", [status, id]);
    res.json({ success: true, message: `Order status updated to ${status}.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// K. Admin API: Delete Product
app.delete("/api/admin/products/:id", async (req, res) => {
  const { id } = req.params;

  if (!dbConnected || !pool) {
    return res.json({ success: true, message: "Product deleted locally/offline." });
  }

  try {
    await pool.query("DELETE FROM grameen_products WHERE id = $1", [id]);
    res.json({ success: true, message: "Product deleted successfully from database." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// L. Admin API: Toggle Product Stock
app.post("/api/admin/products/toggle-stock", async (req, res) => {
  const { id, inStock } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Product ID is required." });
  }

  if (!dbConnected || !pool) {
    return res.json({ success: true, message: "Product stock updated locally/offline." });
  }

  try {
    await pool.query('UPDATE grameen_products SET "inStock" = $1 WHERE id = $2', [inStock, id]);
    res.json({ success: true, message: "Product stock status updated." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Setup Vite middleware or static serving
async function setupApp() {
  await initializeDatabase();

  if (process.env.VERCEL) {
    console.log("Running in Vercel Serverless environment. Database initialized.");
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GrameenCraft Full-Stack Server running on port ${PORT}`);
  });
}

setupApp();

export default app;
