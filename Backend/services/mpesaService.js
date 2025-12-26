import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_ENV } = process.env;

const BASE_URL = MPESA_ENV === "sandbox"
  ? "https://sandbox.safaricom.co.ke"
  : "https://api.safaricom.co.ke";

/**
 * Get OAuth token from Safaricom
 */
export const getMpesaToken = async () => {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  const { data } = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return data.access_token;
};

/**
 * Initiate STK Push (Lipa na M-PESA)
 */
export const stkPush = async ({ amount, phone, accountReference, transactionDesc }) => {
  const token = await getMpesaToken();

  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

  const payload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: `${process.env.SERVER_URL}/api/pos/mpesa-callback`,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  const { data } = await axios.post(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};
