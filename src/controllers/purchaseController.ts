import { Request, Response } from "express";
import { negotiationStore } from "../orchestrator";
import { supplier } from "../agents/supplier";
import { pushEvent, closeStream } from "../sse";

export async function purchaseController(req: Request, res: Response) {
  const { request_id } = req.body;

  if (!request_id) {
    return res.status(400).json({ error: "request_id required" });
  }

  const negotiation = negotiationStore.get(request_id);
  if (!negotiation) {
    return res.status(404).json({ error: "No negotiation for that request_id" });
  }

  // ✅ Payment already settled by x402 middleware
  if (!req.payment) {
    return res.status(500).json({ error: "Payment verification failed" });
  }

  const signature = req.payment.transactionSignature;

  pushEvent(request_id, `✅ Paid supplier`);
  pushEvent(request_id, `🔗 https://explorer.solana.com/tx/${signature}?cluster=devnet`);

  await supplier.confirmPurchase(signature, request_id);

  pushEvent(request_id, `🎉 Order confirmed`);
  closeStream(request_id);

  return res.json({ ok: true, request_id, signature });
}
