import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import http from 'http';
import { validateEnvironment } from './config/env';
import { helmetConfig, corsConfig, rateLimiter, sanitizeInput } from './middleware/securityMiddleware';
import { monitorMiddleware } from './middleware/monitorMiddleware';


// Verify required env variables at startup
validateEnvironment();


import authRouter from './routes/authRoutes';
import projectRouter from './routes/projectRoutes';
import taskRouter from './routes/taskRoutes';
import chatRouter from './routes/chatRoutes';
import notificationRouter from './routes/notificationRoutes';
import fileRouter from './routes/fileRoutes';
import folderRouter from './routes/folderRoutes';
import meetingRouter from './routes/meetingRoutes';
import aiRouter from './routes/aiRoutes';
import analyticsRouter from './routes/analyticsRoutes';
import reportRouter from './routes/reportRoutes';
import adminRouter from './routes/adminRoutes';
import settingsRouter from './routes/settingsRoutes';



import { globalErrorHandler, notFoundHandler } from './middleware/errorMiddleware';
import { initSocketServer } from './socket/socketServer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmetConfig);
app.use(corsConfig);
app.use('/api', rateLimiter);
app.use(sanitizeInput);
app.use(monitorMiddleware);



if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Unified Collaboration Platform API - Module 4 Real-time Communication System'
  });
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/files', fileRouter);
app.use('/api/folders', folderRouter);
app.use('/api/meetings', meetingRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/reports', reportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', settingsRouter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(notFoundHandler);
app.use(globalErrorHandler);

const server = http.createServer(app);
initSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
