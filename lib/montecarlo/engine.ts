import { runAnalysis } from "@/lib/finance/analysis";
import type { InvestmentInputs } from "@/lib/finance/types";
import { clamp, mulberry32, randomNormal } from "@/lib/montecarlo/distributions";
import type { MonteCarloConfig, MonteCarloResults } from "@/lib/montecarlo/types";

/** Sensible default variability around the user's point estimates. */
export function buildDefaultSimulationConfig(
  inputs: InvestmentInputs,
  seed = Date.now()
): MonteCarloConfig {
  return {
    trials: 10_000,
    seed,
    appreciation: { mean: inputs.appreciationPct, stdDev: 0.03, min: -0.2, max: 0.3 },
    rentGrowth: { mean: inputs.rentGrowthPct, stdDev: 0.015, min: -0.1, max: 0.15 },
    vacancy: { mean: inputs.vacancyPct, stdDev: 0.03, min: 0, max: 0.5 },
  };
}

/** One randomized trial, reusing the same deterministic engine as the point-estimate analysis. */
export function runTrial(
  baseInputs: InvestmentInputs,
  config: MonteCarloConfig,
  rng: () => number
): { irr: number; totalProfit: number } {
  const appreciationPct = clamp(
    randomNormal(rng, config.appreciation.mean, config.appreciation.stdDev),
    config.appreciation.min,
    config.appreciation.max
  );
  const rentGrowthPct = clamp(
    randomNormal(rng, config.rentGrowth.mean, config.rentGrowth.stdDev),
    config.rentGrowth.min,
    config.rentGrowth.max
  );
  const vacancyPct = clamp(
    randomNormal(rng, config.vacancy.mean, config.vacancy.stdDev),
    config.vacancy.min,
    config.vacancy.max
  );

  const result = runAnalysis({ ...baseInputs, appreciationPct, rentGrowthPct, vacancyPct });
  return { irr: result.irr, totalProfit: result.totalProfit };
}

export function runSimulation(
  baseInputs: InvestmentInputs,
  config: MonteCarloConfig,
  onProgress?: (completed: number, total: number) => void
): MonteCarloResults {
  const rng = mulberry32(config.seed);
  const irr = new Float64Array(config.trials);
  const totalProfit = new Float64Array(config.trials);
  const progressInterval = Math.max(1, Math.floor(config.trials / 20));

  for (let i = 0; i < config.trials; i++) {
    const trial = runTrial(baseInputs, config, rng);
    irr[i] = trial.irr;
    totalProfit[i] = trial.totalProfit;

    if (onProgress && (i % progressInterval === 0 || i === config.trials - 1)) {
      onProgress(i + 1, config.trials);
    }
  }

  return { irr, totalProfit };
}
