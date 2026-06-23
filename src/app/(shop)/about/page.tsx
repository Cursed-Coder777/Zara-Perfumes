"use client";

import InfiniteMenu from "~/components/ui/InfiniteMenu";
import { usePageTitle } from "~/lib/use-page-title";

const GALLERY_ITEMS = Array.from({ length: 20 }, (_, i) => ({
  image: `/images/gallery/gallery-${i + 1}.jpg`,
  link: "/products",
  title: "ZARA",
  description: "Perfume Collection",
}));

/** Full-screen about page that renders the InfiniteMenu as a hero animation
 *  using local gallery images. */
export default function AboutPage() {
  usePageTitle("About");

  return (
    <div className="fixed inset-0 h-screen w-screen">
      <InfiniteMenu items={GALLERY_ITEMS} scale={3} />
    </div>
  );
}
