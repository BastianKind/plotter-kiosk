import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative paths, so the build works from any folder (e.g. GitHub Pages under /plotter-kiosk/).
  base: './',
  // Port 5174, so it can run next to the web shop prototype (5173).
  server: { port: 5174 },
});
