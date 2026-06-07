interface BadgeProps {
  label: string;
  color?: "gray" | "green" | "yellow" | "red" | "blue" | "indigo";
}

const colors = {
  gray:   "bg-[#1c2620] text-[#8fa899] border border-[#2a3830]",
  green:  "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20",
  yellow: "bg-yellow-900/20 text-yellow-400 border border-yellow-800/30",
  red:    "bg-red-900/20 text-red-400 border border-red-800/30",
  blue:   "bg-blue-900/20 text-blue-400 border border-blue-800/30",
  indigo: "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20",
};

export function Badge({ label, color = "gray" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {(color === "green" || color === "indigo") && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block" />
      )}
      {label}
    </span>
  );
}
