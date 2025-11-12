import { Keypair, PublicKey } from "@solana/web3.js";
import "dotenv/config";

function load(name: string): Keypair {
  const raw = process.env[name];
  if (!raw) throw new Error(`Missing env key: ${name}`);
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

export type AgentName =
  | "orchestrator"
  | "scout"
  | "evaluator"
  | "negotiator"
  | "supplier";

export const wallets: Record<AgentName, Keypair> = {
  orchestrator: load("AGENT_ORCHESTRATOR_PRIVATE_KEY"),
  scout: load("AGENT_SCOUT_PRIVATE_KEY"),
  evaluator: load("AGENT_EVALUATOR_PRIVATE_KEY"),
  negotiator: load("AGENT_NEGOTIATOR_PRIVATE_KEY"),
  supplier: load("AGENT_SUPPLIER_PRIVATE_KEY"),
};

console.log("🔍 WALLET TYPE CHECK:");
(Object.entries(wallets) as [AgentName, Keypair][]).forEach(([name, kp]) => {
  console.log(
    name,
    "publicKey instanceof PublicKey:", 
    kp.publicKey instanceof PublicKey,
    "secretKey type:", 
    Object.prototype.toString.call(kp.secretKey)
  );
});


