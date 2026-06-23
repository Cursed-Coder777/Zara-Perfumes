// HeroSection is a client component that renders the full-viewport hero banner with a Ferrofluid fluid-dynamics WebGL background and overlays the brand tagline + CTA buttons on top
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { TransitionLink } from "~/components/ui/TransitionLink";

const Ferrofluid = dynamic(() => import("~/components/ui/Ferrofluid"), { ssr: false });

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    setIsMobile(
      typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0),
    );
  }, []);

  return (
    <>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 md:px-12">
        <div className="absolute inset-0 h-full w-full">
          {!isMobile && (
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
          )}
        </div>
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs tracking-[0.3em] text-neutral-400 uppercase">Est. 2025</p>
          {/* Main hero heading using the serif font, split across two lines for visual impact */}
          <h1 className="mb-8 font-serif text-5xl leading-none tracking-tight md:text-7xl lg:text-8xl">
            Fragrance
            <br />
            <span className="text-neutral-300 dark:text-neutral-600">Defines</span> Presence
          </h1>
          {/* Supporting paragraph describing the brand's value proposition — curated, elegant, sophisticated */}
          <p className="mx-auto mb-12 max-w-xl text-base leading-relaxed text-neutral-500 md:text-lg dark:text-neutral-400">
            Curated perfumes crafted for those who understand the power of scent. Each bottle tells
            a story of elegance and sophistication.
          </p>
          {/* Call-to-action buttons: primary filled link to /products, secondary outlined link to #featured */}
          <div className="flex items-center justify-center gap-4">
            <TransitionLink
              href="/products"
              className="inline-flex items-center justify-center bg-neutral-950 px-8 py-3 text-sm font-medium tracking-widest text-neutral-50 uppercase transition-all duration-300 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Explore Collection
            </TransitionLink>
            <Link
              href="#featured"
              className="inline-flex items-center justify-center border border-neutral-950 px-8 py-3 text-sm font-medium tracking-widest text-neutral-950 uppercase transition-all duration-300 hover:bg-neutral-950 hover:text-neutral-50 dark:border-neutral-50 dark:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-950"
            >
              View Featured
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
