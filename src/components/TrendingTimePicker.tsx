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
    <div className="flex items-center gap-1 bg-muted/50 rounded-full p-0.5">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={cn(
            "text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full transition-all duration-200 font-medium",
            value === p.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
