import React from "react";

interface TeslaFixLogoProps {
  className?: string;
}

/**
 * TeslaFixLogo - Combines the provided blue_logo.png icon with
 * custom SVG typography for "TESLAFIX".
 * The background is removed, and colors adapt to the theme.
 */
const TeslaFixLogo: React.FC<TeslaFixLogoProps> = ({
  className = "w-full",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
    >
      {/* Icon Part: Using the provided blue_logo.png */}
      <div className="w-12 md:w-16 h-auto">
        <img
          src="/blue_logo.png"
          alt="Tesla Icon"
          className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-normal"
        />
      </div>

      {/* Typography Part: SVG "TESLAFIX" with custom lettering */}
      <svg
        viewBox="0 0 420 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <g className="fill-blue-700 dark:fill-blue-400 transition-colors duration-300">
          {/* T */}
          <path d="M10 10 H40 V15 H28 V45 H22 V15 H10 Z" />

          {/* E (Custom: 3 horizontal bars, no vertical stem) */}
          <g>
            <rect x="55" y="10" width="30" height="5" />
            <rect x="55" y="25" width="30" height="5" />
            <rect x="55" y="40" width="30" height="5" />
          </g>

          {/* S */}
          <path d="M100 18 C100 12 105 10 115 10 H125 V15 H115 C108 15 106 17 106 20 C106 24 110 25 120 27 C130 29 135 32 135 40 C135 48 128 50 115 50 H105 V45 H115 C123 45 129 43 129 40 C129 36 125 35 115 33 C105 31 100 28 100 18 Z" />

          {/* L */}
          <path d="M150 10 H156 V40 H175 V45 H150 Z" />

          {/* A (Custom: Inverted "V" shape, no horizontal crossbar) */}
          <path d="M190 45 L210 10 L230 45 H223 L210 22 L197 45 Z" />

          {/* F */}
          <path d="M245 10 H275 V15 H251 V25 H270 V30 H251 V45 H245 Z" />

          {/* I */}
          <path d="M290 10 H296 V45 H290 Z" />

          {/* X */}
          <path d="M315 10 H322 L335 25 L348 10 H355 L338 28 L355 45 H348 L335 31 L322 45 H315 L332 28 Z" />
        </g>
      </svg>
    </div>
  );
};

export default TeslaFixLogo;
