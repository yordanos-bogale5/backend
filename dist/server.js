"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const hostawayService_1 = require("./services/hostawayService");
const googlePlacesService_1 = require("./services/googlePlacesService");
const reviewService_1 = require("./services/reviewService");
const approvalPersistence_1 = require("./services/approvalPersistence");
const reviewController_1 = require("./controllers/reviewController");
const reviewRoutes_1 = require("./routes/reviewRoutes");
// Load environment variables
dotenv_1.default.config();
// Validate required environment variables
const requiredEnvVars = ['HOSTAWAY_API_KEY', 'HOSTAWAY_ACCOUNT_ID'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}
// Initialize services
const approvalPersistence = new approvalPersistence_1.ApprovalPersistenceService();
const hostawayService = new hostawayService_1.HostawayService(process.env.HOSTAWAY_API_KEY, process.env.HOSTAWAY_ACCOUNT_ID, process.env.HOSTAWAY_API_BASE_URL || 'https://api.hostaway.com/v1');
const googlePlacesService = new googlePlacesService_1.GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY || 'your_google_api_key_here');
const reviewService = new reviewService_1.ReviewService(approvalPersistence);
// Initialize controller
const reviewController = new reviewController_1.ReviewController(hostawayService, googlePlacesService, reviewService);
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});
// API routes
app.use('/api/reviews', (0, reviewRoutes_1.createReviewRoutes)(reviewController));
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});
// Error handler
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=server.js.map