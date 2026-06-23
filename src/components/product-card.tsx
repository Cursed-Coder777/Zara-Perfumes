// Import TransitionLink for animated page transitions
import { TransitionLink } from "~/components/ui/TransitionLink";

// Type definition for the props that ProductCard receives — id, name, slug, price, images array, and optional scent notes
type ProductCardProps = {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  scentNotes: string | null;
};

// ProductCard is a server component that renders a single product preview card — used in grids on the homepage and products page
export function ProductCard({ name, slug, price, images, scentNotes }: ProductCardProps) {
  return (
    // Entire card is a TransitionLink to the product detail page, with a vertical flex layout
    <TransitionLink href={`/products/${slug}`} className="group flex flex-col gap-4">
      {/* Product image container with 3:4 aspect ratio and a hover zoom effect */}
      <div className="aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        {images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0]}
            alt={name}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
          />
        ) : (
          // Fallback placeholder when no image is available — shows the brand initial "Z"
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-6xl text-neutral-300 dark:text-neutral-700">Z</span>
          </div>
        )}
      </div>
      {/* Product info below the image — name, scent notes, and price */}
      <div className="flex flex-col gap-1">
        <h3 className="font-serif text-lg tracking-tight transition-opacity group-hover:opacity-60">
          {name}
        </h3>
        {/* Scent notes shown in small uppercase text if available */}
        {scentNotes && (
          <p className="text-xs tracking-widest text-neutral-400 uppercase">{scentNotes}</p>
        )}
        {/* Price formatted in dollars (cents to dollars conversion) */}
        <p className="mt-1 text-sm font-medium">${(price / 100).toFixed(2)}</p>
      </div>
    </TransitionLink>
  );
}
