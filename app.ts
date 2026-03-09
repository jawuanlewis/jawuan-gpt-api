import express, { Express, Request, Response, NextFunction } from 'express';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app: Express = express();

app.set('trust proxy', 1);

// CORS config based on environment
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CUSTOM_URL,
  process.env.PREVIEW_URL,
  process.env.PROD_URL,
].filter(Boolean) as string[];

/************************
 * App Middleware Setup *
 ************************/

app.use(compression());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: '(Server) Something went wrong!',
  });
});

// API Endpoints
app.use('/api/chat', chatRoutes);

/*******************
 * Run Application *
 *******************/

connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// App shutdown
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});
