import "dotenv/config";
import express from "express";
import { openStream, pushEvent, closeStream } from "./sse";
import { runProcurement } from "./orchestrator";
import { createX402Middleware } from "../lib/x402-middleware";
import crypto from "crypto";
import cors from "cors";
import { purchaseRouter } from "./routes/purchase";
import { agentRegistryRouter } from "./routes/agentRegistryRoutes";

const app = express();
app.use(express.json());

// CORS must be BEFORE routes and SSE
app.use(cors({
  origin: "*",                // allow all (works for local testing)
  methods: ["GET","POST", "OPTIONS"],
  allowedHeaders: "*",
  exposedHeaders: ["X-PAYMENT"],
  credentials: false,
}));


//Routes
app.use("/api", purchaseRouter);
app.use("/api/agents", agentRegistryRouter);

// SSE stream
app.get("/api/stream/:id", (req, res) => {
  openStream(req.params.id, res);
});

// Manual notify endpoint (agents push updates)
app.post("/api/notify", (req, res) => {
  const { request_id, message, done, error } = req.body || {};
  if (!request_id || !message) return res.status(400).json({ ok: false });
  pushEvent(request_id, message);
  if (done || error) closeStream(request_id);
  res.json({ ok: true });
});

app.post(
  "/api/procure",
  createX402Middleware(
    {
      // Route-level config → sent back in 402 response
      amount: "1000000",          // amount required in smallest units
      payTo: process.env.FACILITATOR_PUBLIC_KEY!, // who receives funds
      asset: "USDC",              // display only
      network: "solana-devnet",   // display only
    },
    {
      // Middleware instance config (optional)
      facilitatorUrl: process.env.FACILITATOR_URL || "http://localhost:3001",
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    }
  ),
  async (req, res) => {
    const request_id = req.body.request_id || crypto.randomUUID();

    res.json({ request_id, status: "started" });

    setImmediate(async () => {
      try {
        await runProcurement({ ...req.body, request_id });

        // ✅ VERY IMPORTANT: payment is available now
        console.log("✅ Payment Info:", req.payment);

      } catch (err: any) {
        pushEvent(request_id, `❌ Error: ${err.message}`);
      } finally {
        closeStream(request_id);
      }
    });
  }
);

app.post("/api/procuretest", async (req, res) => {
  const request_id = req.body.request_id || `test-${crypto.randomUUID()}`;

  // ✅ Push first event BEFORE we return
  pushEvent(request_id, `📡 Stream initialized for request ${request_id}`);
  pushEvent(request_id, `⚠️ TEST MODE — Payment verification disabled`);

  // ✅ Immediately return so frontend can now open the stream
  res.json({ request_id, status: "started (TEST MODE - no payment)" });

  // ✅ Continue workflow async
  setImmediate(async () => {
    try {
      await runProcurement({ ...req.body, request_id });

      console.log("⚠️ TEST MODE: No payment was verified. req.payment = undefined");

    } catch (err: any) {
      pushEvent(request_id, `❌ Error: ${err.message}`);
    } 
  });
});

// 🔥 THIS IS WHAT STARTS THE SERVER
const PORT = Number(process.env.PORT || 9000);
app.listen(PORT, () => {
  console.log(`\n🚀 Procura TS backend running at http://localhost:${PORT}`);
});
