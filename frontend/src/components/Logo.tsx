import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  textColor?: string;
  accentColor?: string;
  height?: string | number;
  width?: string | number;
}

export default function Logo({
  className = "w-full h-auto",
  showTagline = true,
  textColor = "#181818",
  accentColor = "#96563B",
  height,
  width
}: LogoProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 340 235"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="r-loop-clip">
          <path d="M 170 45 C 208 45 210 88 170 94 Z" />
        </clipPath>
      </defs>

      {/* ─── MONOGRAM (Pa + R) ─── */}
      <g id="monogram">
        {/* Devanagari 'Pa' Top horizontal bar */}
        <path
          d="M 125 45 L 205 45"
          stroke={textColor}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Devanagari 'Pa' Left vertical stem & loop */}
        <path
          d="M 137 45 V 90 C 137 104 148 115 162 115 H 170"
          stroke={textColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 'Pa' Main vertical stem (longer, extends down) */}
        <path
          d="M 170 45 V 135"
          stroke={textColor}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 'R' Right loop */}
        <path
          d="M 170 45 C 208 45 210 88 170 94"
          stroke={textColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 'R' Diagonal leg (extends down-right) */}
        <path
          d="M 175 92 L 210 135"
          stroke={textColor}
          strokeWidth="6.5"
          strokeLinecap="round"
        />

        {/* Terracotta Top-Right Accent */}
        <path
          d="M 195 42 C 195 38 217 38 217 42 Z"
          fill={accentColor}
        />

        {/* ─── DETAILED FINGERPRINT RIDGES ─── */}
        <g id="fingerprint-ridges" clipPath="url(#r-loop-clip)">
          {/* Ridge 1 (Outer) */}
          <path
            d="M 173 78 C 173 53, 203 53, 203 78 C 203 86, 185 86, 185 91"
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Ridge 2 */}
          <path
            d="M 177 80 C 177 60, 199 60, 199 80 C 199 85, 185 85, 185 89"
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Ridge 3 */}
          <path
            d="M 181 82 C 181 67, 195 67, 195 82 C 195 84, 185 84, 185 87"
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Ridge 4 (Core) */}
          <path
            d="M 185 84 C 185 74, 191 74, 191 84 V 86"
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>

      {/* ─── BOLD GEOMETRIC WORDMARK P A R A K H ─── */}
      <g id="wordmark" style={{ userSelect: 'none' }}>
        {/* Rendering each letter individually with bold font and custom crossbars */}
        <text x="40" y="175" fill={textColor} fontSize="32" fontWeight="900" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>P</text>
        
        {/* A */}
        <text x="86" y="175" fill={textColor} fontSize="32" fontWeight="900" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>A</text>
        {/* Custom terracotta triangle crossbar for first 'A' */}
        <path d="M 97 167 L 102 159 L 107 167 Z" fill={accentColor} />

        <text x="134" y="175" fill={textColor} fontSize="32" fontWeight="900" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>R</text>
        
        {/* A */}
        <text x="182" y="175" fill={textColor} fontSize="32" fontWeight="900" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>A</text>
        {/* Custom terracotta triangle crossbar for second 'A' */}
        <path d="M 193 167 L 198 159 L 203 167 Z" fill={accentColor} />

        <text x="230" y="175" fill={textColor} fontSize="32" fontWeight="900" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>K</text>
        <text x="278" y="175" fill={textColor} fontSize="32" fontWeight="900" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>H</text>
      </g>

      {/* ─── TAGLINE ─── */}
      {showTagline && (
        <g id="tagline">
          {/* Divider line */}
          <path
            d="M 115 192 H 225"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Devanagari text 'सच की पहचान' */}
          <text
            x="170"
            y="222"
            textAnchor="middle"
            fill={accentColor}
            fontSize="22"
            fontWeight="bold"
            style={{ fontFamily: 'Noto Sans Devanagari, system-ui, sans-serif' }}
          >
            सच की पहचान
          </text>
        </g>
      )}
    </svg>
  );
}
