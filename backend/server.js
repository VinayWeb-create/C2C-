import express from 'express';
import dotenv from 'dotenv';
import dns from 'node:dns';

// Force DNS resolution to use Google's DNS servers for SRV record consistency
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes   from './routes/adminRoutes.js';
import aiRoutes      from './routes/aiRoutes.js';
import reviewRoutes   from './routes/reviewRoutes.js';
import projectRoutes  from './routes/projectRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

connectDB();

const app = express();

// Trust proxy for Render/Vercel (important for Rate Limiting)
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://c2-c-sable.vercel.app',
    'https://c2-5ltonl5v1-vinay-avalas-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter);

app.use('/api/auth',     authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/ai',       aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('C2C — Campus to Corporate API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
