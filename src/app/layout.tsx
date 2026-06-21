// Import global CSS styles — applies Tailwind base styles and custom fonts across the entire app
import "~/styles/globals.css";

// Import the Next.js Metadata type to define static metadata for the root layout's <head>
import { type Metadata } from "next";
// Import Geist (sans-serif) and Playfair Display (serif) from next/font/google for the brand's typography palette
import { Geist, Playfair_Display } from "next/font/google";

// Import the tRPC React provider so all client components can make type-safe API calls
import { TRPCReactProvider } from "~/trpc/react";
// Import the ThemeProvider to support light/dark mode toggling throughout the application
import { ThemeProvider } from "~/lib/theme-provider";
// Import the Nav component — a fixed top navigation bar with links, cart badge, and auth-aware controls
import { Nav } from "~/components/nav";
// Import Stairs for page transition animations
import { Stairs } from "~/components/ui/Stairs";
// Import getSession for server-side authentication — passes the session to Nav for conditional UI
import { getSession } from "~/server/better-auth/server";

// Define Geist as the primary sans-serif font loaded from Google Fonts with latin subset and a CSS custom property
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// Define Playfair Display as the serif accent font for headings, also with latin subset and CSS custom property
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

// Export static metadata that Next.js uses to generate <title>, <meta name="description">, and <link rel="icon">
export const metadata: Metadata = {
  title: "ZARA | Fragrance",
  description: "Curated fragrances that define your presence.",
  icons: [{ rel: "icon", url: "/logo.webp" }],
};

// RootLayout is an async server component that renders the outer HTML shell, fetches the session, and wraps children in all global providers
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Fetch the current user session server-side so the Nav component can render auth-aware links
  const session = await getSession();

  return (
    // Root <html> element: sets language, applies font CSS variable classes, and suppresses hydration warnings to prevent theme flicker
    <html lang="en" className={`${geist.variable} ${playfair.variable}`} suppressHydrationWarning>
      {/* Body with min-h-screen ensures the footer stays at the bottom even on short pages */}
      <body className="min-h-screen">
        {/* TRPCReactProvider wraps the entire tree so any client component can use tRPC hooks like api.product.list.useQuery */}
        <TRPCReactProvider>
          {/* ThemeProvider manages light/dark state and applies/removes the "dark" class on <html> */}
          <ThemeProvider>
            {/* Stairs wraps Nav + main so TransitionLink inside Nav can access the context */}
            <Stairs>
              {/* Nav receives the session prop to conditionally show sign-in, cart, orders, admin, or sign-out links */}
              <Nav session={session} />
              {/* The <main> element renders the current page's children from the matched route */}
              <main>{children}</main>
            </Stairs>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
