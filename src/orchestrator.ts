import { v4 as uuid } from "uuid";
import { Requirements, LaptopOption } from "./agents/types";
import { ScoutAgent } from "./agents/scout";
import { EvaluatorAgent } from "./agents/evaluator";
import { NegotiatorAgent } from "./agents/negotiator";
import { SupplierAgent } from "./agents/supplier";
import { pushEvent } from "./sse";
import { payAndReport } from "./payments/payAndReport";



import catalogJson from "./data/laptops.json";

// ✅ One supplier wallet (distributor network model)
const supplier = new SupplierAgent();

//Store req id from negotiator to initiate client payment process
export const negotiationStore = new Map<string, any>();


// Core agents
const scout = new ScoutAgent(catalogJson.laptops as LaptopOption[]);
const evaluator = new EvaluatorAgent();
const negotiator = new NegotiatorAgent(supplier);

export async function runProcurement(
  req: Omit<Requirements, "request_id"> & { request_id?: string }
) {
  const request_id = req.request_id || uuid();

  console.log("🟢 USING NEW runProcurement");


  pushEvent(request_id, `✅ Request accepted`);
  pushEvent(request_id, `• use_case=${req.use_case} | qty=${req.quantity} | budget=$${req.budget}`);

  //
  // 1️⃣ Scout
  //
  pushEvent(request_id, `🧭 Dispatching Scout…`);
  const candidates = await scout.findCandidates(req);
  pushEvent(request_id, `📦 Scout found ${candidates.length} candidates`);
  await payAndReport(request_id, "orchestrator", "scout", "Scout");

  if (candidates.length === 0) {
    pushEvent(request_id, `❌ No candidates found.`);
    return { request_id, error: "No candidates" };
  }

  //
  // 2️⃣ Evaluate
  //
  pushEvent(request_id, `🧠 Evaluator ranking…`);
  const ranked = await evaluator.rank(candidates, req);
  const top = ranked[0];
  pushEvent(request_id, `🥇 Top match → ${top.laptop.model}`);
  await payAndReport(request_id, "orchestrator", "evaluator", "Evaluator");

  //
  // 3️⃣ Negotiate with Supplier Network
  //
  pushEvent(request_id, `🤝 Negotiating best price with supplier network…`);
  const negotiation = await negotiator.negotiate(top, req.quantity);

  if (!negotiation) {
    pushEvent(request_id, `❌ Supplier unavailable.`);
    return { request_id, error: "Supplier unavailable" };
  }

  pushEvent(request_id, `🎉 Negotiation Successful`);
  negotiationStore.set(request_id, negotiation);
  

  // ✅ Correct supplier name output (no more [object Object])
  const supplierName = typeof top.laptop.supplier === "string"
    ? top.laptop.supplier
    : (top.laptop.supplier as any).name ?? "[unknown supplier]";

  pushEvent(request_id, `🏬 Supplier: ${supplierName}`);
  pushEvent(request_id, `👛 Supplier Wallet: ${negotiation.supplier_wallet}`);
  pushEvent(
    request_id,
    `💰 Final Price: $${negotiation.final_price_per_unit}/unit × ${negotiation.quantity} = $${negotiation.total_cost}`
  );

  await payAndReport(request_id, "orchestrator", "negotiator", "Negotiator");

  //
  // 4️⃣ Buyer Confirmation
  //
  pushEvent(request_id, `⏳ Awaiting client approval to complete purchase…`);

  return {
    request_id,
    ranked,
    negotiation
  };
}
