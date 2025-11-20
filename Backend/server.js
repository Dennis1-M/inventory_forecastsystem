import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// Import Custom Modules
import { errorHandler, notFound } from './middleware/admin.js';
import apiRoutes from './routes/apiRoutes.js';
// Note: We don't need to import the database connection here 
// because Mongoose handles it internally when the application starts, 
// typically in index.js, but for simplicity in this structure, 
// we assume a separate file handles the connection (or we'll add it to index.js next).

// Load environment variables from .env file
dotenv.config();

const app = express();

// =============================================================
// Middleware Configuration
// =============================================================

// 1. CORS Setup
// Allows requests from different origins (important for the frontend app)
// You might want to restrict this in production to your specific frontend URL
const allowedOrigins = [
    'http://localhost:3000', // Example: Frontend React app running locally
    'http://127.0.0.1:3000',
    // Add production frontend URLs here later
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));


// 2. Body Parser Middleware
// Allows the server to accept JSON data in the body of requests
app.use(express.json());


// 3. Form Data Middleware
// Allows the server to accept URL-encoded data
app.use(express.urlencoded({ extended: true }));


// =============================================================
// 4. API Routes
// =============================================================

// Root route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// All API routes are mounted under the /api path
app.use('/api', apiRoutes);


// =============================================================
// 5. Error Handling Middleware (MUST be placed last)
// =============================================================

// Handles requests to undefined routes (404 Not Found)
app.use(notFound);

// Centralized error handler for all application errors
app.use(errorHandler);


export default app;