import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

const normalizeBase = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const withTrailing = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  return withTrailing === '//' ? '/' : withTrailing;
};

const homepagePath = (() => {
  if (!pkg.homepage) {
    return undefined;
  }

  try {
    const url = new URL(pkg.homepage);
    return url.pathname;
  } catch {
    return pkg.homepage;
  }
})();

const envBase = normalizeBase(process.env.VITE_GH_PAGES_BASE);
const homepageBase = normalizeBase(homepagePath);
const base = envBase ?? homepageBase ?? '/';
const rootBase = base === '/' ? '/' : base;

const startUrl = `${rootBase}#/app/dashboard`;

export default defineConfig({
  base: rootBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'maskable-icon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Sou Finanças',
        short_name: 'Finanças',
        description: 'Controle suas finanças pessoais com segurança offline.',
        theme_color: '#0d47a1',
        background_color: '#ffffff',
        display: 'standalone',
        scope: rootBase,
        start_url: startUrl,
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
        navigateFallback: `${rootBase}index.html`,
      },
    }),
  ],
});
