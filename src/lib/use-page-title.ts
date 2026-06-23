"use client";

import { useEffect } from "react";

/**
 * Sets the document title for client components that cannot use Next.js
 * `metadata` export. The title is appended with " | ZARA Fragrance" to
 * match the metadata template in the root layout.
 *
 * Restores the previous title on unmount so navigation does not leak stale titles.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} | ZARA Fragrance`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
