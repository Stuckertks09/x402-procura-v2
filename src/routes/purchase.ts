import { Router } from "express";
import { createX402Middleware } from "../../lib/x402-middleware";
import { negotiationStore } from "../orchestrator";
import { purchaseController } from "../controllers/purchaseController";

export const purchaseRouter = Router();

// ✅ Single route with proper middleware chain
purchaseRouter.post(
  "/purchase",
  // 1️⃣ First middleware: inject dynamic payment config
  (req, res, next) => {
    const { request_id } = req.body;
    if (!request_id) {
      return res.status(400).json({ error: "request_id required" });
    }

    const negotiation = negotiationStore.get(request_id);
    if (!negotiation) {
      return res.status(404).json({ error: "No negotiation found for request_id" });
    }

    // Dev conversion from USD → SOL → lamports
const usdToSolRate = Number(process.env.DEV_USD_TO_SOL_RATE || 0.000001);
const scale = Number(process.env.PAYMENT_SCALE_FACTOR || 1);

const solAmount = negotiation.total_cost * usdToSolRate * scale;
const lamports = Math.floor(solAmount * 1_000_000_000);

req.paymentConfig = {
  amount: String(lamports),
  payTo: negotiation.supplier_wallet,
  asset: "SOL (dev-mode)",
  network: "solana-devnet",
};

    next(); // ✅ continue to x402 middleware
  },
  // 2️⃣ Second middleware: x402 payment processing
  createX402Middleware(
    {
      amount: "dynamic",
      payTo: "dynamic",
      asset: "USDC",
      network: "solana-devnet",
    },
    {
      facilitatorUrl: process.env.FACILITATOR_URL || "http://localhost:3001"
    }
  ),
  // 3️⃣ Final handler: only runs after payment verified & settled
  purchaseController
);