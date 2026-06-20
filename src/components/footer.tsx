// Import Link for client-side navigation to app pages
import Link from "next/link";

// Footer is a server component that renders the site-wide footer with branding, navigation links, contact info, and copyright
export function Footer() {
  return (
    // Outer footer element with top border for visual separation from the main content
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-16 md:py-24">
        {/* Three-column grid: Brand description, navigation links, and contact info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand column — logo and short brand description */}
          <div>
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
              ZARA
            </Link>
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Curated fragrances that define your presence. Each bottle tells a story of
              elegance and sophistication.
            </p>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-widest mb-4">Navigate</h3>
            <div className="flex flex-col gap-2">
              <Link href="/products" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors">
                All Fragrances
              </Link>
              <Link href="/about" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors">
                Contact
              </Link>
              <Link href="/auth" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors">
                Account
              </Link>
              <Link href="/cart" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors">
                Cart
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-widest mb-4">Contact</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              hello@zarafragrance.com
            </p>
            <Link href="/contact" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors mt-2 inline-block">
              Send a message →
            </Link>
          </div>
        </div>
        {/* Bottom copyright bar — shows dynamic year and "All rights reserved" */}
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 text-center tracking-wider">
            &copy; {new Date().getFullYear()} ZARA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
