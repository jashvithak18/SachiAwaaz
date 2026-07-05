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
      viewBox="0 0 340 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ─── MONOGRAM (Pa + R) ─── */}
      <g id="monogram">
        {/* Devanagari 'Pa' Top horizontal bar */}
        <path
          d="M 125 45 L 205 45"
          stroke={textColor}
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Devanagari 'Pa' Left vertical stem & loop */}
        <path
          d="M 137 45 V 90 C 137 104 148 115 162 115 H 170"
          stroke={textColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 'Pa' Main vertical stem (longer, extends down) */}
        <path
          d="M 170 45 V 135"
          stroke={textColor}
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* 'R' Right loop */}
        <path
          d="M 170 45 C 205 45 208 88 170 94"
          stroke={textColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 'R' Diagonal leg (extends down-right) */}
        <path
          d="M 175 92 L 210 135"
          stroke={textColor}
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Terracotta Top-Right Accent */}
        <path
          d="M 197 43 C 197 39 217 39 217 43 Z"
          fill={accentColor}
        />

        {/* Fingerprint ridges inside the loop of the R */}
        <path
          d="M 178 81 C 183 75 192 75 197 81"
          stroke={accentColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 181 85 C 184 80 189 80 192 85"
          stroke={accentColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 184 89 C 186 86 188 86 189 89"
          stroke={accentColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* ─── WORDMARK P A R A K H ─── */}
      <g id="wordmark">
        {/* P */}
        <path d="M 65 152 V 175 M 65 152 H 72 C 77 152 80 156 80 160 C 80 164 77 167 72 167 H 65" stroke={textColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* A */}
        <path d="M 92 175 L 100 152 L 108 175" stroke={textColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Custom triangle crossbar for 'A' */}
        <path d="M 97 167 L 100 162 L 103 167 Z" fill={accentColor} />

        {/* R */}
        <path d="M 120 152 V 175 M 120 152 H 128 C 132 152 135 155 135 159 C 135 163 132 166 128 166 H 120 M 127 166 L 135 175" stroke={textColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* A */}
        <path d="M 148 175 L 156 152 L 164 175" stroke={textColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Custom triangle crossbar for 'A' */}
        <path d="M 153 167 L 156 162 L 159 167 Z" fill={accentColor} />

        {/* K */}
        <path d="M 176 152 V 175 M 190 152 L 177 164 M 181 164 L 190 175" stroke={textColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* H */}
        <path d="M 202 152 V 175 M 216 152 V 175 M 202 163.5 H 216" stroke={textColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* ─── TAGLINE ─── */}
      {showTagline && (
        <g id="tagline">
          {/* Divider line */}
          <path
            d="M 140 190 H 200"
            stroke={accentColor}
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Devanagari text 'सच की पहचान' */}
          <text
            x="170"
            y="212"
            textAnchor="middle"
            fill={accentColor}
            fontSize="14.5"
            fontWeight="500"
            style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
          >
            सच की पहचान
          </text>
        </g>
      )}
    </svg>
  );
}
