import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevents the site from being framed by another origin (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          // Stops the browser from MIME-sniffing a response away from its declared Content-Type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Sends the origin, not the full URL (with query strings), on cross-origin requests.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Deny access to browser features this app never uses.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // A real Content-Security-Policy is deliberately not set here — this app loads
          // Stripe Checkout, Google/Facebook OAuth, and Vercel Analytics, and a
          // half-tested CSP is a worse failure mode (silently broken checkout/login)
          // than no CSP. Write and test one deliberately if this becomes a requirement.
        ],
      },
    ];
  },
};

export default nextConfig;
