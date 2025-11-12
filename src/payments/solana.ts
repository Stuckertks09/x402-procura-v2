import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";

export const connection = new Connection(process.env.SOLANA_RPC || clusterApiUrl("devnet"), "confirmed");

function loadKey(envName: string): Keypair {
  const raw = process.env[envName];
  if (!raw) throw new Error(`Missing env ${envName}`);
  // Store private keys as JSON array string in .env (same pattern Solana docs use)
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

export const wallets = {
  orchestrator: loadKey("AGENT_ORCHESTRATOR_PRIVATE_KEY"),
  scout:        loadKey("AGENT_SCOUT_PRIVATE_KEY"),
  evaluator:    loadKey("AGENT_EVALUATOR_PRIVATE_KEY"),
  negotiator:   loadKey("AGENT_NEGOTIATOR_PRIVATE_KEY"),
  supplier: loadKey("AGENT_SUPPLIER_PRIVATE_KEY"),
};

export function pubkeyOf(name: keyof typeof wallets): PublicKey {
  return wallets[name].publicKey;
}
