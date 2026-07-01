import React from "react";

export default function NakshiBackground() {
  return (
    <div id="nakshi-embroidery-bg" className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Tiled Geometric Running Stitch Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M20 0v40M0 20h40" stroke="%23A67C52" stroke-width="1.2" stroke-dasharray="3,4" fill="none"/%3E%3C/svg%3E')`
        }}
      />

      <div className="absolute inset-0 opacity-15">
        {/* Top Left Corner Motif */}
      <svg
        className="absolute -top-16 -left-16 w-80 h-80 text-clay-accent"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4,4"
      >
        {/* Concentric stitched circles */}
        <circle cx="100" cy="100" r="80" />
        <circle cx="100" cy="100" r="60" />
        <circle cx="100" cy="100" r="40" />
        
        {/* Star burst radiating stitches */}
        <line x1="100" y1="20" x2="100" y2="180" />
        <line x1="20" y1="100" x2="180" y2="100" />
        <line x1="43.4" y1="43.4" x2="156.6" y2="156.6" />
        <line x1="43.4" y1="156.6" x2="156.6" y2="43.4" />

        {/* Traditional leaf shapes */}
        <path d="M 100 60 Q 120 80 100 100 Q 80 80 100 60 Z" />
        <path d="M 100 140 Q 120 120 100 100 Q 80 120 100 140 Z" />
        <path d="M 60 100 Q 80 120 100 100 Q 80 80 60 100 Z" />
        <path d="M 140 100 Q 120 120 100 100 Q 120 80 140 100 Z" />
      </svg>

      {/* Bottom Right Corner Motif */}
      <svg
        className="absolute -bottom-20 -right-20 w-96 h-96 text-accent"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="3,4"
      >
        <circle cx="100" cy="100" r="90" />
        <circle cx="100" cy="100" r="70" />
        <circle cx="100" cy="100" r="50" />
        
        {/* Intricate mandala-like stitches */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI) / 6;
          const x1 = 100 + 40 * Math.cos(angle);
          const y1 = 100 + 40 * Math.sin(angle);
          const x2 = 100 + 90 * Math.cos(angle);
          const y2 = 100 + 90 * Math.sin(angle);
          return (
            <React.Fragment key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} />
              <circle cx={x2} cy={y2} r="3" fill="none" />
            </React.Fragment>
          );
        })}
        {/* Wave border stitches */}
        <path d="M 10 100 Q 32.5 70 55 100 T 100 100 T 145 100 T 190 100" />
      </svg>

      {/* Traditional Kalka (Paisley) Folk Motif - Left Side */}
      <svg
        className="absolute top-1/3 -left-12 w-56 h-72 text-accent/15 pointer-events-none"
        viewBox="0 0 100 150"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="3,3"
      >
        {/* Outermost paisley frame */}
        <path d="M 50 140 C 10 140, 10 90, 30 60 C 45 40, 50 20, 50 10 C 50 20, 55 40, 70 60 C 90 90, 90 140, 50 140 Z" />
        <path d="M 50 120 C 25 120, 25 85, 40 65 C 48 50, 50 35, 50 25 C 50 35, 52 50, 60 65 C 75 85, 75 120, 50 120 Z" />
        {/* Inner stitched lotus flower */}
        <path d="M 50 110 Q 55 95 50 85 Q 45 95 50 110" />
        <path d="M 50 110 Q 65 100 50 85 Q 35 100 50 110" />
        <circle cx="50" cy="110" r="4" />
      </svg>

      {/* Traditional Rural Bangladeshi Village Landscape Motif (Padma waves, Nouka/Sailboat, Shongshar/Cottage, Palm Tree) */}
      <svg
        className="absolute top-[55%] -right-16 w-80 h-80 text-clay-accent/15 hidden lg:block pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="4,4"
      >
        {/* Paddy fields/river waves */}
        <path d="M 10 170 Q 50 160 100 170 T 190 170" />
        <path d="M 10 185 Q 50 175 100 185 T 190 185" />
        
        {/* traditional Bangladeshi sailboat (Nouka) */}
        <path d="M 110 160 L 160 160 L 170 145 L 100 145 Z" />
        <path d="M 135 145 L 135 110 L 165 130 Z" strokeWidth="1.5" />
        <path d="M 118 145 C 118 135, 148 135, 148 145" />

        {/* Village Cottage with straw roof */}
        <path d="M 20 160 L 20 130 L 60 130 L 60 160 Z" />
        <path d="M 15 130 L 40 105 L 65 130 Z" />
        <rect x="32" y="140" width="12" height="20" />

        {/* Rural Palm Tree */}
        <path d="M 75 160 Q 70 120 80 95" strokeWidth="1.8" />
        <path d="M 80 95 Q 60 90 55 105" />
        <path d="M 80 95 Q 70 80 65 85" />
        <path d="M 80 95 Q 85 75 90 80" />
        <path d="M 80 95 Q 95 85 100 100" />
        <path d="M 80 95 Q 85 95 80 115" />
      </svg>

      {/* Decorative vertical running stitch on the left edge */}
      <svg className="absolute left-4 top-0 bottom-0 w-4 h-full text-accent opacity-50" preserveAspectRatio="none">
        <line
          x1="8"
          y1="0"
          x2="8"
          y2="2000"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="8,6"
        />
      </svg>

      {/* Decorative vertical running stitch on the right edge */}
      <svg className="absolute right-4 top-0 bottom-0 w-4 h-full text-accent opacity-50" preserveAspectRatio="none">
        <line
          x1="8"
          y1="0"
          x2="8"
          y2="2000"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="8,6"
        />
      </svg>
      </div>
    </div>
  );
}
