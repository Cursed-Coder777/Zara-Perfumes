// HeroSection is a client component that renders the full-viewport hero banner with a Ferrofluid fluid-dynamics WebGL background and overlays the brand tagline + CTA buttons on top
"use client";

// Import Link for client-side navigation between pages
import Link from "next/link";
// Import the Ferrofluid component — a WebGL-based magnetic fluid animation with mouse interaction
import Ferrofluid from "~/components/ui/Ferrofluid";

export default function HeroSection() {
  return (
    <>
      {/*
        Hero section container — relative positioned so the absolute-filled
        Ferrofluid canvas fills the background while the content z-index stays above
      */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 overflow-hidden">
        {/*
          Ferrofluid background — absolutely positioned to fill the entire hero section,
          renders a white-on-transparent fluid simulation that follows the cursor
        */}
        <div className="absolute inset-0 w-full h-full">
          {/* Three white color stops produce a monochrome fluid animation that stays subtle and premium */}
          {/* Slow animation speed for a calm, elegant fluid motion */}
          {/* Slightly enlarged scale to spread the fluid contours across the viewport */}
          {/* Moderate turbulence adds organic waviness to the flowing bands */}
          {/* Low fluidity keeps the peaks distinct rather than fully blending */}
          {/* Thin contour rim width produces delicate, hairline tracing lines */}
          {/* High sharpness makes the contour edges crisp and defined */}
          {/* Shimmer adds subtle sparkling variation along the flow lines */}
          {/* Glow intensifies the brightest contour bands for a luminous effect */}
          {/* Flow moves downward, mimicking a gentle cascading fluid */}
          {/* Full opacity — the effect is visible at its full intensity */}
          {/* Enable mouse interaction so the fluid reacts to cursor movement */}
          {/* Strong magnetic pull makes the fluid follow the cursor noticeably */}
          {/* Wide radius so the cursor affects a broad area of the fluid */}
          <Ferrofluid
            colors={["#ffffff", "#ffffff", "#ffffff"]}
            speed={0.5}
            scale={1.6}
            turbulence={1}
            fluidity={0.1}
            rimWidth={0.2}
            sharpness={2.5}
            shimmer={1.5}
            glow={2}
            flowDirection="down"
            opacity={1}
            mouseInteraction
            mouseStrength={1}
            mouseRadius={0.35}
          />
        </div>
        {/*
          Content overlay — centered above the Ferrofluid canvas using relative positioning and z-index
        */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Small muted "Est. 2025" label above the hero heading to establish brand heritage */}
          <p className="text-xs uppercase tracking-[0.3em] mb-6 text-neutral-400">
            Est. 2025
          </p>
          {/* Main hero heading using the serif font, split across two lines for visual impact */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none mb-8">
            Fragrance
            <br />
            <span className="text-neutral-300 dark:text-neutral-600">Defines</span>
            {" "}Presence
          </h1>
          {/* Supporting paragraph describing the brand's value proposition — curated, elegant, sophisticated */}
          <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto mb-12 leading-relaxed">
            Curated perfumes crafted for those who understand the power of scent.
            Each bottle tells a story of elegance and sophistication.
          </p>
          {/* Call-to-action buttons: primary filled link to /products, secondary outlined link to #featured */}
          <div className="flex items-center justify-center gap-4">
            <Link href="/products" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200">
              Explore Collection
            </Link>
            <Link href="#featured" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 border border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-neutral-50 dark:border-neutral-50 dark:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-950">
              View Featured
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
