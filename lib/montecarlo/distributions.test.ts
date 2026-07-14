import { describe, expect, it } from "vitest";
import { clamp, mulberry32, randomNormal } from "./distributions";

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const sequenceA = Array.from({ length: 10 }, () => a());
    const sequenceB = Array.from({ length: 10 }, () => b());
    expect(sequenceA).toEqual(sequenceB);
  });

  it("produces values in [0, 1)", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("produces different sequences for different seeds", () => {
    const a = mulberry32(1)();
    const b = mulberry32(2)();
    expect(a).not.toBe(b);
  });
});

describe("randomNormal", () => {
  it("has approximately the requested mean and stdDev over a large sample", () => {
    const rng = mulberry32(7);
    const samples = Array.from({ length: 20_000 }, () => randomNormal(rng, 10, 2));
    const mean = samples.reduce((sum, v) => sum + v, 0) / samples.length;
    const variance = samples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / samples.length;
    expect(mean).toBeCloseTo(10, 0);
    expect(Math.sqrt(variance)).toBeCloseTo(2, 0);
  });
});

describe("clamp", () => {
  it("clamps values to the given range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
