import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HostawayService } from './services/hostawayService';
import { GooglePlacesService } from './services/googlePlacesService';
import { ReviewService } from './services/reviewService';
import { ApprovalPersistenceService } from './services/approvalPersistence';
import { ReviewController } from './controllers/reviewController';
import { createReviewRoutes } from './routes/reviewRoutes';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['HOSTAWAY_API_KEY', 'HOSTAWAY_ACCOUNT_ID'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize services
const approvalPersistence = new ApprovalPersistenceService();

const hostawayService = new HostawayService(
  process.env.HOSTAWAY_API_KEY!,
  process.env.HOSTAWAY_ACCOUNT_ID!,
  process.env.HOSTAWAY_API_BASE_URL || 'https://api.hostaway.com/v1'
);

const googlePlacesService = new GooglePlacesService(
  process.env.GOOGLE_PLACES_API_KEY || 'your_google_api_key_here'
);

const reviewService = new ReviewService(approvalPersistence);

// Initialize controller
const reviewController = new ReviewController(
  hostawayService,
  googlePlacesService,
  reviewService
);

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/reviews', createReviewRoutes(reviewController));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// Start server (only in non-Vercel environments)
// Vercel will use the serverless functions in /api directory
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Flex Living Reviews Dashboard API                       ║
║                                                            ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                  ║
║                                                            ║
║   API Endpoints:                                           ║
║   - GET  /health                                           ║
║   - GET  /api/reviews/hostaway                             ║
║   - POST /api/reviews/google                               ║
║   - GET  /api/reviews                                      ║
║   - GET  /api/reviews/approved                             ║
║   - GET  /api/reviews/stats                                ║
║   - PUT  /api/reviews/:id/approve                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
  });
}

export default app;

