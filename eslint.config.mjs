import next from "eslint-config-next";

/**
 * Flat config. Next 16 removed the `next lint` command, so ESLint is invoked
 * directly (`npm run lint` -> `eslint .`) and eslint-config-next is consumed
 * as a flat preset rather than through .eslintrc.
 */
const config = [
  ...next,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "generated/**",
      "public/sw.js",
      "public/_img/**",
    ],
  },
];

export default config;
