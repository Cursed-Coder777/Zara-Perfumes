"use client";

// Client component that intercepts <a> clicks to trigger a GSAP stair transition before navigating
import { useRouter } from "next/navigation";
import { useStairs } from "./Stairs";
import type { ReactNode, MouseEvent } from "react";

// TransitionLink renders as <a> but intercepts clicks to run the stair transition before navigating
// Prefetches the destination on hover for instant navigation after the transition
export function TransitionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const { startTransition } = useStairs();

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    startTransition(() => router.push(href));
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={() => router.prefetch(href)}
      className={className}
    >
      {children}
    </a>
  );
}
