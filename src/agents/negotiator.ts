// src/agents/negotiator.ts
import { ScoredLaptop } from "./types";
import { SupplierAgent } from "./supplier";

export interface NegotiationResult {
  supplier_name: string;
  supplier_wallet: string;
  final_price_per_unit: number;
  quantity: number;
  discount_applied_pct: number;
  total_cost: number;
  savings: number;
  note: string;
}

export class NegotiatorAgent {
  constructor(private supplier: SupplierAgent) {}

  async negotiate(top: ScoredLaptop, quantity: number): Promise<NegotiationResult | null> {
    const laptop = top.laptop;

    const supplier_name = laptop.supplier || "Unknown Supplier";

    // ✅ Use the real supplier Keypair loaded in SupplierAgent
    const supplier_wallet = this.supplier.wallet.publicKey.toBase58();

    const original = laptop.price;

    let discount = 0;
    const tiers = [...(laptop.bulk_pricing || [])].sort((a, b) => b.min_qty - a.min_qty);
    for (const t of tiers) {
      if (quantity >= t.min_qty) {
        discount = t.discount_pct;
        break;
      }
    }

    const finalUnit = +(original * (1 - discount / 100)).toFixed(2);
    const totalCost = +(finalUnit * quantity).toFixed(2);
    const savings = +((original - finalUnit) * quantity).toFixed(2);

    const note = discount > 0
      ? `Applied ${discount}% bulk discount`
      : `No bulk discount applicable`;

    return {
      supplier_name,
      supplier_wallet,
      final_price_per_unit: finalUnit,
      quantity,
      discount_applied_pct: discount,
      total_cost: totalCost,
      savings,
      note
    };
  }
}
