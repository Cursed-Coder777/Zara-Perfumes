"use client";

import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import ReactLenis from "lenis/react";
import React, { useRef } from "react";

import { cn } from "~/lib/utils";

interface CardData {
  id: number | string;
  image: string;
  alt?: string;
}

interface StickyCardProps {
  cards: CardData[];
  className?: string;
}

const StickyCard = ({ cards, className }: StickyCardProps) => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <ReactLenis root>
      <main
        ref={container}
        className={cn(
          "relative flex w-full flex-col items-center justify-center pb-[100vh] pt-[50vh]",
          className,
        )}
      >
        {cards.map((card, i) => {
          const targetScale = Math.max(
            0.5,
            1 - (cards.length - i - 1) * 0.1,
          );
          return (
            <StickyCardItem
              key={card.id}
              i={i}
              title={card.alt ?? `Card ${i + 1}`}
              src={card.image}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </main>
    </ReactLenis>
  );
};

const StickyCardItem = ({
  i,
  title,
  src,
  progress,
  range,
  targetScale,
}: {
  i: number;
  title: string;
  src: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}) => {
  const container = useRef<HTMLDivElement>(null);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="sticky top-0 flex items-center justify-center"
    >
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${i * 20 + 250}px)`,
        }}
        className="relative flex h-[300px] w-[500px] origin-top flex-col overflow-hidden rounded-4xl"
      >
        <img src={src} alt={title} className="h-full w-full object-cover" />
      </motion.div>
    </div>
  );
};

export { StickyCard };

/**
 * Skiper 16 StickyCard_001 — React + Framer Motion
 * We respect the original creators. This is an inspired rebuild with our own taste and does not claim any ownership.
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.me
 * Twitter: https://x.com/Gur__vi
 */
