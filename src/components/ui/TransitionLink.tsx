"use client";

import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode, useCallback } from "react";

import { useStairs } from "~/components/ui/Stairs";

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

  const handleClick = useCallback(
    async (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onClick?.(e);
      // Cover immediately, then navigate — reveal happens on the new page via StairsWatcher
      await coverPage();
      router.push(href);
    },
    [href, router, coverPage, onClick],
  );

  const handleMouseEnter = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      router.prefetch(href);
      onMouseEnter?.(e);
    },
    [href, router, onMouseEnter],
  );

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
