// ✅ wolf-backend/utils/seedProducts.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.js"; // ✅ Match your file name

dotenv.config();

const sampleProducts = [
  {
    name: "Wireless Headphones",
    slug: "wireless-headphones",
    description: "High-quality wireless headphones with active noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 79.99,
    stock: 50,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500"
    ],
    category: "Electronics",
    brand: "AudioTech",
    color: "Black",
    material: "Plastic/Leather"
  },
  {
    name: "Smart Watch Pro",
    slug: "smart-watch-pro",
    description: "Feature-rich smartwatch with health tracking, GPS, and water resistance. Stay connected and track your fitness goals.",
    price: 199.99,
    stock: 35,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500"
    ],
    category: "Electronics",
    brand: "TechWear",
    color: "Silver",
    material: "Aluminum"
  },
  {
    name: "Laptop Backpack",
    slug: "laptop-backpack",
    description: "Durable and stylish laptop backpack with multiple compartments, USB charging port, and water-resistant material.",
    price: 49.99,
    stock: 75,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500"
    ],
    category: "Accessories",
    brand: "TravelPro",
    color: "Gray",
    material: "Nylon"
  },
  {
    name: "Premium Coffee Maker",
    slug: "premium-coffee-maker",
    description: "Programmable coffee maker with thermal carafe, 24-hour brewing timer, and auto shut-off feature.",
    price: 89.99,
    stock: 42,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500"
    ],
    category: "Home",
    brand: "BrewMaster",
    color: "Stainless Steel",
    material: "Steel"
  },
  {
    name: "Running Shoes Elite",
    slug: "running-shoes-elite",
    description: "Comfortable running shoes with excellent cushioning, breathable mesh, and durable rubber outsole.",
    price: 119.99,
    stock: 60,
    discount: 25,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500"
    ],
    category: "Fashion",
    brand: "SportFlex",
    color: "Red/White",
    size: "US 9-12",
    material: "Mesh/Rubber"
  },
  {
    name: "LED Desk Lamp Pro",
    slug: "led-desk-lamp-pro",
    description: "Adjustable LED desk lamp with touch controls, multiple brightness levels, and USB charging port.",
    price: 34.99,
    stock: 88,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500"
    ],
    category: "Home",
    brand: "LightWorks",
    color: "White",
    material: "Aluminum/Plastic"
  },
  {
    name: "Premium Yoga Mat",
    slug: "premium-yoga-mat",
    description: "Premium non-slip yoga mat with extra thickness for comfort. Eco-friendly and easy to clean.",
    price: 29.99,
    stock: 120,
    discount: 5,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500"
    ],
    category: "Sports",
    brand: "ZenFit",
    color: "Purple",
    size: "183cm x 61cm",
    material: "TPE"
  },
  {
    name: "Bluetooth Speaker 360",
    slug: "bluetooth-speaker-360",
    description: "Portable waterproof Bluetooth speaker with 360° sound and 12-hour battery life.",
    price: 59.99,
    stock: 65,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500"
    ],
    category: "Electronics",
    brand: "SoundWave",
    color: "Black",
    material: "Plastic"
  },
  {
    name: "Mechanical Gaming Keyboard",
    slug: "mechanical-gaming-keyboard",
    description: "RGB mechanical gaming keyboard with customizable keys, anti-ghosting, and durable switches.",
    price: 129.99,
    stock: 45,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"
    ],
    category: "Electronics",
    brand: "GameTech",
    color: "RGB",
    material: "Aluminum/Plastic"
  },
  {
    name: "Stainless Steel Water Bottle",
    slug: "stainless-steel-water-bottle",
    description: "Insulated stainless steel water bottle keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 24.99,
    stock: 150,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"
    ],
    category: "Accessories",
    brand: "HydroFlow",
    color: "Blue",
    size: "750ml",
    material: "Stainless Steel"
  },
  {
    name: "Wireless Mouse Ultra",
    slug: "wireless-mouse-ultra",
    description: "Ergonomic wireless mouse with adjustable DPI, rechargeable battery, and silent clicks.",
    price: 39.99,
    stock: 95,
    discount: 5,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
      "https://images.unsplash.com/photo-1586920740099-e6ccced77869?w=500"
    ],
    category: "Electronics",
    brand: "TechFlow",
    color: "Black",
    material: "Plastic/Rubber"
  }
];

async function seedProducts() {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/WolfDB";
    
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    console.log("🗑️  Clearing existing products...");
    await Product.deleteMany({});
    console.log("✅ Cleared existing products");

    // Insert sample products
    console.log("📦 Adding sample products...");
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully added ${products.length} products`);

    console.log("\n📦 Products Added:");
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Database seeding completed successfully!");
    console.log("🚀 You can now start your server with: npm start");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedProducts();