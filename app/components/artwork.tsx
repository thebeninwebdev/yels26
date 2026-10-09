// Lightweight abstract interpretation, isolated for replacement by approved media.
export function RibbonArtwork() {
  return (
    <div className="ribbon-art" aria-hidden="true">
      <svg viewBox="0 0 720 720" fill="none">
        <defs>
          <linearGradient
            id="ribbon"
            x1="140"
            y1="120"
            x2="570"
            y2="560"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00244b" />
            <stop offset=".19" stopColor="#00c7ff" />
            <stop offset=".29" stopColor="#1475ed" />
            <stop offset=".43" stopColor="#021129" />
            <stop offset=".62" stopColor="#064dda" />
            <stop offset=".75" stopColor="#43d4ff" />
            <stop offset=".87" stopColor="#064bb1" />
            <stop offset="1" stopColor="#00132b" />
          </linearGradient>
          <linearGradient
            id="edge"
            x1="170"
            y1="120"
            x2="500"
            y2="570"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7ee9ff" />
            <stop offset=".5" stopColor="#0085ff" />
            <stop offset="1" stopColor="#023464" />
          </linearGradient>
          <radialGradient id="halo">
            <stop stopColor="#006dff" stopOpacity=".26" />
            <stop offset="1" stopColor="#006dff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <circle cx="380" cy="360" r="330" fill="url(#halo)" />
        <g className="ribbon-float">
          <path
            d="M447 603C583 586 635 432 556 231C506 101 362 22 292 104C230 178 303 305 410 350C528 400 607 441 565 511C526 578 383 526 274 458C148 379 83 397 106 480C133 579 318 667 447 603Z"
            fill="url(#ribbon)"
            stroke="url(#edge)"
            strokeWidth="2"
          />
          <path
            d="M553 436C496 255 380 120 324 166C269 211 398 319 461 349L394 301C284 254 252 160 302 112C382 37 510 157 551 259C579 328 595 399 580 457Z"
            fill="url(#ribbon)"
            stroke="url(#edge)"
          />
          <path
            d="M143 532C57 430 115 251 223 258C330 265 420 447 558 482L579 550C426 555 303 360 208 335C138 316 109 427 143 532Z"
            fill="url(#ribbon)"
            stroke="url(#edge)"
            strokeWidth="2"
          />
          <path
            d="M114 425C123 329 166 290 219 299C333 319 422 498 565 516"
            stroke="#69dcff"
            strokeOpacity=".5"
            strokeWidth="2"
          />
        </g>
        <g className="orbit-float" transform="rotate(-38 378 367)">
          <ellipse
            cx="378"
            cy="367"
            rx="322"
            ry="97"
            stroke="#00ffaf"
            strokeWidth="6"
            filter="url(#glow)"
          />
          <ellipse
            cx="378"
            cy="367"
            rx="322"
            ry="97"
            stroke="#74ffd0"
            strokeWidth="2"
          />
          <circle cx="164" cy="440" r="13" fill="#00f7a6" filter="url(#glow)" />
          <circle cx="164" cy="440" r="7" fill="#abffe1" />
        </g>
      </svg>
    </div>
  );
}
export function HorizonArtwork({
  variant = "about",
}: {
  variant?: "about" | "bootcamp" | "stage";
}) {
  return (
    <div className={`horizon-art horizon-${variant}`} aria-hidden="true">
      <div className="horizon-glow" />
      <div className="horizon-grid" />
      <div className="horizon-ring ring-one" />
      <div className="horizon-ring ring-two" />
      <div className="horizon-ring ring-three" />
      <div className="horizon-line" />
    </div>
  );
}
