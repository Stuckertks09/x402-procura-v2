// src/agents/agentRegistry.controller.ts
import { PublicKey, Connection } from "@solana/web3.js";
import { wallets } from "../agents/agentWallets";
import { 
  getAgentReputationProgram,
  PROGRAM_ID 
} from "../../lib/onchain/agentReputationClient";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export async function listAgents() {
  // Use orchestrator as the signer (doesn't matter for read-only)
  const { program } = getAgentReputationProgram(connection, wallets.orchestrator);

  const results = [];

  for (const [name, kp] of Object.entries(wallets)) {
    if (name === "orchestrator") continue;

    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("reputation"), kp.publicKey.toBuffer()],
      PROGRAM_ID
    );

    try {
      // @ts-ignore
      const rep = await program.account.agentReputation.fetch(pda);

      results.push({
        agent: name,
        pubkey: kp.publicKey.toBase58(),
        jobs_completed: Number(rep.jobsCompleted),
        jobs_failed: Number(rep.jobsFailed),
        trust_score: rep.trustScore,
        total_earned_sol: Number(rep.totalEarned) / 1e9,
        explorer: `https://explorer.solana.com/address/${pda.toBase58()}?cluster=devnet`,
      });
    } catch (err) {
      console.error(`Failed to fetch reputation for ${name}:`, err);
    }
  }

  return results;
}