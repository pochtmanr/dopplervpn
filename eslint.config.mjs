import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // `next lint` scoped itself to the app source. The ESLint CLI does not, so
    // the ignores have to be explicit — without them `eslint .` also walks the
    // build output and the Deno edge functions, which use a different global
    // environment and report thousands of irrelevant errors.
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "public/**",
      "next-env.d.ts",
      // Supabase Edge Functions run on Deno, not Node — they resolve their
      // imports at deploy time and are linted by the Supabase CLI instead.
      "supabase/functions/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
