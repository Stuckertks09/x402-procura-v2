import { PublicKey } from "@solana/web3.js";
import idl from "./idl/agent_reputation.json";

export const AGENT_REPUTATION_PROGRAM_ID = new PublicKey(
  "5g5vVtid5C6rVfshSQMHpWy7rvWWXrowVUN78UCKkQEj"
);

export const agentReputationIdl = idl as any;
