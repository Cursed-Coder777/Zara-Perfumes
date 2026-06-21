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

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Fragrances" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    // Fixed header at the top of the viewport — becomes translucent with backdrop blur when scrolled
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-neutral-950/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      {/* Inner nav container with max width and centered content */}
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
        {/* Brand logo linking to the home page */}
        <TransitionLink href="/" className="font-serif text-2xl font-bold tracking-tight">
          ZARA
        </TransitionLink>

        {/* Desktop navigation links — hidden on mobile, shown on md+ screens */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <TransitionLink
              key={link.href}
              href={link.href}
              className={`link-underline text-sm uppercase tracking-widest ${
                pathname === link.href ? "after:scale-x-100" : ""
              }`}
            >
              {link.label}
            </TransitionLink>
          ))}
        </div>

        {/* Right-side controls: cart link, auth buttons */}
        <div className="flex items-center gap-6">
          {/* If user is authenticated, show cart link with count badge, orders/admin link, and sign-out button */}
          {session ? (
            <>
              {/* Cart link with a numeric badge showing total item count */}
              <TransitionLink href="/cart" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 relative p-2 text-sm uppercase tracking-widest">
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 text-[10px] text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950">
                    {cartCount}
                  </span>
                )}
              </TransitionLink>
              {/* Admin link for admin users, Orders link for regular users — links to appropriate page */}
              <TransitionLink href={session.user.role === "admin" ? "/admin" : "/orders"} className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 hidden md:inline-flex p-2 text-sm uppercase tracking-widest">
                {session.user.role === "admin" ? "Admin" : "Orders"}
              </TransitionLink>
              {/* Sign-out button — calls authClient.signOut() then redirects to home */}
              <button
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/");
                }}
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 p-2 text-sm uppercase tracking-widest"
              >
                Sign Out
              </button>
            </>
          ) : (
            // If not authenticated, show a "Sign In" link
            <TransitionLink href="/auth" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs px-6 py-2">
              Sign In
            </TransitionLink>
          )}

          {/* Mobile hamburger menu toggle — visible only on smaller screens */}
          <button
            className="md:hidden inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="text-lg">{mobileOpen ? "✕" : "≡"}</span>
          </button>
        </div>
      </nav>

      {/* Mobile navigation menu — shown when mobileOpen is true, contains nav links */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <div className="flex flex-col gap-4 px-6 py-8">
            {navLinks.map((link) => (
              <TransitionLink
                key={link.href}
                href={link.href}
                className="text-sm uppercase tracking-widest"
              >
                {link.label}
              </TransitionLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
