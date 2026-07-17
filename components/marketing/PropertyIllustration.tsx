import { cn } from "@/lib/utils";

/**
 * Soft, decorative desert-meets-real-estate scene for the search page hero:
 * a house, a saguaro, a lavender tree, and a mug resting on two floating
 * podiums. Purely illustrative — colors are literal brand hues, not design
 * tokens, since nothing here encodes data or needs theme remapping.
 */
export function PropertyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 760 340"
      fill="none"
      aria-hidden="true"
      className={cn("w-full", className)}
    >
      <defs>
        <linearGradient id="pi-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2683f" />
          <stop offset="1" stopColor="#c8461f" />
        </linearGradient>
        <linearGradient id="pi-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf9" />
          <stop offset="1" stopColor="#f7ecdd" />
        </linearGradient>
        <linearGradient id="pi-lav" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9f8eea" />
          <stop offset="1" stopColor="#7a67d6" />
        </linearGradient>
        <linearGradient id="pi-lav-soft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9befa" />
          <stop offset="1" stopColor="#a897ee" />
        </linearGradient>
        <linearGradient id="pi-sage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a3af7c" />
          <stop offset="1" stopColor="#828d5c" />
        </linearGradient>
        <linearGradient id="pi-podium" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe2d0" />
          <stop offset="1" stopColor="#f6cfb4" />
        </linearGradient>
      </defs>

      {/* Podiums */}
      <ellipse cx="250" cy="300" rx="235" ry="24" fill="url(#pi-podium)" />
      <ellipse cx="610" cy="298" rx="140" ry="20" fill="url(#pi-podium)" opacity="0.9" />

      {/* Contact shadows */}
      <ellipse cx="120" cy="284" rx="46" ry="8" fill="#5c3a24" opacity="0.08" />
      <ellipse cx="330" cy="286" rx="110" ry="10" fill="#5c3a24" opacity="0.1" />
      <ellipse cx="560" cy="282" rx="52" ry="8" fill="#5c3a24" opacity="0.08" />
      <ellipse cx="672" cy="280" rx="34" ry="7" fill="#5c3a24" opacity="0.07" />

      {/* Saguaro cactus */}
      <g>
        <rect x="104" y="150" width="26" height="130" rx="13" fill="url(#pi-sage)" />
        <path
          d="M104 210c-16 0-28-10-28-26v-16c0-9 7-16 16-16s16 7 16 16v14"
          fill="none"
          stroke="url(#pi-sage)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M130 226c18 0 30-11 30-28v-14c0-9-7-16-16-16s-16 7-16 16v18"
          fill="none"
          stroke="url(#pi-sage)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <ellipse cx="70" cy="272" rx="20" ry="16" fill="url(#pi-sage)" />
      </g>

      {/* House */}
      <g>
        <path d="M270 176L330 120 390 176V180H270V176Z" fill="url(#pi-roof)" />
        <rect x="262" y="168" width="136" height="16" rx="6" fill="url(#pi-roof)" />
        <rect x="368" y="96" width="14" height="34" rx="3" fill="url(#pi-lav-soft)" />
        <rect x="278" y="182" width="104" height="98" rx="10" fill="url(#pi-wall)" />
        <rect x="312" y="228" width="36" height="52" rx="6" fill="url(#pi-roof)" />
        <circle cx="341" cy="254" r="2.2" fill="#fffdf9" />
        <g fill="url(#pi-lav)">
          <rect x="288" y="200" width="14" height="14" rx="3" />
          <rect x="358" y="200" width="14" height="14" rx="3" />
        </g>
      </g>

      {/* Bush */}
      <g>
        <circle cx="470" cy="266" r="15" fill="url(#pi-lav-soft)" />
        <circle cx="486" cy="270" r="12" fill="url(#pi-lav-soft)" />
        <circle cx="458" cy="272" r="11" fill="url(#pi-lav-soft)" />
      </g>

      {/* Tree */}
      <g>
        <path d="M556 280V230" stroke="#8a5a3b" strokeWidth="8" strokeLinecap="round" />
        <path d="M556 246l-16-14M556 240l18-16" stroke="#8a5a3b" strokeWidth="6" strokeLinecap="round" />
        <circle cx="530" cy="204" r="26" fill="url(#pi-lav-soft)" />
        <circle cx="562" cy="192" r="32" fill="url(#pi-lav)" />
        <circle cx="588" cy="212" r="24" fill="url(#pi-lav-soft)" />
      </g>

      {/* Mug */}
      <g>
        <path
          d="M700 234c11 0 18 7 18 16s-7 16-18 16"
          fill="none"
          stroke="url(#pi-lav)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <rect x="644" y="220" width="56" height="52" rx="12" fill="url(#pi-lav)" />
        <rect x="644" y="220" width="56" height="12" rx="6" fill="#7a67d6" opacity="0.6" />
        <path d="M662 250l10-10 10 10z" fill="#fffdf9" />
        <rect x="668" y="250" width="8" height="8" fill="#fffdf9" />
      </g>
    </svg>
  );
}
