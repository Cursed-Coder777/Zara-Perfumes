"use client";

"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent,ReactNode } from "react";

import { useStairs } from "./Stairs";

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
  const { coverPage } = useStairs();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.(e);
    void coverPage();
    router.push(href);
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
