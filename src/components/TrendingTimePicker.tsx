import { cn } from "@/lib/utils";

export type TrendingPeriod = "daily" | "weekly" | "monthly";

const PERIODS: { key: TrendingPeriod; label: string }[] = [
  { key: "daily", label: "Today" },
  { key: "weekly", label: "This Week" },
  { key: "monthly", label: "This Month" },
];

interface TrendingTimePickerProps {
  value: TrendingPeriod;
  onChange: (period: TrendingPeriod) => void;
}

export function TrendingTimePicker({ value, onChange }: TrendingTimePickerProps) {
  return (
    <div className="flex items-center gap-0.5">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 btn-press",
            value === p.key
              ? "filter-pill-active"
              : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
