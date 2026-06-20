import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
          Our Story
        </p>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-tight mb-8">
          Crafting Presence Through Scent
        </h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
            ZARA was born from a simple belief: fragrance is not an accessory,
            it is a statement. Every bottle we craft is designed to capture a
            mood, a memory, a moment of undeniable presence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
          <div className="p-8 border border-neutral-200 dark:border-neutral-800">
            <p className="text-4xl font-serif mb-4">01</p>
            <h3 className="font-serif text-xl mb-3">Curated with Care</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Every fragrance in our collection is selected for its
              distinct character and lasting impression.
            </p>
          </div>
          <div className="p-8 border border-neutral-200 dark:border-neutral-800">
            <p className="text-4xl font-serif mb-4">02</p>
            <h3 className="font-serif text-xl mb-3">Sustainably Sourced</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              We partner with ethical suppliers who share our commitment to
              quality and the environment.
            </p>
          </div>
          <div className="p-8 border border-neutral-200 dark:border-neutral-800">
            <p className="text-4xl font-serif mb-4">03</p>
            <h3 className="font-serif text-xl mb-3">Timeless Design</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              From the bottle to the box, every detail is designed to be
              as beautiful as the scent within.
            </p>
          </div>
        </div>

        <div className="text-center py-12 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
            Ready to find your signature scent?
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
