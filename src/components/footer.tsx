// Import TransitionLink for animated page transitions
import { TransitionLink } from "~/components/ui/TransitionLink";

// Footer is a server component that renders the site-wide footer with branding, navigation links, contact info, and copyright
export function Footer() {
  return (
    // Outer footer element with top border for visual separation from the main content
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
        {/* Three-column grid: Brand description, navigation links, and contact info */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Brand column — logo and short brand description */}
          <div>
            <TransitionLink href="/" className="font-serif text-2xl font-bold tracking-tight">
              ZARA
            </TransitionLink>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Curated fragrances that define your presence. Each bottle tells a story of elegance
              and sophistication.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm tracking-widest uppercase">Navigate</h3>
            <div className="flex flex-col gap-2">
              <TransitionLink
                href="/products"
                className="text-sm text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                All Fragrances
              </TransitionLink>
              <TransitionLink
                href="/about"
                className="text-sm text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                About
              </TransitionLink>
              <TransitionLink
                href="/contact"
                className="text-sm text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                Contact
              </TransitionLink>
              <TransitionLink
                href="/auth"
                className="text-sm text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                Account
              </TransitionLink>
              <TransitionLink
                href="/cart"
                className="text-sm text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                Cart
              </TransitionLink>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm tracking-widest uppercase">Contact</h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              hello@zarafragrance.com
            </p>
            <TransitionLink
              href="/contact"
              className="mt-2 inline-block text-sm text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
            >
              Send a message →
            </TransitionLink>
          </div>
        </div>
        {/* Bottom copyright bar — shows dynamic year and "All rights reserved" */}
        <div className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <p className="text-center text-xs tracking-wider text-neutral-400">
            &copy; {new Date().getFullYear()} ZARA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
