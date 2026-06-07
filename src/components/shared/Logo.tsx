interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

// Dot grid color map matching the Tickir brand mark.
// Row/col indices: [row][col], 4x4 grid, top-left = (0,0)
const DOT_COLORS: (string | null)[][] = [
  ["#e5e9e7", "#e5e9e7", "#e5e9e7", null],   // top row — last cell replaced by checkmark
  ["#e5e9e7", "#e5e9e7", "#22c55e", null],
  ["#e5e9e7", "#22c55e", "#22c55e", null],
  ["#86e3b8", "#34d399", "#22c55e", "#16a34a"],
];

export function Logo({ size = 28, showWordmark = true, className = "" }: LogoProps) {
  const dot = size / 5; // dot diameter relative to grid box
  const gap = size / 12;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {DOT_COLORS.map((row, r) =>
          row.map((color, c) => {
            if (color === null) return null;
            const cx = 8 + c * 11;
            const cy = 8 + r * 11;
            return <circle key={`${r}-${c}`} cx={cx} cy={cy} r="3.4" fill={color} />;
          })
        )}
        {/* Checkmark overlapping top-right */}
        <path
          d="M30 17 L35.5 11.5 L46 1"
          stroke="#0f4d2e"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(-2, 9)"
          fill="none"
        />
      </svg>
      {showWordmark && <span className="text-[#e8f0ec] font-semibold text-sm tracking-tight">Tickir</span>}
    </div>
  );
}
