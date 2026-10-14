import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import interactionRoutes from './routes/interactionRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

import path from 'path';

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'YoPharma Backend is running.', timestamp: Date.now() });
});
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'YoPharma Backend is running.', timestamp: Date.now() });
});

// Direct APK download routes with official Android package MIME type
app.get('/yopharma.apk', (req: Request, res: Response) => {
  const apkPath = path.resolve(__dirname, '../../YoPharma.apk');
  res.download(apkPath, 'YoPharma.apk');
});
app.get('/api/download-apk', (req: Request, res: Response) => {
  const apkPath = path.resolve(__dirname, '../../YoPharma.apk');
  res.download(apkPath, 'YoPharma.apk');
});

// Routes (mounted on both /api and / for seamless Vercel / local compatibility)
app.use('/api', interactionRoutes);
app.use('/', interactionRoutes);

// Start server for local or standard container hosting (Render, Railway, Docker)
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

// Export for Vercel Serverless
export default app;
