import { cn } from "@/lib/utils";

/**
 * Soft, decorative desert-meets-real-estate scene for the search page hero:
 * a saguaro, a house, and two lavender trees resting on two floating
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
        <path
          d="M116 220c-18 0-26-12-26-28v-36"
          fill="none"
          stroke="url(#pi-sage)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M126 198c18 0 26-12 26-28v-32"
          fill="none"
          stroke="url(#pi-sage)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <rect x="108" y="135" width="24" height="145" rx="12" fill="url(#pi-sage)" />
        <ellipse cx="70" cy="272" rx="20" ry="16" fill="url(#pi-sage)" />
      </g>

      {/* House */}
      <g>
        <path d="M270 176L330 120 390 176V180H270V176Z" fill="url(#pi-roof)" />
        <rect x="262" y="168" width="136" height="16" rx="6" fill="url(#pi-roof)" />
        <rect x="366" y="88" width="14" height="100" rx="3" fill="url(#pi-lav-soft)" />
        <rect x="278" y="182" width="104" height="98" rx="10" fill="url(#pi-wall)" />
        <rect x="312" y="228" width="36" height="52" rx="6" fill="url(#pi-roof)" />
        <circle cx="341" cy="254" r="2.2" fill="#fffdf9" />
        <g fill="url(#pi-lav)">
          <rect x="288" y="200" width="14" height="14" rx="3" />
          <rect x="358" y="200" width="14" height="14" rx="3" />
        </g>
      </g>

      {/* Small tree */}
      <g>
        <path d="M470 280V254" stroke="#8a5a3b" strokeWidth="6" strokeLinecap="round" />
        <circle cx="461" cy="248" r="15" fill="url(#pi-lav-soft)" />
        <circle cx="479" cy="244" r="18" fill="url(#pi-lav)" />
      </g>

      {/* Tree */}
      <g>
        <path d="M556 280V230" stroke="#8a5a3b" strokeWidth="8" strokeLinecap="round" />
        <path d="M556 246l-16-14M556 240l18-16" stroke="#8a5a3b" strokeWidth="6" strokeLinecap="round" />
        <circle cx="530" cy="204" r="26" fill="url(#pi-lav-soft)" />
        <circle cx="562" cy="192" r="32" fill="url(#pi-lav)" />
        <circle cx="588" cy="212" r="24" fill="url(#pi-lav-soft)" />
      </g>

      {/* Second tree */}
      <g>
        <path d="M680 280V236" stroke="#8a5a3b" strokeWidth="7" strokeLinecap="round" />
        <path d="M680 254l-15-13M680 248l17-15" stroke="#8a5a3b" strokeWidth="5" strokeLinecap="round" />
        <circle cx="658" cy="222" r="22" fill="url(#pi-lav-soft)" />
        <circle cx="686" cy="210" r="27" fill="url(#pi-lav)" />
        <circle cx="708" cy="228" r="20" fill="url(#pi-lav-soft)" />
      </g>
    </svg>
  );
}
