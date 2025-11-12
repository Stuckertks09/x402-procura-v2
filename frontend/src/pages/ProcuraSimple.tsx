import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { signPayload, getClientPublicKey } from "../lib/x402Client";
import { AgentsPanel } from "../components/procura/AgentsPanel";
import type { AgentRow } from "../components/procura/AgentsPanel";

/* TYPES */
type AcceptOffer = {
  scheme: "exact";
  network: string;
  maxAmountRequired: string;
  asset: string;
  payTo: string;
  resource: string;
};

type RankedLaptop = {
  score: number;
  laptop: { model: string; cpu: string; ram: number; price: number; supplier?: string };
};

type NegotiationResult = {
  supplier_wallet: string;
  final_price_per_unit: number;
  quantity: number;
  total_cost: number;
};

type ProcurementResult = {
  ranked?: RankedLaptop[];
  negotiation?: NegotiationResult;
};

export default function ProcuraSimple() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const logRef = useRef<HTMLDivElement | null>(null);

  const [job, setJob] = useState({
    use_case: "video-editing",
    quantity: 5,
    budget: 2500,
  });

  const [firstOffer, setFirstOffer] = useState<AcceptOffer | null>(null);
  const [purchaseOffer, setPurchaseOffer] = useState<AcceptOffer | null>(null);
  const [results, setResults] = useState<ProcurementResult | null>(null);

  const walletAddress = getClientPublicKey();
  let stream: EventSource | null = null;

  /* Load Agents */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:9000/api/agents");
        setAgents(await res.json());
      } catch {
        setAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    })();
  }, []);

  /* UI Logging */
  function appendLog(msg: string) {
    const time = new Date().toLocaleTimeString();
    setLogMessages((prev) => [...prev, `[${time}] ${msg}`]);
    setTimeout(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight }), 40);
  }

  /* Confirm Payment Dialog */
  async function confirmPaymentUI(label: string, amount: string, recipient: string) {
    return window.confirm(
`Authorize Payment?

Step: ${label}
Recipient: ${recipient.slice(0, 6)}…${recipient.slice(-4)}
Amount: ${(Number(amount) / 1_000_000_000).toFixed(6)} SOL

Continue?`
    );
  }

  /* STEP 1 */
  async function startProcurement() {
    const rid = `req-${Date.now()}`;
    setRequestId(rid);

    stream = new EventSource(`http://localhost:9000/api/stream/${rid}`);
    stream.onmessage = (e) => appendLog(e.data);

    stream.onerror = async () => {
      appendLog("✅ Negotiation completed. Loading purchase details…");
      stream?.close();
      await loadResults(rid);
      setStep(3);
    };

    const res = await fetch("http://localhost:9000/api/procure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: rid, ...job }),
    });

    const json = await res.json();
    if (res.status === 402 && json.accepts?.[0]) {
      setFirstOffer(json.accepts[0]);
      toast.message("💰 Request fee required");
      setStep(2);
      return;
    }

    toast.error("Unexpected response: No payment request returned.");
  }

  /* STEP 2 PAY FEE */
  async function payOffer(offer: AcceptOffer, label: string) {
    if (!requestId) return;

    const proceed = await confirmPaymentUI(label, offer.maxAmountRequired, offer.payTo);
    if (!proceed) return toast.error("Payment Cancelled");

    const structuredPayload = {
      amount: offer.maxAmountRequired,
      recipient: offer.payTo,
      resourceId: offer.resource,
      resourceUrl: offer.resource,
      nonce: `${label}-${Date.now()}`,
      timestamp: Date.now(),
      expiry: Date.now() + 15 * 60 * 1000,
    };

    const signature = signPayload(structuredPayload);

    return fetch(`http://localhost:9000${offer.resource}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PAYMENT": JSON.stringify({ payload: structuredPayload, signature, clientPublicKey: walletAddress }),
      },
      body: JSON.stringify({ request_id: requestId, ...job }),
    }).then((r) => r.json());
  }

  async function runNegotiation() {
    if (!firstOffer) return;
    toast.message("Paying request fee…");
    await payOffer(firstOffer, "procure");
    appendLog("🤖 Agents negotiating with suppliers…");
  }

  /* STEP 3 LOAD RESULT */
  async function loadResults(rid: string) {
    const res = await fetch("http://localhost:9000/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: rid }),
    });

    const json = await res.json();
    if (res.status === 402 && json.accepts?.[0]) {
      setPurchaseOffer(json.accepts[0]);
      appendLog("💰 Supplier payment required");
      return;
    }

    setResults(json);
  }

  async function paySupplier() {
    if (!purchaseOffer) return;
    toast.message("Paying supplier…");
    await payOffer(purchaseOffer, "purchase");
    appendLog("🎉 Supplier Paid — Order Complete!");
    toast.success("✅ Order Complete!");
  }

  /* UI */
  return (
    <div className="mx-auto max-w-3xl p-8 space-y-10">

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Procura</h1>
        <p className="text-muted-foreground">
          Autonomous procurement. Multi-agent negotiation + x402 settlement.
        </p>
        <div className="text-sm mt-1 p-2 rounded border bg-muted/10 w-fit">
          Wallet: {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)} <span className="text-green-600 font-medium">● Connected</span>
        </div>
      </header>

      {/* Job Form */}
      <div className="grid grid-cols-3 gap-4 border p-4 rounded-lg bg-muted/5">
        <div>
          <label className="text-sm font-medium">Use Case</label>
          <select className="w-full border rounded px-2 py-1 mt-1"
            value={job.use_case}
            onChange={e => setJob({ ...job, use_case: e.target.value })}
          >
            <option value="video-editing">Video Editing</option>
            <option value="data-science">Data Science</option>
            <option value="gaming-laptops">Gaming</option>
            <option value="office-lightweight">Lightweight Office</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Quantity</label>
          <input type="number" className="w-full border rounded px-2 py-1 mt-1"
            value={job.quantity}
            onChange={e => setJob({ ...job, quantity: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Budget (USD)</label>
          <input type="number" className="w-full border rounded px-2 py-1 mt-1"
            value={job.budget}
            onChange={e => setJob({ ...job, budget: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Agents Panel */}
      <AgentsPanel agents={agents} loading={loadingAgents} />

      {/* Logs */}
      <div ref={logRef} className="border rounded-lg p-4 h-56 text-sm overflow-y-auto shadow-sm bg-muted/10">
        {logMessages.length === 0 && <div className="text-muted-foreground italic">Logs will appear here…</div>}
        {logMessages.map((msg, i) => <div key={i} className="whitespace-pre-wrap">{msg}</div>)}
      </div>

      {/* Buttons */}
      {step === 1 && (
        <button onClick={startProcurement} className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
          🚀 Start Procurement
        </button>
      )}

      {step === 2 && (
        <button onClick={runNegotiation} className="w-full py-3 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition">
          💸 Pay Request Fee & Begin Negotiation
        </button>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {results && (
            <div className="border rounded-lg p-4 bg-muted/30 shadow-sm">
              <h2 className="font-semibold mb-2">Final Negotiated Result</h2>
              <pre className="text-xs overflow-x-auto">{JSON.stringify(results, null, 2)}</pre>
            </div>
          )}

          {purchaseOffer && (
            <button onClick={paySupplier} className="w-full py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition">
              ✅ Pay Supplier & Complete Order
            </button>
          )}
        </div>
      )}
    </div>
  );
}
