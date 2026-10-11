import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Dev preview of the flows (src/app/main.tsx). `npm run dev`
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@kit': fileURLToPath(new URL('./src', import.meta.url)) } },
  assetsInclude: ['**/*.lottie'],
  server: { port: 5180 },
});
