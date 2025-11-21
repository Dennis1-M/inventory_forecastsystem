import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// Custom Middleware
import { errorHandler, notFound } from './middleware/admin.js';

// Routes
import apiRoutes from './routes/apiRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();

// ------------------------------
// CORS
// ------------------------------
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// ------------------------------
// Body Parsers
// ------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------
// Root
// ------------------------------
app.get('/', (req, res) => {
    res.send('API is running...');
});

// ------------------------------
// Routes
// ------------------------------
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// ------------------------------
// Error Handling Middleware
// ------------------------------
app.use(notFound);
app.use(errorHandler);

export default app;
