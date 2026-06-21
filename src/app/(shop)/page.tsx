import Link from "next/link";
import { api, HydrateClient } from "~/trpc/server";
import { ProductCard } from "~/components/product-card";
import HeroSection from "~/components/hero-section";

// Home is the main landing page — an async server component that fetches featured products, categories, and latest products, then renders marketing sections
export default async function Home() {
  // Fetch up to 4 featured products from the tRPC product router to display in the Featured Fragrances section
  const featured = await api.product.list({ featured: true, limit: 4 });
  // Fetch all product categories from the tRPC product router to render category filter buttons
  const categories = await api.product.categories();

  return (
    // HydrateClient wraps the JSX to pass server-fetched tRPC data to the client query cache, preventing refetch on hydration
    <HydrateClient>
      {/* HeroSection renders the full-viewport hero with a Ferrofluid WebGL fluid animation background and brand CTA buttons */}
      <HeroSection />

      {/* Featured Fragrances section — grid of ProductCard components from the server-fetched featured array */}
      <section id="featured" className="px-6 md:px-12 lg:px-24 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          {/* Section header row with "Curated Selection" label and a "View All" link to /products */}
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
                Curated Selection
              </p>
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight">Featured Fragrances</h2>
            </div>
            <Link href="/products" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 text-xs hidden md:inline-flex">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 auto-rows-fr">
            {featured.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories section — conditionally rendered only if categories exist, shows a grid of category tiles linking to filtered /products page */}
      {categories.length > 0 && (
        <section className="px-6 md:px-12 lg:px-24 py-16 md:py-24 lg:py-32 bg-neutral-100 dark:bg-neutral-900">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
              Collections
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-12 md:mb-16">Browse by Category</h2>
            {/* Grid of category tiles — each is an anchor tag that navigates to /products?category={slug} */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center justify-center aspect-square border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-950 hover:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-950 transition-all duration-300"
                >
                  {/* Category name rendered in the serif font centered inside the square tile */}
                  <span className="font-serif text-lg md:text-2xl tracking-tight text-center px-4">
                    {cat.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* <section>
        <ScrollStack useWindowScroll>
          <ScrollStackItem itemClassName="bg-neutral-900 border border-neutral-700">
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-4 text-neutral-50">Noir Extreme</h2>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-xl">
              A bold, seductive blend of dark woods and warm spices. Made for those who leave a lasting impression.
            </p>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="bg-neutral-900 border border-neutral-700">
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-4 text-neutral-50">Azure Bloom</h2>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-xl">
              Fresh aquatic florals meet crisp citrus. A breath of coastal air captured in a bottle.
            </p>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="bg-neutral-900 border border-neutral-700">
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-4 text-neutral-50">Santal Royal</h2>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-xl">
              Luxurious sandalwood wrapped in amber and hints of oud. Timeless elegance for any occasion.
            </p>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="bg-neutral-900 border border-neutral-700">
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-4 text-neutral-50">Citrus Mist</h2>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-xl">
              Bright Sicilian bergamot meets zesty grapefruit. An invigorating burst of energy for the modern spirit.
            </p>
          </ScrollStackItem>
        </ScrollStack>
      </section> */}

      {/* Call-to-action bottom banner — dark section with "The Essence of You" tagline and a "Shop Now" link */}
      <section className="px-6 md:px-12 lg:px-24 py-16 md:py-24 lg:py-32 bg-neutral-950 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950">
        <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-8">
            The Essence of You
          </h2>
          <p className="text-base md:text-lg text-neutral-400 dark:text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-12">
            Every fragrance is a signature. Discover scents that resonate with your
            personality and leave a lasting impression.
          </p>
          <Link href="/products" className="bg-neutral-50 text-neutral-950 hover:bg-neutral-200 dark:bg-neutral-950 dark:text-neutral-50 dark:hover:bg-neutral-800 inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300">
            Shop Now
          </Link>
        </div>
      </section>
    </HydrateClient>
  );
}
