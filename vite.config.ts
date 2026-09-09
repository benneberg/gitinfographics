import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

// Plugin to copy index.html to 404.html for GitHub Pages SPA routing support
function githubPagesSpa() {
  return {
    name: 'github-pages-spa',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.resolve(distDir, 'index.html');
      const notFoundPath = path.resolve(distDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
      }
    },
  };
}

export default defineConfig(({ command }) => {
  // Use VITE_BASE_PATH if provided (e.g. from GitHub Actions configure-pages),
  // otherwise relative './' for production builds, and '/' for dev server.
  let base = process.env.VITE_BASE_PATH;
  if (!base) {
    base = command === 'build' ? './' : '/';
  } else if (!base.endsWith('/')) {
    base = `${base}/`;
  }

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      githubPagesSpa(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
