import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import idl from "./idl/agent_reputation.json";

export const PROGRAM_ID = new PublicKey(
  "5g5vVtid5C6rVfshSQMHpWy7rvWWXrowVUN78UCKkQEj"
);

export function getAgentReputationProgram(
  connection: Connection,
  keypair: Keypair
) {
  // Wrap the keypair in an Anchor wallet
  const wallet = new anchor.Wallet(keypair);

  // Create provider
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );

  // Set global provider (required by anchor.Program)
  anchor.setProvider(provider);

  // ✅ Correct: Pass IDL and provider (2 arguments)
  const program = new anchor.Program(
    idl as anchor.Idl,
    provider
  );

  return { program, provider, wallet };
}