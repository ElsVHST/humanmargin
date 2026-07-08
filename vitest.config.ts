import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/int/**/*.test.ts"],
    setupFiles: ["tests/int/setup.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    // Eén Payload-instantie + schema-push verdraagt geen parallelle testfiles
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@payload-config": path.resolve(dirname, "src/payload.config.ts"),
      "@": path.resolve(dirname, "src"),
    },
  },
});
