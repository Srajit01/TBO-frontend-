import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // This will map `@` to the `src` folder
      '@/components': '/src/components', // To access components easily
      '@/hooks': '/src/hooks', // To access hooks easily
    },
  },
});
