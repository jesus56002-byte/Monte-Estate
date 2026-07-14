export interface SimulationVariableConfig {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
}

export interface MonteCarloConfig {
  trials: number;
  seed: number;
  appreciation: SimulationVariableConfig;
  rentGrowth: SimulationVariableConfig;
  vacancy: SimulationVariableConfig;
}

export interface MonteCarloResults {
  irr: Float64Array;
  totalProfit: Float64Array;
}

export interface WorkerRunMessage {
  type: "RUN";
  payload: {
    baseInputs: import("@/lib/finance/types").InvestmentInputs;
    config: MonteCarloConfig;
  };
}

export interface WorkerProgressMessage {
  type: "PROGRESS";
  payload: { completed: number; total: number };
}

export interface WorkerResultMessage {
  type: "RESULT";
  payload: {
    irrBuffer: ArrayBufferLike;
    totalProfitBuffer: ArrayBufferLike;
  };
}

export interface WorkerErrorMessage {
  type: "ERROR";
  payload: { message: string };
}

export type WorkerOutboundMessage = WorkerProgressMessage | WorkerResultMessage | WorkerErrorMessage;
