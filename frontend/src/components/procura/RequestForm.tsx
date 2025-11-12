import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";

export function RequestForm({ useCase, qty, budget, setUseCase, setQty, setBudget, onStart, requestId }:{
  useCase: string;
  qty: number;
  budget: number;
  setUseCase: (s: string) => void;
  setQty: (n: number) => void;
  setBudget: (n: number) => void;
  onStart: () => void;
  requestId: string | null;
}) {
  return (
    <Card>
      <CardHeader><CardTitle>New Request</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>Use Case</Label>
          <Input value={useCase} onChange={(e) => setUseCase(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" value={qty} onChange={(e) => setQty(parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Budget (USD)</Label>
            <Input type="number" value={budget} onChange={(e) => setBudget(parseInt(e.target.value))} />
          </div>
        </div>
        <Button className="w-full" onClick={onStart}>Start Procurement</Button>
        {requestId && <p className="text-xs text-muted-foreground">Request ID: <span className="font-mono">{requestId}</span></p>}
      </CardContent>
    </Card>
  );
}
