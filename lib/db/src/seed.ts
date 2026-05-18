import { db } from "./index";
import { shopsTable } from "./schema/shops";
import { medicinesTable } from "./schema/medicines";
import { productsTable } from "./schema/products";
async function seed() {
  console.log("Starting database seeding...");

  // Insert shops
  const newShops = await db.insert(shopsTable).values([
    {
      name: "Mehta Electricals",
      category: "services",
      locality: "Koramangala, Bengaluru",
      phone: "9876505001",
      openingTime: "09:00",
      closingTime: "19:00",
      rating: 4.3,
      reviewCount: 78,
      imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400",
      status: "verified"
    },
    {
      name: "South Spice Corner",
      category: "restaurants",
      locality: "T Nagar, Chennai",
      phone: "9876504003",
      openingTime: "08:00",
      closingTime: "22:00",
      rating: 4.8,
      reviewCount: 447,
      imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
      status: "verified"
    },
    {
      name: "Annapoorna Provisions",
      category: "grocery",
      locality: "T Nagar, Chennai",
      phone: "9876501003",
      openingTime: "07:30",
      closingTime: "20:30",
      rating: 4.0,
      reviewCount: 53,
      imageUrl: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400",
      status: "verified"
    },
    {
      name: "Daily Needs Bazaar",
      category: "grocery",
      locality: "Salt Lake, Kolkata",
      phone: "9876501005",
      openingTime: "09:00",
      closingTime: "20:00",
      rating: 4.1,
      reviewCount: 61,
      imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
      status: "verified"
    },
    {
      name: "Fresh Mart Superstore",
      category: "grocery",
      locality: "Koramangala, Bengaluru",
      phone: "9876501002",
      openingTime: "09:00",
      closingTime: "22:00",
      rating: 4.5,
      reviewCount: 142,
      imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
      status: "verified"
    },
    {
      name: "City Hospital",
      category: "healthcare",
      subcategory: "hospital",
      locality: "Salt Lake, Kolkata",
      phone: "9876503002",
      openingTime: "00:00",
      closingTime: "23:59",
      rating: 4.5,
      reviewCount: 278,
      imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400",
      status: "verified"
    },
    {
      name: "Punjabi Rasoi",
      category: "restaurants",
      locality: "Malviya Nagar, Delhi",
      phone: "9876504002",
      openingTime: "11:00",
      closingTime: "23:00",
      rating: 4.7,
      reviewCount: 389,
      imageUrl: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400",
      status: "verified"
    },
    {
      name: "MediLife Pharmacy",
      category: "healthcare",
      subcategory: "pharmacy",
      locality: "Malviya Nagar, Delhi",
      phone: "9876503003",
      openingTime: "08:00",
      closingTime: "22:00",
      rating: 4.3,
      reviewCount: 189,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
      status: "verified"
    }
  ]).returning();

  console.log(`Inserted ${newShops.length} shops.`);

  // Insert medicines for the pharmacy
  const pharmacy = newShops.find(s => s.name === "MediLife Pharmacy");
  if (pharmacy) {
    const newMedicines = await db.insert(medicinesTable).values([
      { shopId: pharmacy.id, name: "Paracetamol 500mg", available: true, price: 20 },
      { shopId: pharmacy.id, name: "Amoxicillin 250mg", available: true, price: 50 },
      { shopId: pharmacy.id, name: "Cetirizine 10mg", available: true, price: 15 },
      { shopId: pharmacy.id, name: "Ibuprofen 400mg", available: false, price: 30 }
    ]).returning();
    console.log(`Inserted ${newMedicines.length} medicines for ${pharmacy.name}.`);
  }

  // Insert mock products for Grocery and Restaurants
  const productsToInsert = [];
  
  const annapoorna = newShops.find(s => s.name === "Annapoorna Provisions");
  if (annapoorna) {
    productsToInsert.push(
      { shopId: annapoorna.id, name: "Aashirvaad Atta 5kg", description: "Whole wheat flour", price: 250, available: true, category: "Grocery" },
      { shopId: annapoorna.id, name: "Toor Dal 1kg", description: "Premium unpolished dal", price: 160, available: true, category: "Grocery" },
      { shopId: annapoorna.id, name: "Tata Salt 1kg", description: "Iodized salt", price: 25, available: true, category: "Grocery" }
    );
  }

  const freshMart = newShops.find(s => s.name === "Fresh Mart Superstore");
  if (freshMart) {
    productsToInsert.push(
      { shopId: freshMart.id, name: "Amul Butter 100g", description: "Pasteurized butter", price: 58, available: true, category: "Dairy" },
      { shopId: freshMart.id, name: "Britannia Good Day", description: "Cashew cookies", price: 30, available: true, category: "Snacks" },
      { shopId: freshMart.id, name: "Lays Classic Salted", description: "Potato chips", price: 20, available: true, category: "Snacks" }
    );
  }

  const southSpice = newShops.find(s => s.name === "South Spice Corner");
  if (southSpice) {
    productsToInsert.push(
      { shopId: southSpice.id, name: "Masala Dosa", description: "Crispy dosa with potato filling", price: 80, available: true, category: "Breakfast" },
      { shopId: southSpice.id, name: "Idli Vada", description: "2 Idlis and 1 Vada with sambar", price: 60, available: true, category: "Breakfast" },
      { shopId: southSpice.id, name: "Filter Coffee", description: "Authentic south indian coffee", price: 25, available: true, category: "Beverages" }
    );
  }

  const punjabiRasoi = newShops.find(s => s.name === "Punjabi Rasoi");
  if (punjabiRasoi) {
    productsToInsert.push(
      { shopId: punjabiRasoi.id, name: "Butter Chicken", description: "Creamy tomato gravy with chicken", price: 280, available: true, category: "Main Course" },
      { shopId: punjabiRasoi.id, name: "Garlic Naan", description: "Tandoori flatbread with garlic", price: 45, available: true, category: "Breads" },
      { shopId: punjabiRasoi.id, name: "Dal Makhani", description: "Slow cooked black lentils", price: 180, available: true, category: "Main Course" }
    );
  }

  if (productsToInsert.length > 0) {
    const newProducts = await db.insert(productsTable).values(productsToInsert).returning();
    console.log(`Inserted ${newProducts.length} mock products.`);
  }

  console.log("Database seeding completed successfully.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
