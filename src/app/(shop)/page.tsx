import { api, HydrateClient } from "~/trpc/server";
import { ProductCard } from "~/components/product-card";
import HeroSection from "~/components/hero-section";
import { TransitionLink } from "~/components/ui/TransitionLink";

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
      <section id="featured" className="px-6 py-16 md:px-12 md:py-24 lg:px-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          {/* Section header row with "Curated Selection" label and a "View All" link to /products */}
          <div className="mb-12 flex items-end justify-between md:mb-16">
            <div>
              <p className="mb-3 text-xs tracking-[0.3em] text-neutral-400 uppercase">
                Curated Selection
              </p>
              <h2 className="font-serif text-3xl leading-tight tracking-tight md:text-5xl">
                Featured Fragrances
              </h2>
            </div>
            <TransitionLink
              href="/products"
              className="hidden inline-flex items-center justify-center px-8 py-3 text-sm text-xs font-medium tracking-widest text-neutral-600 uppercase transition-all duration-300 hover:text-neutral-950 md:inline-flex dark:text-neutral-400 dark:hover:text-neutral-50"
            >
              View All →
            </TransitionLink>
          </div>
          <div className="grid auto-rows-fr grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories section — conditionally rendered only if categories exist, shows a grid of category tiles linking to filtered /products page */}
      {categories.length > 0 && (
        <section className="bg-neutral-100 px-6 py-16 md:px-12 md:py-24 lg:px-24 lg:py-32 dark:bg-neutral-900">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <p className="mb-3 text-xs tracking-[0.3em] text-neutral-400 uppercase">Collections</p>
            <h2 className="mb-12 font-serif text-3xl leading-tight tracking-tight md:mb-16 md:text-5xl">
              Browse by Category
            </h2>
            {/* Grid of category tiles — each is an anchor tag that navigates to /products?category={slug} */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => (
                <TransitionLink
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex aspect-square flex-col items-center justify-center border border-neutral-200 transition-all duration-300 hover:bg-neutral-950 hover:text-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-50 dark:hover:text-neutral-950"
                >
                  {/* Category name rendered in the serif font centered inside the square tile */}
                  <span className="px-4 text-center font-serif text-lg tracking-tight md:text-2xl">
                    {cat.name}
                  </span>
                </TransitionLink>
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
      <section className="bg-neutral-950 px-6 py-16 text-neutral-50 md:px-12 md:py-24 lg:px-24 lg:py-32 dark:bg-neutral-50 dark:text-neutral-950">
        <div className="mx-auto max-w-7xl px-6 text-center md:px-12">
          <h2 className="mb-8 font-serif text-3xl leading-tight tracking-tight md:text-5xl">
            The Essence of You
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg dark:text-neutral-600">
            Every fragrance is a signature. Discover scents that resonate with your personality and
            leave a lasting impression.
          </p>
          <TransitionLink
            href="/products"
            className="inline-flex items-center justify-center bg-neutral-50 px-8 py-3 text-sm font-medium tracking-widest text-neutral-950 uppercase transition-all duration-300 hover:bg-neutral-200 dark:bg-neutral-950 dark:text-neutral-50 dark:hover:bg-neutral-800"
          >
            Shop Now
          </TransitionLink>
        </div>
      </section>
    </HydrateClient>
  );
}
