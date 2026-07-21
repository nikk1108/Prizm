import React from 'react';

interface PrizmLogoProps {
  className?: string;
  size?: number;
}

export const PrizmLogo: React.FC<PrizmLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`prizm-animated-logo ${className}`}
    >
      <defs>
        {/* Soft realistic amber background glow */}
        <radialGradient id="prizmAmberGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B56A3C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#B56A3C" stopOpacity="0" />
        </radialGradient>

        {/* Polished metal copper gradient */}
        <linearGradient id="prizmCopper" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D08755" />
          <stop offset="35%" stopColor="#B56A3C" />
          <stop offset="70%" stopColor="#8C4E26" />
          <stop offset="100%" stopColor="#D08755" />
        </linearGradient>

        {/* Titanium/Gunmetal gradient */}
        <linearGradient id="prizmTitanium" x1="15" y1="55" x2="85" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E2022" />
          <stop offset="50%" stopColor="#5C6670" />
          <stop offset="100%" stopColor="#2E3236" />
        </linearGradient>

        {/* Matte glass facet gradient */}
        <linearGradient id="prizmGlass" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.03" />
        </linearGradient>

        {/* Highlight reflections */}
        <linearGradient id="prizmHighlight" x1="50" y1="15" x2="50" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <style>{`
        .prizm-animated-logo {
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center;
          overflow: visible;
        }
        .prizm-animated-logo:hover {
          transform: translateY(-6px) rotate(10deg);
          filter: drop-shadow(0 20px 30px rgba(181, 106, 60, 0.25));
        }
        .prizm-glow {
          transition: opacity 1.2s ease, transform 1.2s ease;
          transform-origin: center;
        }
        .prizm-animated-logo:hover .prizm-glow {
          opacity: 0.85;
          transform: scale(1.15);
        }
        .prizm-facet {
          transition: opacity 0.8s ease, stroke-width 0.8s ease;
        }
        .prizm-animated-logo:hover .prizm-facet {
          stroke-width: 1.5px;
        }
      `}</style>

      {/* Ambient shadow glow */}
      <circle cx="50" cy="53" r="38" fill="url(#prizmAmberGlow)" className="prizm-glow" opacity="0.6" />

      {/* Futuristic Crystal Facets */}
      
      {/* Facet 1: Left-Top (Titanium Base) */}
      <polygon
        points="50,15 20,55 50,48"
        fill="url(#prizmTitanium)"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.9"
        className="prizm-facet"
      />

      {/* Facet 2: Right-Top (Copper Polished) */}
      <polygon
        points="50,15 80,55 50,48"
        fill="url(#prizmCopper)"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.95"
        className="prizm-facet"
      />

      {/* Facet 3: Left-Bottom (Matte Glass) */}
      <polygon
        points="20,55 50,85 50,48"
        fill="url(#prizmGlass)"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.8"
        className="prizm-facet"
      />

      {/* Facet 4: Right-Bottom (Refracted Copper-Glass mix) */}
      <polygon
        points="80,55 50,85 50,48"
        fill="url(#prizmCopper)"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.4"
        className="prizm-facet"
      />
      <polygon
        points="80,55 50,85 50,48"
        fill="url(#prizmGlass)"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.85"
        className="prizm-facet"
      />

      {/* Center Core Highlights simulating refracting light */}
      <polygon
        points="50,15 40,51 50,48"
        fill="url(#prizmHighlight)"
        opacity="0.7"
      />
      
      <polygon
        points="50,15 60,51 50,48"
        fill="#FFFFFF"
        opacity="0.15"
      />

      {/* Impossible geometry connecting nodes */}
      <line x1="50" y1="15" x2="50" y2="85" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.5" />
      <line x1="20" y1="55" x2="80" y2="55" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.3" />

      {/* Outer subtle metal ring border */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="url(#prizmCopper)"
        strokeWidth="1.5"
        strokeDasharray="40 10 10 10"
        opacity="0.3"
      />
    </svg>
  );
};

export default PrizmLogo;
