import { cn } from "@/lib/utils";

/** Twin-roof "M" mark echoing the Monte Estate brand icon — roofline in the current text color, windows in the brand accent. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 34 30"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path
        d="M2.5 27V15.5L10 6.5L17 15L24 6.5L31.5 15.5V27"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="26.5" y="2" width="3" height="7" rx="0.5" fill="currentColor" />
      <g fill="var(--accent)">
        <rect x="7" y="17.5" width="3.4" height="3.4" rx="0.5" />
        <rect x="11.4" y="17.5" width="3.4" height="3.4" rx="0.5" />
        <rect x="21" y="17.5" width="3.4" height="3.4" rx="0.5" />
        <rect x="25.4" y="17.5" width="3.4" height="3.4" rx="0.5" />
      </g>
    </svg>
  );
}

export function Logo({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-primary", className)}>
      <LogoMark className={cn("size-6", iconClassName)} />
      <span className="font-semibold tracking-tight text-foreground">Monte Estate</span>
    </span>
  );
}
