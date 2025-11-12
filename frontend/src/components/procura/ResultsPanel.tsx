import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

interface Ranked {
  score: number;
  laptop: {
    model: string;
    cpu: string;
    ram: number;
    price: number;
  };
}

interface Negotiation {
  supplier_wallet: string;
  final_price_per_unit: number;
  quantity: number;
  total_cost: number;
}

interface ResultsPanelProps {
  ranked: Ranked[] | null;
  negotiation: Negotiation | null;
  onProceed: () => void;
}

export function ResultsPanel({ ranked, negotiation, onProceed }: ResultsPanelProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Results</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranked section */}
        <div>
          <h3 className="font-medium mb-2">Recommended Options</h3>
          <div className="space-y-2">
            {!ranked && <div className="text-sm text-muted-foreground">Running analysis…</div>}
            {ranked?.slice(0, 5).map((r, i) => (
              <div key={i} className="rounded-xl border p-3 flex justify-between text-sm bg-white">
                <div>
                  <div className="font-medium">{r.laptop.model}</div>
                  <div className="text-muted-foreground">
                    {r.laptop.cpu} · {r.laptop.ram}GB · ${r.laptop.price}
                  </div>
                </div>
                <Badge>{(r.score * 100).toFixed(1)}%</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Negotiation */}
        <div>
          <h3 className="font-medium mb-2">Negotiated Supplier Terms</h3>
          {!negotiation ? (
            <div className="text-sm text-muted-foreground">Negotiating…</div>
          ) : (
            <div className="rounded-xl border p-4 space-y-2 text-sm bg-white">
              <div>Supplier Wallet: <span className="font-mono">{negotiation.supplier_wallet}</span></div>
              <div>Final Unit Price: ${negotiation.final_price_per_unit}</div>
              <div>Quantity: {negotiation.quantity}</div>
              <div className="font-semibold text-base pt-2">Total Cost: ${negotiation.total_cost}</div>

              <Button className="mt-2" onClick={onProceed}>
                Proceed to Supplier Payment
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
