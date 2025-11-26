import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function runExpiryAndAgingChecks() {
  const DAYS_TO_EXPIRY_ALERT = 30;
  const AGE_DAYS = 180;

  const now = new Date();
  const expiryCutoff = new Date();
  expiryCutoff.setDate(now.getDate() + DAYS_TO_EXPIRY_ALERT);

  /* -----------------------------------------
       EXPIRY CHECK (SAFE IF FIELD DOESN'T EXIST)
  ------------------------------------------ */
  try {
    const expiring = await prisma.product.findMany({
      where: { expiryDate: { lte: expiryCutoff, gt: now } }
    }).catch(() => []);

    for (const p of expiring) {
      await prisma.alert.create({
        data: {
          alertType: "EXPIRY",
          message: `Product ${p.name} expires on ${p.expiryDate}`,
          productId: p.id
        }
      });
    }
  } catch (err) {
    console.warn("Skipping Expiry Check — no expiryDate field.");
  }

  /* -----------------------------------------
       AGING INVENTORY CHECK
  ------------------------------------------ */
  try {
    const threshold = new Date();
    threshold.setDate(now.getDate() - AGE_DAYS);

    const aging = await prisma.inventory.findMany({
      where: { createdAt: { lt: threshold }, quantity: { gt: 0 } },
      include: { product: true }
    });

    for (const i of aging) {
      await prisma.alert.create({
        data: {
          alertType: "FORECAST",
          message: `Aging stock for ${i.product.name} (inventory ID ${i.id})`,
          productId: i.productId
        }
      });
    }
  } catch (err) {
    console.error("Error during aging inventory check:", err);
  }

  /* -----------------------------------------
       OPTIONAL EMAIL NOTIFICATION
  ------------------------------------------ */
  if (process.env.SMTP_HOST) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", email: { not: null } }
      });

      const emails = admins.map(a => a.email).filter(Boolean);

      if (emails.length) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: emails.join(","),
          subject: "Daily Inventory Alerts Summary",
          text: `Expiry/Aging check completed successfully.`
        });
      }
    } catch (err) {
      console.error("Email error:", err);
    }
  }
}
