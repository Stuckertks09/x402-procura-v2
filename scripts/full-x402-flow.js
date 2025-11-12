// run: node scripts/full-x402-flow.js

import nacl from "tweetnacl";
import bs58 from "bs58";
import fetch from "node-fetch";
import { EventSource } from "eventsource";
import "dotenv/config";

// Env
const PROCURE_URL = process.env.PROCURE_URL || "http://localhost:9000/api/procure";
const PURCHASE_URL = process.env.PURCHASE_URL || "http://localhost:9000/api/purchase";
const FACILITATOR_PUBLIC_KEY = process.env.FACILITATOR_PUBLIC_KEY;
const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY;

if (!FACILITATOR_PUBLIC_KEY) throw new Error("❌ Missing FACILITATOR_PUBLIC_KEY in .env");
if (!CLIENT_SECRET_KEY) throw new Error("❌ Missing CLIENT_SECRET_KEY in .env");

// Load keypair
const secretKeyBytes = Uint8Array.from(JSON.parse(CLIENT_SECRET_KEY));
const keypair = nacl.sign.keyPair.fromSecretKey(secretKeyBytes);
const clientPublicKey = bs58.encode(keypair.publicKey);

console.log("👤 Client Public Key:", clientPublicKey);

// Helper
function signPayload(payload) {
  const structured = {
    domain: {
      name: "x402-solana-protocol",
      version: "1",
      chainId: "devnet",
      verifyingContract: "x402-sol",
    },
    types: {
      AuthorizationPayload: [
        { name: "amount", type: "string" },
        { name: "recipient", type: "string" },
        { name: "resourceId", type: "string" },
        { name: "resourceUrl", type: "string" },
        { name: "nonce", type: "string" },
        { name: "timestamp", type: "uint64" },
        { name: "expiry", type: "uint64" },
      ],
    },
    primaryType: "AuthorizationPayload",
    message: payload,
  };

  const bytes = Buffer.from(JSON.stringify(structured));
  const sigBytes = nacl.sign.detached(bytes, keypair.secretKey);
  return bs58.encode(sigBytes);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {

  const request_id = "req-" + Date.now();
  console.log(`\n🚀 Request ID: ${request_id}`);

  // Open stream (required)
  const es = new EventSource(`http://localhost:9000/api/stream/${request_id}`);
  es.onmessage = (e) => console.log("🔊 STREAM:", e.data);

  // JOB
  const job = { request_id, use_case: "video-editing", quantity: 5, budget: 2500 };

  // ---------------------------------------------------------
  // STEP 1 — First call → expect 402 → Pay request fee
  // ---------------------------------------------------------
  console.log("\n➡️ Requesting procurement...");
  const first = await fetch(PROCURE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });

  const firstRes = await first.json();
  console.log("💰 Offer:", firstRes.accepts?.[0]);

  const offer1 = firstRes.accepts[0];

  const payload1 = {
    amount: offer1.maxAmountRequired,
    recipient: offer1.payTo,
    resourceId: offer1.resource,
    resourceUrl: offer1.resource,
    nonce: `procure-${Date.now()}`,
    timestamp: Date.now(),
    expiry: Date.now() + 1000 * 60 * 15,
  };

  const signature1 = signPayload(payload1);

  const paymentRequest1 = {
    payload: payload1,
    signature: signature1,
    clientPublicKey,
  };

  console.log("\n🔐 Sending first X-PAYMENT...");
  const second = await fetch(PROCURE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PAYMENT": JSON.stringify(paymentRequest1),
    },
    body: JSON.stringify(job),
  });

  console.log("✅ Procure Response:", await second.json());

  // ---------------------------------------------------------
  // STEP 2 — Wait for negotiation to finish
  // ---------------------------------------------------------
  console.log("\n⏳ Waiting for negotiation...");
  await sleep(8000); // adjust if needed

  // ---------------------------------------------------------
  // STEP 3 — Purchase call → expect 402 → pay supplier
  // ---------------------------------------------------------
  console.log("\n💳 Initiating purchase...");
  const p1 = await fetch(PURCHASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request_id }),
  });

  const p1Res = await p1.json();
  console.log("💰 Purchase Offer:", p1Res.accepts?.[0]);

  const offer2 = p1Res.accepts[0];

  const payload2 = {
    amount: offer2.maxAmountRequired, // this is dynamic: supplier total cost
    recipient: offer2.payTo,
    resourceId: offer2.resource,
    resourceUrl: offer2.resource,
    nonce: `purchase-${Date.now()}`,
    timestamp: Date.now(),
    expiry: Date.now() + 1000 * 60 * 15,
  };

  const signature2 = signPayload(payload2);

  const paymentRequest2 = {
    payload: payload2,
    signature: signature2,
    clientPublicKey,
  };

  // ---------------------------------------------------------
  // STEP 4 — Final supplier payment
  // ---------------------------------------------------------
  console.log("\n🔐 Sending X-PAYMENT to complete purchase...");
  const p2 = await fetch(PURCHASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PAYMENT": JSON.stringify(paymentRequest2),
    },
    body: JSON.stringify({ request_id }),
  });

  console.log("\n🎉 Final Result:", await p2.json());
})();
