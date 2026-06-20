// Mark this component as a Client Component so it can use React hooks (useState, useEffect) and browser APIs
"use client";

// Import React hooks for managing state, side effects, and context-based theme propagation
import { createContext, useContext, useEffect, useState } from "react";

// Define the Theme type as a union of the two supported colour schemes
type Theme = "light" | "dark";

// Create a React context that holds the current theme and a toggle function, defaulting to light mode
const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => undefined });

// Define the ThemeProvider component that wraps the app and provides theme state to all children
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // State to hold the current theme; initialised to "light" before the client-side effect runs
  const [theme, setTheme] = useState<Theme>("light");
  // State to track whether the component has mounted on the client (prevents hydration mismatch)
  const [mounted, setMounted] = useState(false);

  // Run once after mount: read persisted preference or fall back to system preference and apply the dark class
  useEffect(() => {
    // Mark the component as mounted to avoid hydration mismatches between server and client render
    setMounted(true);
    // Attempt to read a previously saved theme from localStorage
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      // Apply the stored theme to state and toggle the "dark" class on the document root element
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      // No stored preference: read the OS-level colour scheme via matchMedia
      const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
      // Set the theme based on the system preference
      setTheme(prefers ? "dark" : "light");
      // Apply the corresponding dark class to the document root
      document.documentElement.classList.toggle("dark", prefers);
    }
  }, []);

  // Define the toggle function that switches between light and dark, persists the choice, and updates the DOM class
  const toggle = () => {
    // Compute the opposite theme
    const next = theme === "light" ? "dark" : "light";
    // Update the React state
    setTheme(next);
    // Persist the user's choice to localStorage for subsequent visits
    localStorage.setItem("theme", next);
    // Toggle the "dark" class on <html> so Tailwind's dark: variants activate or deactivate
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  // Until the component is mounted on the client, render children without the context provider to avoid hydration flicker
  if (!mounted) return <>{children}</>;

  // Once mounted, wrap children in the theme context so any descendant can read or toggle the theme
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Export a convenience hook that reads the theme context (throws if used outside ThemeProvider)
export const useTheme = () => useContext(ThemeContext);
