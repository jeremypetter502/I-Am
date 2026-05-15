import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        compatibility: {
          componentApi: 4
        }
      }
    })
  ],
  server: {
    port: 5178,
    // Disable HMR websockets to avoid client connection failures in this environment
    hmr: false
  }
});
