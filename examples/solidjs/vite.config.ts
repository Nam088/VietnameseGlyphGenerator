import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import path from 'path';

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      vgg: path.resolve(__dirname, '../../src/index.ts')
    }
  }
});
