// agents/supplier.ts
import { Keypair, PublicKey } from "@solana/web3.js";
import "dotenv/config";

export interface SupplierQuote {
  supplierName: string;
  model: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  supplierWallet: string;
}

export class SupplierAgent {
  public wallet: Keypair;

  constructor() {
    const secret = Uint8Array.from(JSON.parse(process.env.AGENT_SUPPLIER_PRIVATE_KEY!));
    this.wallet = Keypair.fromSecretKey(secret);
  }

  async quote(
    supplierName: string,
    model: string,
    price: number,
    quantity: number
  ): Promise<SupplierQuote> {
    const total = +(price * quantity).toFixed(2);

    return {
      supplierName,
      model,
      unitPrice: price,
      quantity,
      totalPrice: total,
      supplierWallet: this.wallet.publicKey.toBase58(), // ✅ correct now
    };
  }

  async confirmPurchase(txSig: string, request_id: string) {
    console.log(`📦 Supplier Fulfillment Confirmed → tx: ${txSig}`);
    return { ok: true, request_id, txSig };
  }
}

// ✅ Shared instance
export const supplier = new SupplierAgent();
