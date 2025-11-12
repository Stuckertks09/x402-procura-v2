import type { AcceptOffer } from "../../pages/ProcuraDashboard";
import { OfferPanel } from "./OfferPanel";

interface LedgerEntry {
  time: string;
  note: string;
}

interface PaymentPanelProps {
  ledger: LedgerEntry[];
  devSign: boolean;
  setDevSign: (value: boolean) => void;
  firstOffer: AcceptOffer | null;
  purchaseOffer: AcceptOffer | null;
  onSendFirst: () => void;
  onSendPurchase: () => void;
}

export function PaymentPanel({
  ledger,
  firstOffer,
  purchaseOffer,
  onSendFirst,
  onSendPurchase,
}: PaymentPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Ledger */}
      <div className="border rounded-lg p-4 space-y-2">
        <h2 className="font-semibold text-lg">Payment Ledger</h2>
        <p className="text-sm text-muted-foreground">
          Real-time settlement events streamed from the facilitator.
        </p>

        <div className="mt-4 h-64 overflow-y-auto text-sm border rounded p-2 bg-muted/30">
          {ledger.length === 0 && (
            <div className="text-muted-foreground text-center py-6">
              No payments yet.
            </div>
          )}
          {ledger.map((entry, i) => (
            <div key={i} className="py-1 border-b last:border-0">
              <span className="font-mono mr-2 text-xs text-muted-foreground">
                {entry.time}
              </span>
              {entry.note}
            </div>
          ))}
        </div>
      </div>

      {/* Offers */}
      <div className="space-y-6">
        <OfferPanel
          title="Request Fee (x402)"
          offer={firstOffer}
          onSend={onSendFirst}
        />

        <OfferPanel
          title="Supplier Settlement (x402)"
          offer={purchaseOffer}
          onSend={onSendPurchase}
        />
      </div>

    </div>
  );
}
