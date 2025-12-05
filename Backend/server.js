import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import './jobs/alertCron.js';
import './jobs/inventoryCron.js';

import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Routes
import apiRoutes from './routes/apiRoutes.js'; // products, sales, inventory, etc.
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const app = express();

// ------------------------------
// CORS
// ------------------------------
const allowedOrigins = ['http://localhost:5000', 'http://127.0.0.1:5000'];

app.use(cors({ origin: allowedOrigins, credentials: true }));

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
app.use('/api/auth', authRoutes); // login, register, me
app.use('/api/users', userRoutes); // admin-only user CRUD
app.use('/api', apiRoutes); // other endpoints: products, sales, inventory

// ------------------------------
// Error Handling Middleware
// ------------------------------
app.use(notFound);
app.use(errorHandler);

export default app;
