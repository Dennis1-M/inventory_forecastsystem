// controllers/alertJob.js
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
const prisma = new PrismaClient();

export async function runExpiryAndAgingChecks() {
  const DAYS_TO_EXPIRY_ALERT = 30;
  const AGE_DAYS = 180;
  const now = new Date();
  const expiryCutoff = new Date(); expiryCutoff.setDate(now.getDate() + DAYS_TO_EXPIRY_ALERT);

  // If your Product model does not have expiryDate field, skip expiry check gracefully
  try {
    const expiring = await prisma.product.findMany({
      where: { expiryDate: { lte: expiryCutoff, gt: now } },
    }).catch(() => []);
    for (const p of expiring) {
      await prisma.alert.create({ data: { alertType: "EXPIRY", message: `Product ${p.name} expires on ${p.expiryDate}`, productId: p.id }});
    }
  } catch (err) {
    // ignore if model lacks expiryDate
  }

  // Aging inventory
  try {
    const threshold = new Date(); threshold.setDate(now.getDate() - AGE_DAYS);
    const aging = await prisma.inventory.findMany({
      where: { createdAt: { lt: threshold }, quantity: { gt: 0 } },
      include: { product: true }
    });
    for (const i of aging) {
      await prisma.alert.create({ data: { alertType: "FORECAST", message: `Aging stock for ${i.product.name} (inventory id ${i.id})`, productId: i.productId }});
    }
  } catch (err) {
    console.error("alertJob aging error:", err);
  }

  // Optional email notify - only if SMTP env set
  if (process.env.SMTP_HOST) {
    try {
      const admins = await prisma.user.findMany({ where: { role: "ADMIN", email: { not: null } }});
      const emails = admins.map(a => a.email).filter(Boolean);
      if (emails.length) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
        // send basic summary
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: emails.join(","),
          subject: "Inventory Alerts: daily summary",
          text: `Expiry/aging check ran.`
        });
      }
    } catch (err) { console.error("alertJob email error:", err); }
  }
}
