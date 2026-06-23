// Mark this component as a Client Component for interactivity (theme toggle, mobile menu, cart badge, sign-out)
"use client";

// Import the authClient for calling signOut
import { authClient } from "~/server/better-auth/client";
// Import TransitionLink for animated page transitions
import { TransitionLink } from "~/components/ui/TransitionLink";
// Type definition for a session user object — includes id, name, email, optional image, and optional role
type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
};
// Type definition for a session — either an object with a user or null
type Session = { user: SessionUser } | null;
// Import useRouter for navigation after sign-out and usePathname to highlight the active nav link
import { useRouter, usePathname } from "next/navigation";
// Import useEffect for scroll listener, mobile menu close on route change, and cart count sync; useState for mobile menu and scroll state
import { useEffect, useMemo, useState } from "react";
// Import the tRPC React client for fetching cart items to display the badge count
import { api } from "~/trpc/react";
// Import FlowingMenu for the full-screen hamburger overlay
import FlowingMenu from "~/components/FlowingMenu";
// Import motion + AnimatePresence for overlay enter/exit animations
import { motion, AnimatePresence } from "motion/react";

const menuItems = [
  { link: "/", text: "Home", image: "/images/card-2.jpg" },
  { link: "/products", text: "Fragrances", image: "/images/gallery/gallery-2.jpg" },
  { link: "/about", text: "About", image: "/images/gallery/gallery-6.jpg" },
  { link: "/contact", text: "Contact", image: "/images/gallery/gallery-4.jpg" },
];

// Nav renders the fixed top navigation bar with logo, links, theme toggle, cart badge, auth controls, and mobile hamburger menu
export function Nav({ session }: { session: Session | null }) {
  // Initialize the router for programmatic navigation after sign-out
  const router = useRouter();
  // Get the current pathname to determine which nav link is active
  const pathname = usePathname();
  // State to control the mobile navigation menu open/close
  const [mobileOpen, setMobileOpen] = useState(false);
  // State to track whether the page has been scrolled past a threshold (for navbar background)
  const [scrolled, setScrolled] = useState(false);

  // Query cart items via tRPC — only enabled when the user is authenticated, used to compute the cart count badge
  const { data: cartItems } = api.cart.list.useQuery(undefined, {
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  // Derive cart count from cart items directly
  const cartCount = useMemo(
    () => (cartItems ? cartItems.reduce((sum, i) => sum + i.quantity, 0) : 0),
    [cartItems],
  );

  // Add a scroll event listener to set scrolled state (used to add backdrop-blur to navbar after 20px scroll)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the pathname changes (user navigates to a new page)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    // Fixed header at the top of the viewport — becomes translucent with backdrop blur when scrolled
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-neutral-950/90 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      {/* Inner nav container with max width and centered content */}
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
        {/* Brand logo linking to the home page */}
        <TransitionLink href="/" className="font-serif text-2xl font-bold tracking-tight">
          ZARA
        </TransitionLink>

        {/* Right-side controls: cart link, auth buttons, hamburger menu */}
        <div className="flex items-center gap-6">
          {/* If user is authenticated, show cart link with count badge, orders/admin link, and sign-out button */}
          {session ? (
            <>
              {/* Cart link with a numeric badge showing total item count */}
              <TransitionLink
                href="/cart"
                className="relative inline-flex items-center justify-center p-2 px-8 py-3 text-sm font-medium tracking-widest text-neutral-600 uppercase transition-all duration-300 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 text-[10px] text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950">
                    {cartCount}
                  </span>
                )}
              </TransitionLink>
              {/* Admin link for admin users, Orders link for regular users — links to appropriate page */}
              <TransitionLink
                href={session.user.role === "admin" ? "/admin" : "/orders"}
                className="inline-flex items-center justify-center p-2 px-8 py-3 text-sm font-medium tracking-widest text-neutral-600 uppercase transition-all duration-300 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                {session.user.role === "admin" ? "Admin" : "Orders"}
              </TransitionLink>
              {/* Sign-out button — calls authClient.signOut() then redirects to home */}
              <button
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/");
                }}
                className="inline-flex items-center justify-center p-2 px-8 py-3 text-sm font-medium tracking-widest text-neutral-600 uppercase transition-all duration-300 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            // If not authenticated, show a "Sign In" link
            <TransitionLink
              href="/auth"
              className="inline-flex items-center justify-center bg-neutral-950 px-6 px-8 py-2 py-3 text-sm text-xs font-medium tracking-widest text-neutral-50 uppercase transition-all duration-300 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Sign In
            </TransitionLink>
          )}

          {/* Hamburger menu toggle — visible on all screen sizes */}
          <button
            className="inline-flex items-center justify-center p-2 px-8 py-3 text-sm font-medium tracking-widest text-neutral-600 uppercase transition-all duration-300 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="text-[30px] leading-none">{mobileOpen ? "✕" : "≡"}</span>
          </button>
        </div>
      </nav>

      {/* Full-screen overlay menu — triggered by hamburger button, animated with fade/scale */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 top-0 left-0 z-50 h-screen w-screen"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Close button at top-right of the overlay */}
            <button
              className="absolute top-6 right-6 z-10 text-2xl text-white transition-colors hover:text-neutral-300"
              onClick={() => setMobileOpen(false)}
            >
              ✕
            </button>
            <FlowingMenu
              items={menuItems}
              speed={15}
              textColor="#ffffff"
              bgColor="#120F17"
              marqueeBgColor="#ffffff"
              marqueeTextColor="#120F17"
              borderColor="#ffffff"
              onLinkClick={() => setMobileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
