// Mark this component as a Client Component for interactivity (theme toggle, mobile menu, cart badge, sign-out)
"use client";

// Import the useTheme hook for toggling light/dark mode
import { useTheme } from "~/lib/theme-provider";
// Import the authClient for calling signOut
import { authClient } from "~/server/better-auth/client";
// Import Link for client-side navigation between pages
import Link from "next/link";
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
import { useEffect, useState } from "react";
// Import the tRPC React client for fetching cart items to display the badge count
import { api } from "~/trpc/react";

// Nav renders the fixed top navigation bar with logo, links, theme toggle, cart badge, auth controls, and mobile hamburger menu
export function Nav({ session }: { session: Session | null }) {
  // Get the current theme and toggle function from the ThemeProvider context
  const { theme, toggle } = useTheme();
  // Initialize the router for programmatic navigation after sign-out
  const router = useRouter();
  // Get the current pathname to determine which nav link is active
  const pathname = usePathname();
  // State for the cart item count badge displayed on the cart link
  const [cartCount, setCartCount] = useState(0);
  // State to control the mobile navigation menu open/close
  const [mobileOpen, setMobileOpen] = useState(false);
  // State to track whether the page has been scrolled past a threshold (for navbar background)
  const [scrolled, setScrolled] = useState(false);

  // Query cart items via tRPC — only enabled when the user is authenticated, used to compute the cart count badge
  const { data: cartItems } = api.cart.list.useQuery(undefined, {
    enabled: !!session,
  });

  // Sync cartCount state whenever cartItems data changes — sums up quantities across all items
  useEffect(() => {
    if (cartItems) {
      setCartCount(cartItems.reduce((sum, i) => sum + i.quantity, 0));
    }
  }, [cartItems]);

  // Add a scroll event listener to set scrolled state (used to add backdrop-blur to navbar after 20px scroll)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
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
          ? "bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      {/* Inner nav container with max width and centered content */}
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">
        {/* Brand logo linking to the home page */}
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
          ZARA
        </Link>

        {/* Desktop navigation links — hidden on mobile, shown on md+ screens */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`link-underline text-sm uppercase tracking-widest ${
                pathname === link.href ? "after:scale-x-100" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right-side controls: theme toggle, cart link, auth buttons */}
        <div className="flex items-center gap-6">
          {/* Theme toggle — animated sun/moon icon that rotates between modes */}
          <button
            onClick={toggle}
            className="inline-flex items-center justify-center text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 p-2"
            aria-label="Toggle theme"
          >
            <div className="relative w-5 h-5">
              <svg
                className={`absolute inset-0 transition-all duration-500 ${
                  theme === "light" ? "opacity-100 rotate-0" : "opacity-0 rotate-90 scale-75"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <svg
                className={`absolute inset-0 transition-all duration-500 ${
                  theme === "dark" ? "opacity-100 rotate-0" : "opacity-0 -rotate-90 scale-75"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </div>
          </button>

          {/* If user is authenticated, show cart link with count badge, orders/admin link, and sign-out button */}
          {session ? (
            <>
              {/* Cart link with a numeric badge showing total item count */}
              <Link href="/cart" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 relative p-2 text-sm uppercase tracking-widest">
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 text-[10px] text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950">
                    {cartCount}
                  </span>
                )}
              </Link>
              {/* Admin link for admin users, Orders link for regular users — links to appropriate page */}
              <Link href={session.user.role === "admin" ? "/admin" : "/orders"} className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 hidden md:inline-flex p-2 text-sm uppercase tracking-widest">
                {session.user.role === "admin" ? "Admin" : "Orders"}
              </Link>
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
            <Link href="/auth" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs px-6 py-2">
              Sign In
            </Link>
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
              <Link
                key={link.href}
                href={link.href}
                className="text-sm uppercase tracking-widest"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
