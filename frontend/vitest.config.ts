import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    // The dashboard renders the complete catalogue (58 technical routes,
    // including the shared DUA entry). Allow that
    // legitimate UI pass to finish when the full suite shares local CPU.
    testTimeout: 20_000,
  },
});
