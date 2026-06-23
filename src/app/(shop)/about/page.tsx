"use client";

import InfiniteMenu from "~/components/ui/InfiniteMenu";
import { usePageTitle } from "~/lib/use-page-title";

/** Array of card objects passed to the InfiniteMenu component.
 *  Each entry provides an image URL, a click-through link, and display text. */
const items = [
  {
    image: "/images/about-300.svg",
    link: "/products",
    title: "Collection",
    description: "Explore our signature fragrances",
  },
  {
    image: "/images/about-400.svg",
    link: "/about",
    title: "Craftsmanship",
    description: "Perfume made with precision & passion",
  },
  {
    image: "/images/about-500.svg",
    link: "/contact",
    title: "Get In Touch",
    description: "We'd love to hear from you",
  },
  {
    image: "/images/about-600.svg",
    link: "/orders",
    title: "Your Orders",
    description: "Track your purchases & history",
  },
];

/** Full-screen about page that renders the InfiniteMenu as a hero animation. */
export default function AboutPage() {
  usePageTitle("About");
  return (
    // Fixed full-screen container so the menu covers the entire viewport
    <div className="fixed inset-0 h-screen w-screen">
      <InfiniteMenu items={items} scale={3} />
    </div>
  );
}
