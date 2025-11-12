/**
 * x402 Solana Facilitator Application
 * To run: nvm use 20 | npx tsx facilitator/index.ts
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";


import { getFacilitatorContext } from "../lib/get-facilitator-context.ts";

import {
  healthCheckRoute,
  verifyPaymentRoute,
  settlePaymentRoute,
  getNonceRoute,
  getStatsRoute,
  cleanupNoncesRoute
} from "../routes/index.js";

import { REQUEST_BODY_LIMIT, CLEANUP_INTERVAL_MS } from "../lib/constants.ts";

async function bootstrap() {
  const context = await getFacilitatorContext();
  const app = express();

  // Middlewarers
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use((req, _res, next) => {
    context.log.info(`${req.method} ${req.path}`);
    next();
  });

  // --- ROUTES ---

  app.get("/health", healthCheckRoute({
    facilitatorAddress: context.facilitatorAddress,
    rpcEndpoint: context.config.solanaRpcUrl,
  }));

  app.post("/verify", verifyPaymentRoute({
  solanaUtils: context.solanaUtils,
  nonceDb: context.nonceDb,
  facilitatorAddress: context.facilitatorAddress,
  maxPaymentAmount: context.config.maxPaymentAmount,
  allowedClients: context.allowedClients,        // ✅ add this
}));

  app.post("/settle", settlePaymentRoute({
    solanaUtils: context.solanaUtils,
    nonceDb: context.nonceDb,
    facilitatorAddress: context.facilitatorAddress,
    facilitatorKeypair: context.facilitatorKeypair,
    simulateTransactions: context.config.simulateTransactions,
    config: {
      facilitatorPrivateKey: context.config.facilitatorPrivateKey,
    },
  }));

  app.get("/nonce/:nonce", getNonceRoute({
    nonceDb: context.nonceDb,
  }));

  app.get("/stats", getStatsRoute({
    nonceDb: context.nonceDb,
  }));

  app.delete("/cleanup-nonces", cleanupNoncesRoute({
    nonceDb: context.nonceDb,
  }));

  // --- Lifecycle ---
  await context.nonceDb.initialize();

  setInterval(async () => {
    try { await context.nonceDb.cleanupExpiredNonces(); }
    catch (err) { context.log.error("Cleanup error:", err); }
  }, CLEANUP_INTERVAL_MS);

  app.listen(context.config.port, () => {
    context.log.info(`🚀 x402 Facilitator running on port ${context.config.port}`);
    context.log.info(`🔑 Facilitator Address: ${context.facilitatorAddress.toString()}`);
    context.log.info(`🌐 RPC: ${context.config.solanaRpcUrl}`);
    context.log.info(`🧪 Simulated mode: ${context.config.simulateTransactions}`);
  });
}

bootstrap().catch(err => {
  console.error("Failed to start facilitator:", err);
  process.exit(1);
});
