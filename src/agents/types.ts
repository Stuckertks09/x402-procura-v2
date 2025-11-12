export type UseCase = "video-editing" | "programming" | "office-work" | "data-science" | "gaming";

export interface LaptopSpecs {
  processor: string;
  ram_gb: number;
  storage_gb: number;
  gpu: string;
  screen_size: number;
  weight_lbs: number;
}

export interface BulkPricing {
  min_qty: number;
  discount_pct: number;
}

export interface LaptopOption {
  id: string;
  model: string;
  brand: string;
  specs: LaptopSpecs;
  price: number;
  supplier: string;
  rating: number;
  review_count: number;
  shipping_days: number;
  warranty_years: number;
  stock: number;
  use_cases: UseCase[];
  bulk_pricing: BulkPricing[];
}

export interface Requirements {
  request_id?: string;
  use_case: UseCase;
  quantity: number;
  budget: number;
  min_ram?: number | null;
  min_storage?: number | null;
  preferred_brand?: string | null;
  prefer_performance?: boolean;
}

export interface ScoredLaptop {
  laptop: LaptopOption;
  score: number;
  symbolic_score: number;
  value_score: number;
  rationale: string;
}

export interface NegotiationResult {
  accepted: boolean;
  original_price: number;
  final_price_per_unit: number;
  total_cost: number;
  discount_applied_pct: number;
  savings: number;
  note?: string;
  supplier_wallet: string;
  quantity: number;
}
