import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Monte Estate — Real Estate Investment Analysis Tool";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          background: "#f7f7f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="76" height="68" viewBox="0 0 36 32" fill="none">
            <path
              d="M3 28V16.5L11 7.5L18 15L25 7.5L33 16.5V28"
              stroke="#cc4726"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <div style={{ fontSize: 76, fontWeight: 700, color: "#cc4726", letterSpacing: "-0.02em" }}>
              monte
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#8672e0", letterSpacing: 6 }}>
              — ESTATE —
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#3a3a3a",
            textAlign: "center",
            maxWidth: 880,
          }}
        >
          Cash flow, cap rate, IRR &amp; Monte Carlo simulation for real estate investors
        </div>
      </div>
    ),
    size
  );
}
