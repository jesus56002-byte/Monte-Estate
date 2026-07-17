import { cn } from "@/lib/utils";

/**
 * Twin-roof "M" mark matching the Monte Estate brand icon: a bold, chunky
 * roofline (thick round stroke, not a thin line) with a chimney block and a
 * 2x2 window grid tucked under each peak — same proportions as the source
 * logo artwork, just recolored via currentColor for light/dark contexts.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 32"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path
        d="M3 28V16.5L11 7.5L18 15L25 7.5L33 16.5V28"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="26.8" y="2" width="3.6" height="8" rx="1" fill="currentColor" />
      <g fill="var(--brand-lavender)">
        <rect x="7.6" y="19.4" width="3" height="3" rx="0.7" />
        <rect x="11.4" y="19.4" width="3" height="3" rx="0.7" />
        <rect x="7.6" y="23.2" width="3" height="3" rx="0.7" />
        <rect x="11.4" y="23.2" width="3" height="3" rx="0.7" />
        <rect x="21.6" y="19.4" width="3" height="3" rx="0.7" />
        <rect x="25.4" y="19.4" width="3" height="3" rx="0.7" />
        <rect x="21.6" y="23.2" width="3" height="3" rx="0.7" />
        <rect x="25.4" y="23.2" width="3" height="3" rx="0.7" />
      </g>
    </svg>
  );
}

export function Logo({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={cn("size-8 text-primary", iconClassName)} />
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-primary">monte</span>
        <span className="text-[10px] font-medium tracking-[0.2em] text-lavender">— estate —</span>
      </span>
    </span>
  );
}
