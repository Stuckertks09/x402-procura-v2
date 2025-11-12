import { Keypair, PublicKey } from "@solana/web3.js";

function kp(envVar: string): Keypair {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env[envVar]!)));
}

export const ORCHESTRATOR_KP = kp("AGENT_ORCHESTRATOR_PRIVATE_KEY");
export const SCOUT_KP = kp("AGENT_SCOUT_PRIVATE_KEY");
export const EVALUATOR_KP = kp("AGENT_EVALUATOR_PRIVATE_KEY");
export const NEGOTIATOR_KP = kp("AGENT_NEGOTIATOR_PRIVATE_KEY");
export const SUPPLIER_KP = kp("AGENT_SUPPLIER_PRIVATE_KEY");

// Public keys (clean)
export const ORCHESTRATOR = ORCHESTRATOR_KP.publicKey;
export const SCOUT = SCOUT_KP.publicKey;
export const EVALUATOR = EVALUATOR_KP.publicKey;
export const NEGOTIATOR = NEGOTIATOR_KP.publicKey;
export const SUPPLIER = SUPPLIER_KP.publicKey;
