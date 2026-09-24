import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 20_000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/generated/**", "src/cli/index.ts"],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
      reporter: ["text-summary", "lcov"],
    },
  },
});
