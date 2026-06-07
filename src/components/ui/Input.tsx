import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[#8fa899] uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`rounded-lg border px-3 py-2 text-sm text-[#e8f0ec] placeholder-[#546b5e] bg-[#161d19] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40 focus:border-[#22c55e]/50 disabled:opacity-50 transition-colors ${
          error ? "border-red-700 bg-red-900/10" : "border-[#2a3830]"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
