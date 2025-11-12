export type AcceptOffer = {
  scheme: "exact";
  network: string;
  maxAmountRequired: string;
  asset: string;
  payTo: string;
  resource: string; // ex: "/api/procure" or "/api/purchase"
};

export type RankedLaptop = {
  score: number;
  laptop: {
    model: string;
    cpu: string;
    ram: number;
    price: number;
    supplier?: string;
  };
};

export type NegotiationResult = {
  supplier_wallet: string;
  final_price_per_unit: number;
  quantity: number;
  total_cost: number;
};

export type ProcurementResult = {
  ranked?: RankedLaptop[];
  negotiation?: NegotiationResult;
};
