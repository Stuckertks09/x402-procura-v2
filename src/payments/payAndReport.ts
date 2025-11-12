import { micropay } from "./x402";
import { wallets, AgentName } from "../agents/agentWallets";
import { pushEvent } from "../sse";
import { updateReputation } from "../../lib/onchain/updateReputation";

export async function payAndReport(
  request_id: string,
  from: AgentName,
  to: AgentName,
  label: string,
  amountSOL: number = 0.0005,
) {
  pushEvent(request_id, `💸 Paying ${label}…`);

  try {
    const payer = wallets[from];
    const receiver = wallets[to];

    const sig = await micropay(payer, receiver.publicKey, amountSOL);

    pushEvent(request_id, `✅ Paid ${label}`);
    pushEvent(request_id, `🔗 Tx: https://explorer.solana.com/tx/${sig}?cluster=devnet`);

    // ✅ Update reputation (skip orchestrator)
    if (to !== "orchestrator") {
      const result = await updateReputation(to, true, amountSOL);
      
      if (result.updated) {
        pushEvent(request_id, `⭐ Reputation updated for ${label}`);
      } else if (result.reason === "at_boundary") {
        pushEvent(request_id, `ℹ️ ${label} already at max reputation`);
      } else {
        pushEvent(request_id, `⚠️ Reputation update skipped: ${result.reason}`);
      }
    }

  } catch (err: any) {
    pushEvent(request_id, `⚠️ Payment Error (${label}): ${err.message}`);

    // ✅ Try to apply penalty (skip orchestrator)
    if (to !== "orchestrator") {
      const result = await updateReputation(to, false, 0);
      
      if (result.updated) {
        pushEvent(request_id, `📉 Reputation penalty applied to ${label}`);
      } else {
        // Don't spam logs - penalty failure is less critical
        console.log(`ℹ️ Reputation penalty skipped for ${label}: ${result.reason}`);
      }
    }
    
    // ✅ Don't re-throw - let workflow continue
  }
}