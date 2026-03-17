import React from "react";

export function Logo({ className = "w-48 h-auto" }: { className?: string }) {
  // A mathematically generated 12-point starburst
  // Inner radius ~ 35, outer radius ~ 50
  // Centered at (100, 100)
  const cx = 100;
  const cy = 100;
  const outerR = 55;
  const innerR = 38;
  const points = 12;
  const starPoints = [];

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points; // Starting at 0
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    starPoints.push(`${x},${y}`);
  }

  const starPath = starPoints.join(" ");

  return (
    <svg
      viewBox="-40 30 280 145"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width="100%"
      height="100%"
      style={{ aspectRatio: "280 / 145", display: "block" }}
    >
      <g transform="translate(0, 0)">
        {/* Starburst Layer - Black Shadow / Outline */}
        <polygon
          points={starPath}
          fill="#1a1a1a"
          stroke="#1a1a1a"
          strokeWidth="6"
          strokeLinejoin="round"
          transform="translate(0, 6)" // Offset shadow downward
        />
        
        {/* Starburst Layer - Electric Pink */}
        <polygon
          points={starPath}
          fill="#ed1e79"
          stroke="#1a1a1a"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Text Layer Group - Rotated slightly */}
        <g transform="translate(100, 105) rotate(-4) scale(1.1)">
          {/* Text Shadow / Extrusion (Black) */}
          <text
            x="0"
            y="0"
            fontFamily="'Arial Black', 'Impact', sans-serif"
            fontSize="34"
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1a1a1a"
            stroke="#1a1a1a"
            strokeWidth="8"
            strokeLinejoin="round"
            transform="translate(3, 4)"
          >
            PriceWatch
          </text>
          
          {/* Text Inner (Cream) - using paint-order to put stroke behind fill */}
          <text
            x="0"
            y="0"
            fontFamily="'Arial Black', 'Impact', sans-serif"
            fontSize="34"
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fefaf0"
            stroke="#1a1a1a"
            strokeWidth="3"
            strokeLinejoin="round"
            paintOrder="stroke fill"
            style={{ letterSpacing: "-1px" }}
          >
            PriceWatch
          </text>
        </g>
      </g>
    </svg>
  );
}
