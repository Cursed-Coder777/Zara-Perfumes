import Link from "next/link";
import { api, HydrateClient } from "~/trpc/server";
import { ProductCard } from "~/components/product-card";
import HeroSection from "~/components/hero-section";
import ScrollReveal from "~/components/ScrollReveal";

// Home is the main landing page — an async server component that fetches featured products, categories, and latest products, then renders marketing sections
export default async function Home() {
  // Fetch up to 4 featured products from the tRPC product router to display in the Featured Fragrances section
  const featured = await api.product.list({ featured: true, limit: 4 });
  // Fetch all product categories from the tRPC product router to render category filter buttons
  const categories = await api.product.categories();
  // Fetch up to 8 newest products from the tRPC product router for the Latest Additions section
  const latest = await api.product.list({ sort: "newest", limit: 8 });

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
          {/* 2-column on mobile, 4-column on desktop grid rendering each featured product as a ProductCard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Scroll-reveal quote section — animated word-by-word reveal on scroll using GSAP */}
      <section className="px-6 md:px-12 lg:px-24 py-16 md:py-24 lg:py-32 bg-neutral-100 dark:bg-neutral-900">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollReveal
            baseOpacity={0.1}
            enableBlur
            baseRotation={3}
            blurStrength={4}
          >
            When does a man die? When he is hit by a bullet? No! When he suffers
            a disease? No! When he ate a soup made out of a poisonous mushroom?
            No! A man dies when he is forgotten!
          </ScrollReveal>
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

      {/* Latest Additions section — displays the 8 newest products in a grid with a "New Arrivals" heading */}
      <section className="px-6 md:px-12 lg:px-24 py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
                New Arrivals
              </p>
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight">Latest Additions</h2>
            </div>
          </div>
          {/* Grid of ProductCard components rendered from the server-fetched latest array */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {latest.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

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
