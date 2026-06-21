"use client";

import InfiniteMenu from "~/components/ui/InfiniteMenu";

/** Array of card objects passed to the InfiniteMenu component.
 *  Each entry provides an image URL, a click-through link, and display text. */
const items = [
  {
    image: "https://picsum.photos/300/300?grayscale",
    link: "/products",
    title: "Collection",
    description: "Explore our signature fragrances",
  },
  {
    image: "https://picsum.photos/400/400?grayscale",
    link: "/about",
    title: "Craftsmanship",
    description: "Perfume made with precision & passion",
  },
  {
    image: "https://picsum.photos/500/500?grayscale",
    link: "/contact",
    title: "Get In Touch",
    description: "We'd love to hear from you",
  },
  {
    image: "https://picsum.photos/600/600?grayscale",
    link: "/orders",
    title: "Your Orders",
    description: "Track your purchases & history",
  },
];

/** Full-screen about page that renders the InfiniteMenu as a hero animation. */
export default function AboutPage() {
  return (
    // Fixed full-screen container so the menu covers the entire viewport
    <div className="fixed inset-0 w-screen h-screen">
      <InfiniteMenu items={items} scale={3} />
    </div>
  );
}
