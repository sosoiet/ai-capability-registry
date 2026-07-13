"use client"

import { Cell, Label, Pie, PieChart } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { DatasetClass } from "@/lib/registry-data"

const palette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
]

export function DistributionChart({ data }: { data: DatasetClass[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const chartData = data.map((d, i) => ({
    ...d,
    fill: palette[i % palette.length],
  }))

  const config: ChartConfig = data.reduce((acc, d, i) => {
    acc[d.label] = { label: d.label, color: palette[i % palette.length] }
    return acc
  }, {} as ChartConfig)

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer config={config} className="mx-auto aspect-square max-h-[240px] w-full">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={62} strokeWidth={3}>
            {chartData.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-2xl font-semibold"
                      >
                        {total.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 22}
                        className="fill-muted-foreground text-xs"
                      >
                        전체 샘플
                      </tspan>
                    </text>
                  )
                }
                return null
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="flex flex-col gap-2">
        {chartData.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
              <span className="text-foreground">{d.label}</span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="tabular-nums">{d.value.toLocaleString()}</span>
              <span className="w-10 text-right tabular-nums">
                {((d.value / total) * 100).toFixed(1)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
