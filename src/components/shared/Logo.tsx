interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

// 4x4 dot grid, top-left = (row 0, col 0).
// Color progression: muted gray (incomplete) -> green gradient (complete),
// reading like a "progress" sweep from top-left to bottom-right.
// Top-right dot is replaced by the checkmark glyph.
const GRID: (string | null)[][] = [
  ["#cfd8d3", "#cfd8d3", "#b9e8cb", null],
  ["#cfd8d3", "#8fdbb0", "#4fce8f", "#22c55e"],
  ["#aee7c7", "#4fce8f", "#22c55e", "#1a9c4a"],
  ["#7fdba8", "#34c97a", "#1a9c4a", "#0f7a3a"],
];

const SPACING = 9.5;
const OFFSET = 6.5;
const RADIUS = 3.6;

export function Logo({ size = 28, showWordmark = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {GRID.map((row, r) =>
          row.map((color, c) => {
            if (color === null) return null;
            return (
              <circle
                key={`${r}-${c}`}
                cx={OFFSET + c * SPACING}
                cy={OFFSET + r * SPACING}
                r={RADIUS}
                fill={color}
              />
            );
          })
        )}
        {/* Checkmark badge overlapping the top-right corner of the grid */}
        <circle cx={OFFSET + 3 * SPACING} cy={OFFSET} r={6.5} fill="#0b3d22" />
        <path
          d={`M${OFFSET + 3 * SPACING - 3} ${OFFSET} L${OFFSET + 3 * SPACING - 0.8} ${OFFSET + 2.2} L${OFFSET + 3 * SPACING + 3.2} ${OFFSET - 2.6}`}
          stroke="#eafff2"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showWordmark && (
        <span className="text-[#e8f0ec] font-semibold text-sm tracking-tight">Tickir</span>
      )}
    </div>
  );
}
