import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Dev preview of the flows (src/app/main.tsx). `npm run dev`
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@kit': fileURLToPath(new URL('./src', import.meta.url)) } },
  assetsInclude: ['**/*.lottie'],
  server: { port: 5180 },
  // ship images as files, not base64 inside the JS bundle: the bundle stays small to parse and each screen
  // only downloads the images it shows
  build: { assetsInlineLimit: 0 },
});
