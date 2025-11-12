import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

import { AgentsPanel } from "../components/procura/AgentsPanel";
import { RequestForm } from "../components/procura/RequestForm";
import { WorkflowFeed } from "../components/procura/WorkflowFeed";
import { PaymentPanel } from "../components/procura/PaymentPanel";
import { ResultsPanel } from "../components/procura/ResultsPanel";
import { signPayload, clientPublicKey } from "../lib/x402Client";

export type AcceptOffer = {
  scheme: "exact";
  network: string;
  maxAmountRequired: string;
  asset: string;
  payTo: string;
  resource: string;
};

type AgentRow = {
  agent: "scout" | "evaluator" | "negotiator" | "supplier";
  pubkey: string;
  jobs_completed: number;
  jobs_failed: number;
  trust_score: number;
  total_earned_sol: number;
  explorer: string;
};

type LaptopOption = {
  model: string;
  cpu: string;
  ram: number;
  price: number;
  supplier?: string;
};

type Ranked = { score: number; laptop: LaptopOption };

type X402FirstResponse = {
  request_id?: string;
  status?: string;
  accepts?: AcceptOffer[];
  error?: string;
};

type Negotiation = {
  supplier_wallet: string;
  final_price_per_unit: number;
  quantity: number;
  total_cost: number;
};

function useSSE(url: string | null) {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    if (!url) return;
    const ev = new EventSource(url);
    ev.onmessage = (e) => setLines((prev) => [...prev, e.data]);
    ev.onerror = () => ev.close();
    return () => ev.close();
  }, [url]);
  return lines;
}

export default function ProcuraDashboard() {
  // Agents
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  // Request form state
  const [useCase, setUseCase] = useState("video-editing");
  const [qty, setQty] = useState(5);
  const [budget, setBudget] = useState(2500);

  // Workflow state
  const [requestId, setRequestId] = useState<string | null>(null);
  const [firstOffer, setFirstOffer] = useState<AcceptOffer | null>(null);
  const [purchaseOffer, setPurchaseOffer] = useState<AcceptOffer | null>(null);
  const [ranked, setRanked] = useState<Ranked[] | null>(null);
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);

  // Payments UI internal state
  const [devSign, setDevSign] = useState(false);
  

  // Live feed + ledger
  const streamUrl = requestId
  ? `http://localhost:9000/api/stream/${requestId}`
  : null;
  const feed = useSSE(streamUrl);

  const ledger = useMemo(() => {
    return feed
      .filter((l) => /Paid|💸/.test(l))
      .map((note) => ({ time: new Date().toLocaleTimeString(), note }));
  }, [feed]);

  // Load agents
  useEffect(() => {
    (async () => {
      setLoadingAgents(true);
      try {
        const res = await fetch("http://localhost:9000/api/agents");
        if (!res.ok) throw new Error(await res.text());
        setAgents(await res.json());
      } catch {
        toast.error("Failed to load agents");
      } finally {
        setLoadingAgents(false);
      }
    })();
  }, []);

  // Start procurement
  async function beginProcure() {
  setRanked(null);
  setNegotiation(null);
  setFirstOffer(null);
  setPurchaseOffer(null);

  const res = await fetch("http://localhost:9000/api/procure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ use_case: useCase, quantity: qty, budget }),
  });

  // ✅ Always parse JSON (even for 402)
  const j = (await res.json()) as X402FirstResponse;

  if (!j.request_id) {
    toast.error("Backend did not return request_id");
    return;
  }

  setRequestId(j.request_id);

  if (res.status === 402 && j.accepts?.[0]) {
    // ✅ Payment Required — set offer & wait for user to click "Pay"
    setFirstOffer(j.accepts[0]);
    toast.message("Payment required: Request Fee (x402)");
    return;
  }

  if (res.ok) {
    toast.success("Procurement started");
  }
}



  // Universal payment sender (fixed version)
  async function sendPayment(offer: AcceptOffer) {
  if (!requestId) return;

  const resource = offer.resource;
  const payload = {
    amount: offer.maxAmountRequired,
    recipient: offer.payTo,
    resourceId: resource,
    resourceUrl: resource,
    nonce: `${resource.includes("procure") ? "procure" : "purchase"}-${Date.now()}`,
    timestamp: Date.now(),
    expiry: Date.now() + 15 * 60 * 1000,
  };

  const signature = signPayload(payload);

  const res = await fetch(`http://localhost:9000${resource}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PAYMENT": JSON.stringify({ payload, signature, clientPublicKey }),
    },
    body: JSON.stringify({ request_id: requestId }),
  });

  const json = await res.json().catch(() => ({}));

  if (res.status === 402 && json.accepts?.[0]) {
    setPurchaseOffer(json.accepts[0]);
    toast.message("Additional payment required (x402)");
    return;
  }

  if (!res.ok) {
    toast.error(`Payment failed: ${JSON.stringify(json)}`);
    return;
  }

  toast.success(
    resource.includes("procure")
      ? "Request fee paid. Workflow running…"
      : "Supplier payment sent. Order completed."
  );
}


  // Poll results
  useEffect(() => {
  if (!requestId) return;
  const poll = setInterval(async () => {
    const r = await fetch(`http://localhost:9000/api/result/${requestId}`);
    if (!r.ok) return;
    const j = await r.json();
    if (j.ranked) setRanked(j.ranked);
    if (j.negotiation) setNegotiation(j.negotiation);
  }, 1500);
  return () => clearInterval(poll);
}, [requestId]);

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Procura Console</h1>
          <p className="text-sm text-muted-foreground">Autonomous procurement · x402 settlement · On-chain trust.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">x402 Help</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>How Payments Work</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              `/api/procure` and `/api/purchase` first return 402 Offers.
              Sign the payload → send again with `X-PAYMENT`.
            </p>
          </DialogContent>
        </Dialog>
      </div>

      {/* Agents & Request */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AgentsPanel agents={agents} loading={loadingAgents} />
        <RequestForm
          useCase={useCase}
          qty={qty}
          budget={budget}
          setUseCase={setUseCase}
          setQty={setQty}
          setBudget={setBudget}
          onStart={beginProcure}
          requestId={requestId}
        />
      </div>

      {/* Workflow Tabs */}
      <Tabs defaultValue="workflow">
        <TabsList>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow">
          <WorkflowFeed feed={feed} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentPanel
            ledger={ledger}
            devSign={devSign}
            setDevSign={setDevSign}
            firstOffer={firstOffer}
            purchaseOffer={purchaseOffer}
            onSendFirst={() => firstOffer && sendPayment(firstOffer)}
            onSendPurchase={() => purchaseOffer && sendPayment(purchaseOffer)}
          />
        </TabsContent>

        <TabsContent value="results">
          <ResultsPanel
  ranked={ranked}
  negotiation={negotiation}
  onProceed={async () => {
    if (!requestId) return;

    const r = await fetch("http://localhost:9000/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId }),
    });

    const j = await r.json();

    if (j.accepts && j.accepts[0]) {
      setPurchaseOffer(j.accepts[0]);
      toast.message("Payment required: Supplier payment (x402)");
    } else if (j.ok) {
      toast.success("Supplier payment already settled.");
    } else {
      toast.error("Unexpected purchase response");
    }
  }}
/>

        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground text-center py-2">
        Procura • Solana Devnet • x402 Protocol • Enterprise Stable
      </div>
    </div>
  );
}
