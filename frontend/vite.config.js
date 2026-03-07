import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// PHOTOS folder at project root: C:\Users\karan\gift-mart\PHOTOS
const projectRoot = path.resolve(__dirname, '..');
const photosDir = path.join(projectRoot, 'PHOTOS');

const mime = (ext) => ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' }[ext] || 'application/octet-stream');

export default defineConfig({
  plugins: [
    react(),
    // Serve PHOTOS folder from project root at /PHOTOS/
    {
      name: 'serve-photos',
      configureServer(server) {
        server.middlewares.use('/PHOTOS', (req, res, next) => {
          const filePath = path.resolve(photosDir, req.url === '/' ? '' : req.url);
          const relative = path.relative(photosDir, filePath);
          if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(filePath)) return next();
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) return next();
          const ext = path.extname(filePath).slice(1).toLowerCase();
          res.setHeader('Content-Type', mime(ext));
          fs.createReadStream(filePath).pipe(res);
        });
      }
    }
  ],
  server: {
    port: 3000,
    fs: { allow: [projectRoot] },
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true }
    }
  }
});
