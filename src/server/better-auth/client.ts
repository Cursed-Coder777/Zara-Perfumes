// Import the browser-side auth client factory from better-auth's React bindings
import { createAuthClient } from "better-auth/react";

// Create and export the auth client singleton used in browser components to interact with the auth API
export const authClient = createAuthClient();

// Export the Session type inferred from the client for type-safe usage in React hooks and components
export type Session = typeof authClient.$Infer.Session;
