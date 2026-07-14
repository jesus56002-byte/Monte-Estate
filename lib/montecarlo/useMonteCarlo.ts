"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InvestmentInputs } from "@/lib/finance/types";
import { mulberry32 } from "@/lib/montecarlo/distributions";
import { runTrial } from "@/lib/montecarlo/engine";
import type {
  MonteCarloConfig,
  MonteCarloResults,
  WorkerOutboundMessage,
  WorkerRunMessage,
} from "@/lib/montecarlo/types";

type Status = "idle" | "running" | "done" | "error";

const CHUNK_SIZE = 500;

/**
 * Runs the simulation in batches on the main thread, yielding between
 * batches. `isCurrent` is checked before every state update so a stale loop
 * (superseded by a newer run() or a reset()) stops touching state instead of
 * racing with whatever started after it.
 */
function runChunked(
  baseInputs: InvestmentInputs,
  config: MonteCarloConfig,
  isCurrent: () => boolean,
  onProgress: (completed: number, total: number) => void,
  onDone: (results: MonteCarloResults) => void
) {
  const rng = mulberry32(config.seed);
  const irr = new Float64Array(config.trials);
  const totalProfit = new Float64Array(config.trials);
  let completed = 0;

  function runBatch() {
    if (!isCurrent()) return;

    const end = Math.min(completed + CHUNK_SIZE, config.trials);
    for (let i = completed; i < end; i++) {
      const trial = runTrial(baseInputs, config, rng);
      irr[i] = trial.irr;
      totalProfit[i] = trial.totalProfit;
    }
    completed = end;
    onProgress(completed, config.trials);

    if (completed < config.trials) {
      setTimeout(runBatch, 0);
    } else {
      onDone({ irr, totalProfit });
    }
  }

  runBatch();
}

export function useMonteCarlo() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [results, setResults] = useState<MonteCarloResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- plain counter ref, not a DOM node; invalidating in-flight work on unmount is the point
      runIdRef.current++;
      workerRef.current?.terminate();
    };
  }, []);

  const reset = useCallback(() => {
    runIdRef.current++;
    workerRef.current?.terminate();
    workerRef.current = null;
    setStatus("idle");
    setProgress({ completed: 0, total: 0 });
    setResults(null);
    setError(null);
  }, []);

  const run = useCallback((baseInputs: InvestmentInputs, config: MonteCarloConfig) => {
    const runId = ++runIdRef.current;
    setStatus("running");
    setError(null);
    setResults(null);
    setProgress({ completed: 0, total: config.trials });

    if (typeof Worker === "undefined") {
      runChunked(
        baseInputs,
        config,
        () => runIdRef.current === runId,
        (completed, total) => setProgress({ completed, total }),
        (simResults) => {
          setResults(simResults);
          setStatus("done");
        }
      );
      return;
    }

    workerRef.current?.terminate();
    const worker = new Worker(new URL("./worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      if (runIdRef.current !== runId) return;
      const message = event.data;
      if (message.type === "PROGRESS") {
        setProgress(message.payload);
      } else if (message.type === "RESULT") {
        setResults({
          irr: new Float64Array(message.payload.irrBuffer),
          totalProfit: new Float64Array(message.payload.totalProfitBuffer),
        });
        setStatus("done");
        worker.terminate();
        workerRef.current = null;
      } else if (message.type === "ERROR") {
        setError(message.payload.message);
        setStatus("error");
        worker.terminate();
        workerRef.current = null;
      }
    };

    worker.onerror = () => {
      if (runIdRef.current !== runId) return;
      setError("The simulation worker crashed. Try again.");
      setStatus("error");
      worker.terminate();
      workerRef.current = null;
    };

    const runMessage: WorkerRunMessage = { type: "RUN", payload: { baseInputs, config } };
    worker.postMessage(runMessage);
  }, []);

  return { status, progress, results, error, run, reset };
}
