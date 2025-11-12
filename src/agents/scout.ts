import { LaptopOption, Requirements } from "./types.js";

export class ScoutAgent {
  constructor(private catalog: LaptopOption[]) {}

  async findCandidates(req: Requirements): Promise<LaptopOption[]> {
    return this.catalog.filter(l => {
      if (!l.use_cases.includes(req.use_case)) return false;
      if (req.min_ram && l.specs.ram_gb < req.min_ram) return false;
      if (req.min_storage && l.specs.storage_gb < req.min_storage) return false;
      if (req.preferred_brand && l.brand.toLowerCase() !== req.preferred_brand.toLowerCase()) return false;
      if (l.stock < req.quantity) return false;
      if (l.price > req.budget * 1.15) return false;
      return true;
    });
  }
}
