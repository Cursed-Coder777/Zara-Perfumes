"use client";

// Client component that intercepts <a> clicks to trigger a GSAP stair transition before navigating
import { useRouter } from "next/navigation";
import type { MouseEvent,ReactNode } from "react";

import { useStairs } from "./Stairs";

// TransitionLink renders as <a> but intercepts clicks to run the stair transition before navigating
// Prefetches the destination on hover for instant navigation after the transition
export function TransitionLink({
  href,
  children,
  className,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: (e: MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const router = useRouter();
  const { triggerStairs } = useStairs();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.(e);
    // Navigate FIRST so the new page starts loading immediately
    router.push(href);
    // Then trigger the stair animation — covers the current page while the new one loads
    triggerStairs();
  };

  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    router.prefetch(href);
    onMouseEnter?.(e);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
