import { runSimulation } from "@/lib/montecarlo/engine";
import type {
  WorkerErrorMessage,
  WorkerOutboundMessage,
  WorkerProgressMessage,
  WorkerResultMessage,
  WorkerRunMessage,
} from "@/lib/montecarlo/types";

/**
 * Loosely typed worker boundary: the project's tsconfig only loads the "dom"
 * lib (needed everywhere else in the app), and merging in "webworker" via a
 * triple-slash reference here would conflict with those dom globals. `self`,
 * `MessageEvent`, and `Transferable` below all come from lib.dom.d.ts, which
 * is enough to type this file's actual surface.
 */
type WorkerSelf = {
  onmessage: ((event: MessageEvent<WorkerRunMessage>) => void) | null;
  postMessage: (message: WorkerOutboundMessage, transfer?: Transferable[]) => void;
};

const ctx = self as unknown as WorkerSelf;

ctx.onmessage = (event) => {
  const { baseInputs, config } = event.data.payload;

  try {
    const results = runSimulation(baseInputs, config, (completed, total) => {
      const progress: WorkerProgressMessage = { type: "PROGRESS", payload: { completed, total } };
      ctx.postMessage(progress);
    });

    const irrBuffer = results.irr.buffer;
    const totalProfitBuffer = results.totalProfit.buffer;
    const message: WorkerResultMessage = {
      type: "RESULT",
      payload: { irrBuffer, totalProfitBuffer },
    };
    ctx.postMessage(message, [irrBuffer as ArrayBuffer, totalProfitBuffer as ArrayBuffer]);
  } catch (error) {
    const message: WorkerErrorMessage = {
      type: "ERROR",
      payload: { message: error instanceof Error ? error.message : "Simulation failed." },
    };
    ctx.postMessage(message);
  }
};

export {};
