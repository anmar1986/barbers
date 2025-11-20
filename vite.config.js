import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'public/build',
        manifest: true,
        rollupOptions: {
            input: {
                app: './resources/js/app.jsx',
            },
        },
    },
    server: {
        host: 'localhost',
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
});
