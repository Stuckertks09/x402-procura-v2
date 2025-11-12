import nacl from "tweetnacl";
import bs58 from "bs58";

let _keypair: nacl.SignKeyPair | null = null;
let _publicKey: string | null = null;

/**
 * Lazily load + parse the secret key the first time it's needed.
 * Prevents the UI from crashing at module import time.
 */
function ensureKeypair() {
  if (_keypair) return;

  const raw = import.meta.env.VITE_CLIENT_SECRET_KEY;
  if (!raw) {
    throw new Error(
      "❌ Missing VITE_CLIENT_SECRET_KEY — add to your .env.local as a JSON array (base58 NOT accepted)."
    );
  }

  const secretKeyBytes = Uint8Array.from(JSON.parse(raw)); // must be 64-byte ed25519 secret key
  _keypair = nacl.sign.keyPair.fromSecretKey(secretKeyBytes);
  _publicKey = bs58.encode(_keypair.publicKey);
}

export function getClientPublicKey(): string {
  ensureKeypair();
  return _publicKey!;
}

export function signPayload(payload: Record<string, unknown>): string {
  ensureKeypair(); // ensures _keypair exists

  const structured = {
    domain: {
      name: "x402-solana-protocol",
      version: "1",
      chainId: "devnet",
      verifyingContract: "x402-sol",
    },
    types: {
      AuthorizationPayload: [
        { name: "amount", type: "string" },
        { name: "recipient", type: "string" },
        { name: "resourceId", type: "string" },
        { name: "resourceUrl", type: "string" },
        { name: "nonce", type: "string" },
        { name: "timestamp", type: "uint64" },
        { name: "expiry", type: "uint64" },
      ],
    },
    primaryType: "AuthorizationPayload",
    message: payload,
  };

  const bytes = new TextEncoder().encode(JSON.stringify(structured));
  const sigBytes = nacl.sign.detached(bytes, _keypair!.secretKey);
  return bs58.encode(sigBytes);
}
