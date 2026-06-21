/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// Import env validation module — runs on module load to fail fast if required variables are missing
import "./src/env.js";

/** @type {import("next").NextConfig} */
// Empty config object — all Next.js defaults are sufficient for the current build requirements
const config = {};

// Export the config as the default so Next.js picks it up automatically
export default config;
