import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const projectRoot = path.resolve(__dirname, '..');
const publicPhotosDir = path.join(__dirname, 'public', 'photos');
const mime = (ext) => ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' }[ext] || 'application/octet-stream');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-photos-with-spaces',
      configureServer(server) {
        server.middlewares.use('/photos', (req, res, next) => {
          const originalUrl = req.originalUrl ?? req.url;
          try {
            const raw = (req.url === '/' || req.url === '') ? '' : req.url.replace(/^\//, '').split('?')[0];
            const subPath = decodeURIComponent(raw);
            const filePath = path.resolve(publicPhotosDir, subPath);
            const relative = path.relative(publicPhotosDir, filePath);
            if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(filePath)) {
              req.url = originalUrl;
              return next();
            }
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
              req.url = originalUrl;
              return next();
            }
            res.setHeader('Content-Type', mime(path.extname(filePath).slice(1).toLowerCase()));
            fs.createReadStream(filePath).pipe(res);
          } catch (_) {
            req.url = originalUrl;
            next();
          }
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
