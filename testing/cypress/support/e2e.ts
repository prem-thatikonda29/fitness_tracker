import "./commands";

// React StrictMode double-mounts in dev, causing benign "removeChild" errors.
// NEXT_REDIRECT is Next.js' server action redirect — intentional, not a real failure.
// Hydration mismatches from Clerk components are cosmetic — ignore them.
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("removeChild") ||
    err.message.includes("NEXT_REDIRECT") ||
    err.message.includes("NEXT_NOT_FOUND") ||
    err.message.includes("Hydration") ||
    (err as any).digest?.includes("NEXT_REDIRECT")
  ) {
    return false;
  }
});
