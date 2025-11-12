import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

const RPC_URL = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export async function micropay(
  fromKp: Keypair,
  toPub: PublicKey,
  amountSol: number
) {
  const connection = new Connection(RPC_URL, "confirmed");

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKp.publicKey,
      toPubkey: toPub,
      lamports: Math.floor(amountSol * 1_000_000_000),
    })
  );

  const sig = await connection.sendTransaction(tx, [fromKp]);
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}
