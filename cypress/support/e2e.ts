import "./commands";

// React StrictMode double-mounts in dev, causing benign "removeChild" errors.
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("removeChild")) return false;
});
