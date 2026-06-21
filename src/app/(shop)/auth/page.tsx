// Mark this component as a Client Component so it can use hooks (useState, useRouter) and browser APIs
"use client";

// Import useState for managing form fields and UI state (login/signup mode, loading, errors)
import { useState } from "react";
// Import useRouter for navigation after successful authentication
import { useRouter } from "next/navigation";
// Import the better-auth client for calling sign-up, sign-in, and social auth methods
import { authClient } from "~/server/better-auth/client";

// AuthPage renders a login/signup form with email/password authentication and Google/GitHub OAuth buttons
export default function AuthPage() {
  // Initialize the Next.js router for redirecting users after authentication
  const router = useRouter();
  // Toggle between "login" and "signup" modes — controls form fields and button text
  const [mode, setMode] = useState<"login" | "signup">("login");
  // Controlled input for the email field
  const [email, setEmail] = useState("");
  // Controlled input for the password field
  const [password, setPassword] = useState("");
  // Controlled input for the name field (only shown in signup mode)
  const [name, setName] = useState("");
  // Error message string displayed when authentication fails
  const [error, setError] = useState("");
  // Loading state to disable the submit button and show "Processing..." text during auth
  const [loading, setLoading] = useState(false);

  // Handle form submission: for signup mode, first register, then sign in; for login mode, sign in directly
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default browser form submission behavior
    e.preventDefault();
    // Clear any previous error message before attempting authentication
    setError("");
    // Set loading to true to disable the button and show processing state
    setLoading(true);

    try {
      // In signup mode, first register the user with email, password, and name
      if (mode === "signup") {
        // Call the better-auth sign-up API with the user's credentials
        const { error: signupError } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        // If sign-up fails, display the error message and re-enable the form
        if (signupError) {
          setError(signupError.message ?? signupError.statusText ?? "Signup failed");
          setLoading(false);
          return;
        }
      }

      // After sign-up (or in login mode), attempt to sign in with email and password
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
      });

      // If sign-in fails, display the error message and re-enable the form
      if (signInError) {
        setError(signInError.message ?? signInError.statusText ?? "Sign in failed");
        setLoading(false);
        return;
      }

      // On successful authentication, redirect to the home page
      router.push("/");
      // Refresh the router to update any server-rendered content that depends on the session
      router.refresh();
    } catch {
      // Catch any unexpected exceptions and show a generic error message
      setError("Something went wrong");
      setLoading(false);
    }
  };

  // Render the auth page with form fields, OAuth buttons, and mode toggle link
  return (
    <div className="pt-32 pb-16 md:pb-24 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Header with "Welcome" label and dynamic title based on login/signup mode */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-3 text-neutral-400">
            Welcome
          </p>
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-2">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-sm text-neutral-500">
            {mode === "login"
              ? "Enter your details to sign in"
              : "Create an account to get started"}
          </p>
        </div>

        {/* Email/password form — conditionally shows name field in signup mode */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input field: only rendered in signup mode */}
          {mode === "signup" && (
            <div>
              <label className="text-xs uppercase tracking-widest text-neutral-500 mb-2 block">
                Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
              />
            </div>
          )}
          {/* Email input field — always visible, required */}
          <div>
            <label className="text-xs uppercase tracking-widest text-neutral-500 mb-2 block">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
            />
          </div>
          {/* Password input field — always visible, required */}
          <div>
            <label className="text-xs uppercase tracking-widest text-neutral-500 mb-2 block">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-200 dark:border-neutral-800 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-50 transition-colors"
            />
          </div>

          {/* Error message displayed in red when authentication fails */}
          {error && (
            <p className="text-xs text-red-500 uppercase tracking-wider">{error}</p>
          )}

          {/* Submit button — shows "Processing..." while loading, otherwise "Sign In" or "Create Account" */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 bg-neutral-950 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 w-full"
          >
            {loading
              ? "Processing..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* Divider with "Or" text separating email form from OAuth buttons */}
        <div className="relative my-8">
          <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-50 dark:bg-neutral-950 px-4 text-xs text-neutral-400 uppercase tracking-wider">
            Or
          </span>
        </div>

        {/* Social OAuth buttons: Google and GitHub — each triggers the better-auth social sign-in flow */}
        <div className="space-y-3">
          {/* Google OAuth button — opens the Google sign-in redirect URL */}
          <button
            onClick={async () => {
              const { data } = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
              });
              if (data?.url) window.location.href = data.url;
            }}
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 border border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-neutral-50 dark:border-neutral-50 dark:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-950 w-full"
          >
            Continue with Google
          </button>
          {/* GitHub OAuth button — opens the GitHub sign-in redirect URL */}
          <button
            onClick={async () => {
              const { data } = await authClient.signIn.social({
                provider: "github",
                callbackURL: "/",
              });
              if (data?.url) window.location.href = data.url;
            }}
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-300 border border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-neutral-50 dark:border-neutral-50 dark:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-950 w-full"
          >
            Continue with GitHub
          </button>
        </div>

        {/* Mode toggle link — switches between login and signup forms and clears errors */}
        <p className="text-center mt-8 text-sm text-neutral-500">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            className="underline hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
