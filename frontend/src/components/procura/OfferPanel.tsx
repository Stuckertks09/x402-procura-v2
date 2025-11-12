import type { AcceptOffer } from "../../pages/ProcuraDashboard";
import { Button } from "../ui/button";

interface OfferPanelProps {
  title: string;
  offer: AcceptOffer | null;
  onSend: () => void;
}

export function OfferPanel({ title, offer, onSend }: OfferPanelProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
      <h3 className="font-medium text-lg">{title}</h3>

      {!offer && (
        <p className="text-sm text-muted-foreground">
          Waiting for workflow to reach this stage…
        </p>
      )}

      {offer && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span>{offer.maxAmountRequired} {offer.asset}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient:</span>
            <span className="font-mono">{offer.payTo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Resource:</span>
            <span>{offer.resource}</span>
          </div>

          <Button variant="default" className="w-full mt-3" onClick={onSend}>
            Send X-PAYMENT
          </Button>
        </div>
      )}
    </div>
  );
}
