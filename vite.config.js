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
        // Enable SharedArrayBuffer for FFmpeg.wasm video compression
        // Using 'credentialless' instead of 'require-corp' to allow CDN resources
        headers: {
            'Cross-Origin-Embedder-Policy': 'credentialless',
            'Cross-Origin-Opener-Policy': 'same-origin',
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/storage': {
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
    optimizeDeps: {
        exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
});
