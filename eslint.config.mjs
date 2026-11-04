import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  // Preserve legacy feedback preview behavior; keep the newly introduced diagnostic visible.
  { files: ["src/components/DataDiveFeedback.jsx"], rules: { "react-hooks/set-state-in-effect": "warn" } },
  globalIgnores([".next/**", ".open-next/**", ".worker-dry-run/**", "next-env.d.ts"]),
]);
