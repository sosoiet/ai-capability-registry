import { cn } from "@/lib/utils"

export function StatTile({
  label,
  value,
  suffix,
  hint,
  accent,
}: {
  label: string
  value: string | number
  suffix?: string
  hint?: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border bg-card p-4",
        accent && "border-primary/30 bg-primary/5",
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="flex items-baseline gap-1">
        <span className={cn("text-2xl font-semibold tabular-nums", accent && "text-primary")}>
          {value}
        </span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
