// routes/setupRoutes.js
import express from 'express';
import { checkInitialSetup, performInitialSetup } from '../controllers/setupController.js';

const router = express.Router();

router.get('/status', checkInitialSetup);
router.post('/run', performInitialSetup);

export default router;
