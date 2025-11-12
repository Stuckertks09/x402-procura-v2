import { ScoredLaptop, LaptopOption, Requirements } from "./types.js";
import { choose } from "../services/openai";

function perfScore(l: LaptopOption): number {
  const cpu = l.specs.processor.toLowerCase();
  const cpuScore =
    cpu.includes("i9") || cpu.includes("ryzen 9") ? 0.95 :
    cpu.includes("i7") || cpu.includes("ryzen 7") ? 0.85 :
    cpu.includes("m2 pro") ? 0.90 :
    cpu.includes("m2") ? 0.78 :
    0.7;
  const ramScore = Math.min(l.specs.ram_gb / 64, 1);
  const gpuScore = /rtx|radeon/i.test(l.specs.gpu) ? 0.8 : 0.3;
  return 0.4 * cpuScore + 0.3 * ramScore + 0.3 * gpuScore;
}

function valueScore(price: number, budget: number): number {
  if (price <= budget) return (budget - price) / Math.max(budget, 1e-9);
  return -0.3 * ((price - budget) / Math.max(budget, 1e-9));
}

function reviewSignal(rating: number, count: number): number {
  const base = rating / 5;
  const weight = count >= 500 ? 1 : Math.max(0, count / 500);
  return base * weight;
}

export class EvaluatorAgent {
  private WEIGHTS = { symbolic: 0.7, value: 0.3 }; // simple hybrid

  async rank(laptops: LaptopOption[], req: Requirements): Promise<ScoredLaptop[]> {
    const scored = laptops.map(l => {
      const symbolic = 0.7 * perfScore(l) + 0.3 * reviewSignal(l.rating, l.review_count);
      const value = valueScore(l.price, req.budget);
      const finalScore = this.WEIGHTS.symbolic * symbolic + this.WEIGHTS.value * value;
      return {
        laptop: l,
        score: finalScore,
        symbolic_score: symbolic,
        value_score: value,
        rationale: `hybrid(symbolic=${symbolic.toFixed(3)}, value=${value.toFixed(3)})`
      } as ScoredLaptop;
    }).sort((a,b) => b.score - a.score);

    // Optional: LLM tie-breaker when top scores are very close
if (scored.length > 1 && Math.abs(scored[0].score - scored[1].score) < 0.03) {

  const prompt = `
We are selecting the better laptop for the use case: ${req.use_case},
with a maximum target budget of ${req.budget} USD per unit.

Option A:
- Model: ${scored[0].laptop.model}
- Price: ${scored[0].laptop.price}

Option B:
- Model: ${scored[1].laptop.model}
- Price: ${scored[1].laptop.price}

Respond with only one character: "A" or "B".
`;

  const decision = await choose(prompt);

  if (decision === "B") {
    // Swap ranking if LLM prefers B
    [scored[0], scored[1]] = [scored[1], scored[0]];
  }

  scored[0].rationale += " | llm-tiebreak";
}

return scored;

  }
}
