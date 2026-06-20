// Load environment variables from .env into process.env before any other imports that depend on them
import "dotenv/config";
// Import the Drizzle ORM wrapper for postgres.js to build the database client
import { drizzle } from "drizzle-orm/postgres-js";
// Import the raw PostgreSQL driver for creating the connection to the database
import postgres from "postgres";
// Import the full database schema so the seed script can insert into all business tables with type safety
import * as schema from "../src/server/db/schema";

// Create a raw postgres.js connection using the DATABASE_URL environment variable (non-null asserted)
const conn = postgres(process.env.DATABASE_URL!);
// Build a Drizzle ORM instance bound to this connection and the schema for typed insert/select queries
const db = drizzle(conn, { schema });

// Define the main async seed function that populates the database with initial category and product data
async function seed() {
  // Insert the "Floral" category and get the auto-generated record back (with its id)
  const [floral] = await db.insert(schema.category).values({
    name: "Floral",
    slug: "floral",
    description: "Delicate and romantic floral scents",
  }).returning();

  // Insert the "Woody" category and capture the returned record
  const [woody] = await db.insert(schema.category).values({
    name: "Woody",
    slug: "woody",
    description: "Warm and earthy woody fragrances",
  }).returning();

  // Insert the "Fresh" category and capture the returned record
  const [fresh] = await db.insert(schema.category).values({
    name: "Fresh",
    slug: "fresh",
    description: "Clean and invigorating fresh scents",
  }).returning();

  // Insert the "Oriental" category and capture the returned record
  const [oriental] = await db.insert(schema.category).values({
    name: "Oriental",
    slug: "oriental",
    description: "Rich and exotic oriental blends",
  }).returning();

  // Define an array of product data objects to be inserted into the product table
  const products = [
    {
      name: "Noir Extreme",
      slug: "noir-extreme",
      description: "An intense and seductive fragrance that captures the essence of the night. Notes of black vanilla, cardamom, and amber create a warm, mysterious aura that lingers.",
      price: 9500,
      sizes: [{ ml: 30, price: 6500 }, { ml: 50, price: 9500 }, { ml: 100, price: 14500 }],
      scentNotes: "Black Vanilla, Cardamom, Amber, Musk",
      categoryId: oriental.id,
      stock: 50,
      isFeatured: true,
    },
    {
      name: "Azure Bloom",
      slug: "azure-bloom",
      description: "A fresh aquatic floral that evokes the feeling of a Mediterranean breeze. Top notes of sea salt and bergamot give way to a heart of jasmine and lily.",
      price: 8500,
      sizes: [{ ml: 30, price: 5500 }, { ml: 50, price: 8500 }, { ml: 100, price: 13500 }],
      scentNotes: "Sea Salt, Bergamot, Jasmine, Lily, Musk",
      categoryId: floral.id,
      stock: 35,
      isFeatured: true,
    },
    {
      name: "Santal Royal",
      slug: "santal-royal",
      description: "A regal woody fragrance built around rare Mysore sandalwood. Blended with cedar, leather, and a hint of saffron for a sophisticated, timeless appeal.",
      price: 12000,
      sizes: [{ ml: 30, price: 7500 }, { ml: 50, price: 12000 }, { ml: 100, price: 18500 }],
      scentNotes: "Sandalwood, Cedar, Leather, Saffron, Amber",
      categoryId: woody.id,
      stock: 25,
      isFeatured: true,
    },
    {
      name: "Citrus Mist",
      slug: "citrus-mist",
      description: "An invigorating burst of Sicilian citrus blended with fresh herbs and a touch of ginger. Perfect for the modern individual who lives life with energy.",
      price: 7000,
      sizes: [{ ml: 30, price: 4500 }, { ml: 50, price: 7000 }, { ml: 100, price: 11000 }],
      scentNotes: "Sicilian Lemon, Bergamot, Ginger, Mint, Vetiver",
      categoryId: fresh.id,
      stock: 60,
      isFeatured: true,
    },
    {
      name: "Velvet Oud",
      slug: "velvet-oud",
      description: "A luxurious oriental fragrance that combines rare oud with rose absolute and dark chocolate. Deep, complex, and utterly captivating.",
      price: 15000,
      sizes: [{ ml: 30, price: 9500 }, { ml: 50, price: 15000 }, { ml: 100, price: 22500 }],
      scentNotes: "Oud, Rose Absolute, Dark Chocolate, Patchouli, Saffron",
      categoryId: oriental.id,
      stock: 15,
      isFeatured: false,
    },
    {
      name: "Morning Dew",
      slug: "morning-dew",
      description: "Capture the freshness of early morning with this delicate floral-green fragrance. Dewy violet leaves, fresh-cut grass, and soft white musk.",
      price: 7800,
      sizes: [{ ml: 30, price: 4800 }, { ml: 50, price: 7800 }, { ml: 100, price: 12000 }],
      scentNotes: "Violet Leaf, Green Grass, White Musk, Lily of the Valley",
      categoryId: floral.id,
      stock: 40,
      isFeatured: false,
    },
    {
      name: "Ember & Smoke",
      slug: "ember-and-smoke",
      description: "A bold woody fragrance inspired by the crackling warmth of a fireside. Smoky birch, guaiac wood, and roasted tonka bean create an unforgettable trail.",
      price: 10500,
      sizes: [{ ml: 30, price: 6500 }, { ml: 50, price: 10500 }, { ml: 100, price: 16000 }],
      scentNotes: "Birch, Guaiac Wood, Tonka Bean, Smoke, Whiskey",
      categoryId: woody.id,
      stock: 20,
      isFeatured: false,
    },
    {
      name: "Ocean Whisper",
      slug: "ocean-whisper",
      description: "A fresh marine scent that transports you to a secluded beach. Salty air, driftwood, and aquatic notes blend with a hint of coconut for a tropical escape.",
      price: 8200,
      sizes: [{ ml: 30, price: 5200 }, { ml: 50, price: 8200 }, { ml: 100, price: 12800 }],
      scentNotes: "Sea Breeze, Driftwood, Coconut, Aquatic Notes, Amber",
      categoryId: fresh.id,
      stock: 45,
      isFeatured: false,
    },
  ];

  // Iterate over each product definition and insert it into the product table
  for (const product of products) {
    await db.insert(schema.product).values(product);
  }

  // Log a success message to the console after all inserts have completed
  console.log("Seed complete!");
  // Close the database connection gracefully so the script can exit cleanly
  await conn.end();
}

// Execute the seed function and catch any errors by logging them to stderr (prevents unhandled promise rejections)
seed().catch(console.error);
