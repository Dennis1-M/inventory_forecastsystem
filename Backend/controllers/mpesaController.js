// backend/controllers/mpesaController.js
// Controller to handle M-PESA payments via STK Push

import { stkPush } from "../services/mpesaService.js";

export const payWithMpesa = async (req, res) => {
  try {
    const { amount, phone, saleId } = req.body;
    if (!amount || !phone || !saleId) return res.status(400).json({ error: "Missing parameters" });

    const data = await stkPush({
      amount,
      phone,
      accountReference: `Sale-${saleId}`,
      transactionDesc: `POS payment for Sale ID ${saleId}`,
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("M-PESA Error:", err.response?.data || err.message);
    res.status(500).json({ error: "M-PESA payment failed" });
  }
};
