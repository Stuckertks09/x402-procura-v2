import {
  Connection,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import {
  getAgentReputationProgram,
  PROGRAM_ID,
} from "../../lib/onchain/agentReputationClient";
import { wallets, AgentName } from "../../src/agents/agentWallets";

const RPC = "https://api.devnet.solana.com";
const connection = new Connection(RPC, "confirmed");

export async function updateReputation(
  agentName: AgentName,
  success: boolean,
  amountSOL: number
): Promise<{ updated: boolean; reason?: string }> {
  const agentWallet = wallets[agentName];
  if (!agentWallet) {
    return { updated: false, reason: "Unknown agent" };
  }

  const amountLamports = Math.floor(amountSOL * 1_000_000_000);

  const orchestratorKP = wallets.orchestrator;
  const { program } = getAgentReputationProgram(connection, orchestratorKP);

  const [repPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("reputation"), agentWallet.publicKey.toBuffer()],
    PROGRAM_ID
  );

  try {
    await program.methods
      .updateReputation(
        success,
        new anchor.BN(amountLamports)
      )
      .accounts({
        reputation: repPDA,
        agent: agentWallet.publicKey,
        authority: orchestratorKP.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([orchestratorKP])
      .rpc();

    return { updated: true };
  } catch (err: any) {
    const errMsg = err.message || String(err);
    
    // ✅ Gracefully handle constraint violations (max/min reputation)
    if (
      errMsg.includes("constraint") ||
      errMsg.includes("already at max") ||
      errMsg.includes("already at min")
    ) {
      console.log(`ℹ️ Reputation update skipped for ${agentName}: at boundary`);
      return { updated: false, reason: "at_boundary" };
    }

    // ✅ Log but don't throw for other errors
    console.error(`⚠️ Reputation update failed for ${agentName}:`, errMsg);
    return { updated: false, reason: errMsg };
  }
}

////NEED TO UPDATE REPUTATION TO MAX OUT IN PROGRAM OR WRITE AN IF STATEMENT THAT BYPASSES IT IF ITS 100. SEE CLAUDE AI