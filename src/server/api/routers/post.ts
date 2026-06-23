// Import Zod for runtime validation of the hello procedure's text input
import { z } from "zod";

// Import tRPC utilities: router factory and both public/protected procedure builders
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

// Create and export the legacy boilerplate tRPC router (from the create-t3-app scaffold)
export const postRouter = createTRPCRouter({
  // Public procedure: returns a greeting string based on the provided name
  hello: publicProcedure
    // Accept a "text" string from the caller
    .input(z.object({ text: z.string() }))
    // Synchronous handler constructs and returns the greeting object
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Protected procedure: returns a secret message only visible to authenticated users
  getSecretMessage: protectedProcedure.query(() => {
    // Static string returned as a simple auth gate — demonstrates protectedProcedure works
    return "you can now see this secret message!";
  }),
});
