// backend/routes/alerts.js
import { PrismaClient } from '@prisma/client';
import express from 'express';
const prisma = new PrismaClient();

const router = express.Router();

router.get('/', async (req, res) => {
  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' }});
  res.json(alerts);
});

router.post('/:id/read', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.alert.update({ where: { id }, data: { status: 'READ' }});
  res.json({ ok: true });
});

export default router;
