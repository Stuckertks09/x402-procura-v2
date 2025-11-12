import { Keypair } from "@solana/web3.js";

function generate(label: string) {
  const kp = Keypair.generate();
  console.log(`\n### ${label}`);
  console.log(`PUBLIC KEY: ${kp.publicKey.toBase58()}`);
  console.log(`SECRET KEY: [${kp.secretKey.toString()}]`);
}

generate("ORCHESTRATOR");
generate("SCOUT");
generate("EVALUATOR");
generate("NEGOTIATOR");
generate("PAYMENTS");
