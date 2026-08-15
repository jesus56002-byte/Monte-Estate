"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { env, hasMetaPixel } from "@/lib/env";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Client-side only for now (no server-side Conversions API yet) — see
 * app/(app)/deals/actions.ts and app/(auth)/actions.ts for the funnel events
 * that would be the first candidates to move server-side later, since
 * client-side pixel fires undercount real conversions (ad/tracking
 * blockers), which also weakens Meta's own ad-delivery optimization.
 *
 * The base snippet below fires the initial PageView itself, matching Meta's
 * own install instructions — this component's effect only re-fires PageView
 * on later client-side navigations, since Next.js never reloads the page
 * (and therefore never re-runs the base snippet) when the route changes.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!hasMetaPixel) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  if (!hasMetaPixel) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${env.NEXT_PUBLIC_META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- Meta's own tracking pixel, not an optimizable app image */}
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
