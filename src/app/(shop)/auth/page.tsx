"use client";

import { authClient } from "~/server/better-auth/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePageTitle } from "~/lib/use-page-title";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  usePageTitle(isRegister ? "Create Account" : "Sign In");

  const session = authClient.useSession();

  useEffect(() => {
    if (session.data) router.push("/");
  }, [session.data, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isRegister) {
      const { error: err } = await authClient.signUp.email({ email, password, name });
      if (err) setError(err.message ?? err.statusText);
      else router.push("/");
    } else {
      const { error: err } = await authClient.signIn.email({ email, password });
      if (err) setError(err.message ?? err.statusText);
    }
  };

  const handleGoogle = async () => {
    await authClient.signIn.social({ provider: "google", callbackURL: "/" });
  };

  const handleGithub = async () => {
    await authClient.signIn.social({ provider: "github", callbackURL: "/" });
  };

  if (session.isPending)
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (session.data) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center font-serif text-3xl text-white">
          {isRegister ? "Create Account" : "Sign In"}
        </h1>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        <div className="space-y-3">
          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-700 px-4 py-3 text-white transition-colors hover:bg-neutral-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleGithub}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-700 px-4 py-3 text-white transition-colors hover:bg-neutral-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.1.82-.26.82-.58 0-.29-.01-1.24-.02-2.26-3.34.72-4.04-1.44-4.04-1.44-.55-1.42-1.36-1.8-1.36-1.8-1.1-.76.09-.74.09-.74 1.22.08 1.86 1.25 1.86 1.25 1.08 1.86 2.84 1.32 3.54 1.01.1-.8.42-1.33.76-1.63-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.02-.32 3.33 1.24a11.5 11.5 0 0 1 3.04-.41c1.03.01 2.07.14 3.04.41 2.3-1.56 3.32-1.24 3.32-1.24.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.82 5.63-5.5 5.92.43.37.82 1.1.82 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.69.83.57C20.57 21.79 24 17.3 24 12 24 5.37 18.63 0 12 0z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-950 px-2 text-neutral-500">Or</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 outline-none focus:border-white"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 outline-none focus:border-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white placeholder-neutral-500 outline-none focus:border-white"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-3 font-medium text-neutral-950 transition-colors hover:bg-neutral-200"
          >
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-400">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsRegister(!isRegister)} className="text-white underline">
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
