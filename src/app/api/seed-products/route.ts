// Seed script: Run from a browser console or as a Next.js page to populate
// the Firestore 'products' collection with catalog data from MOCK_PRODUCTS.
//
// Usage: Navigate to /api/seed-products (GET) — this is a one-time setup endpoint.
// NOTE: This should be removed or protected in production.

import { NextResponse } from "next/server";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// We import the products from the mock data so they're the single source of truth.
import { MOCK_PRODUCTS } from "@/constants/mock-products";

export async function GET() {
  try {
    const productsRef = collection(db, "products");

    for (const product of MOCK_PRODUCTS) {
      await setDoc(doc(productsRef, product.id), {
        slug: product.slug,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice || null,
        image: product.image,
        images: product.images,
        category: product.category,
        collections: product.collections,
        badge: product.badge || null,
        colors: product.colors,
        sizes: product.sizes,
        description: product.description,
        details: product.details,
        fabricCare: product.fabricCare,
        fit: product.fit,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.inStock,
        featured: product.featured || false,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${MOCK_PRODUCTS.length} products to Firestore.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
