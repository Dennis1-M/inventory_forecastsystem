// controllers/forecastController.js
const FASTAPI_RUN = process.env.FASTAPI_URL || "http://127.0.0.1:5002";
export const runForecastForProduct = async (req, res) => {
  try {
    const { productId, horizon } = req.body;
    const base = process.env.SELF_URL || "http://localhost:3000";
    const prodResp = await fetch(`${base}/api/products/${productId}`);
    if (!prodResp.ok) return res.status(404).json({ message: "Product not found (node)" });
    const prod = await prodResp.json();
    const resp = await fetch(`${FASTAPI_RUN}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: prod.name, horizon: horizon || 14 })
    });
    const data = await resp.json();
    return res.json({ ok: resp.ok, data });
  } catch (err) {
    console.error("runForecastForProduct:", err);
    return res.status(500).json({ message: err.message });
  }
};
