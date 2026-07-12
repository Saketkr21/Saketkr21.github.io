// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // For a User site (Saketkr21.github.io), site is the root of the domain.
  // If you switch to a Project site (repo != user.github.io), set base to '/repo-name/'.
  site: 'https://saketkr21.github.io',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});
