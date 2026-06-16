import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    // Clerk's first paint + client-side hydration can be slow on cold dev.
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 60000,
    video: false,
    screenshotOnRunFailure: true,
    retries: { runMode: 2, openMode: 0 },
    setupNodeEvents(on, _config) {
      on("task", {
        log(message: string) {
          // eslint-disable-next-line no-console
          console.log(message);
          return null;
        },
      });
    },
  },
});
