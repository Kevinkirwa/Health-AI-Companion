import express from 'express';
import path from 'path';

export function serveStatic(app: express.Application): void {
  const staticPath = path.join(__dirname, '../dist');
  app.use(express.static(staticPath));
  
  // Serve index.html for all routes in production
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} 