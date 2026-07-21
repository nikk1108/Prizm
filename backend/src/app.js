import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'mongo-sanitize';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environmental variables
dotenv.config();

// Initialize error handler and routers
import errorHandler from './middleware/error.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import fieldRoutes from './routes/fields.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import bookmarkRoutes from './routes/bookmarks.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import searchRoutes from './routes/search.js';
import aiRoutes from './routes/ai.js';
import roadmapRoutes from './routes/roadmaps.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// Path helper for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Logging Request Metadata (Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 2. Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use((req, res, next) => {
  req.body = mongoSanitize(req.body);
  req.query = mongoSanitize(req.query);
  req.params = mongoSanitize(req.params);
  next();
});

// 3. CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// 4. Performance Middlewares
app.use(compression());

// 5. Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static assets if necessary
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 6. Base Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/upload', uploadRoutes);

// Base status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Prizm API is running and healthy',
    timestamp: new Date()
  });
});

// Fallback route handling
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Cannot find route ${req.originalUrl} on this server`
  });
});

// 7. Central Error Handling Middleware
app.use(errorHandler);

export default app;
