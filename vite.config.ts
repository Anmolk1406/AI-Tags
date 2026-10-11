import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { studioBridge, studioScopedName } from './scripts/studio-bridge';

const root = fileURLToPath(new URL('.', import.meta.url));

// Playground app (the demo studio). `npm run dev`
export default defineConfig(({ command }) => ({
  // Tailwind only compiles src/app/lui.css (the studio chrome); flow screens never use it.
  // studioBridge powers the studio's Edit mode (dev only, see scripts/studio-bridge.ts).
  plugins: [react(), tailwindcss(), studioBridge()],
  resolve: { alias: { '@kit': fileURLToPath(new URL('./src', import.meta.url)) } },
  // In dev, CSS-module classes read `<local>_<file id>` so Edit mode can map an element back to its rule.
  css: command === 'serve' ? { modules: { generateScopedName: studioScopedName(root) } } : undefined,
  assetsInclude: ['**/*.lottie'],
  server: { port: 5180 },
}));
