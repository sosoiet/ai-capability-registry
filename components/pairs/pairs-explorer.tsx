"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { useMemo, useState } from "react"

import { PairCard } from "@/components/pairs/pair-card"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  assetPairs,
  frameworks,
  licenses,
  taskTypes,
  type PairAccess,
  type PairValidation,
} from "@/lib/registry-data"
import { cn } from "@/lib/utils"

type SortKey = "latest" | "downloads" | "performance" | "used"

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "downloads", label: "다운로드순" },
  { key: "performance", label: "성능순" },
  { key: "used", label: "사용량순" },
]

const accessOptions: PairAccess[] = ["Public", "Restricted", "Private"]
const validationOptions: PairValidation[] = ["Validated", "Warnings", "Unvalidated"]

const validationLabel: Record<PairValidation, string> = {
  Validated: "검증 완료",
  Warnings: "주의",
  Unvalidated: "미검증",
}

function CheckboxRow({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string
  count?: number
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded-md py-1.5 text-left text-sm transition-colors hover:text-foreground"
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden="true">
            <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={cn("flex-1", checked ? "font-medium text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      {count !== undefined && <span className="text-xs tabular-nums text-muted-foreground/70">{count}</span>}
    </button>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-4">
      <span className="pb-1 text-sm font-semibold">{title}</span>
      {children}
    </div>
  )
}

export function PairsExplorer() {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("latest")
  const [tasks, setTasks] = useState<string[]>([])
  const [fw, setFw] = useState<string[]>([])
  const [lic, setLic] = useState<string[]>([])
  const [access, setAccess] = useState<string[]>([])
  const [validation, setValidation] = useState<string[]>([])

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const reset = () => {
    setTasks([])
    setFw([])
    setLic([])
    setAccess([])
    setValidation([])
    setQuery("")
  }

  const validatedCount = useMemo(
    () => assetPairs.filter((p) => p.validation === "Validated").length,
    [],
  )
  const downloadableCount = useMemo(() => assetPairs.filter((p) => p.downloadable).length, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = assetPairs.filter((p) => {
      if (q) {
        const hay = `${p.title} ${p.description} ${p.task} ${p.framework} ${p.tags.join(" ")}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (tasks.length && !tasks.includes(p.task)) return false
      if (fw.length && !fw.includes(p.framework)) return false
      if (lic.length && !lic.includes(p.license)) return false
      if (access.length && !access.includes(p.access)) return false
      if (validation.length && !validation.includes(p.validation)) return false
      return true
    })

    const sorted = [...result]
    switch (sort) {
      case "downloads":
        sorted.sort((a, b) => b.downloads - a.downloads)
        break
      case "performance":
        sorted.sort((a, b) => Number(b.metric.value) - Number(a.metric.value))
        break
      case "used":
        sorted.sort((a, b) => b.stars - a.stars)
        break
      default:
        break
    }
    return sorted
  }, [query, sort, tasks, fw, lic, access, validation])

  const hasFilters =
    tasks.length + fw.length + lic.length + access.length + validation.length > 0 || query.length > 0

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="border-b border-border bg-muted/30 px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">AI Asset Pairs</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
              표준화된 데이터셋–모델 페어를 살펴보세요. 각 페어는 하나의 AI 데이터셋과 하나의 AI 모델을
              AAS 메타데이터로 연결하며, 검증된 학습 이력을 함께 제공합니다.
            </p>
          </div>

          <div className="relative max-w-2xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="페어를 이름, Task, 프레임워크, 태그로 검색하세요"
              className="h-11 rounded-xl pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <StatChip label="전체 페어" value={assetPairs.length} />
            <StatChip label="검증 완료" value={validatedCount} />
            <StatChip label="다운로드 가능" value={downloadableCount} />
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-8 md:px-8">
        {/* Sidebar filters */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="size-4" />
                필터
              </span>
              <button
                type="button"
                onClick={reset}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                초기화
              </button>
            </div>

            <Separator className="mt-3" />

            <FilterGroup title="Task">
              {taskTypes.map((t) => (
                <CheckboxRow
                  key={t}
                  label={t}
                  count={assetPairs.filter((p) => p.task === t).length}
                  checked={tasks.includes(t)}
                  onToggle={() => toggle(tasks, setTasks, t)}
                />
              ))}
            </FilterGroup>
            <Separator />

            <FilterGroup title="Framework">
              {frameworks.map((f) => (
                <CheckboxRow
                  key={f}
                  label={f}
                  count={assetPairs.filter((p) => p.framework === f).length}
                  checked={fw.includes(f)}
                  onToggle={() => toggle(fw, setFw, f)}
                />
              ))}
            </FilterGroup>
            <Separator />

            <FilterGroup title="License">
              {licenses.map((l) => (
                <CheckboxRow
                  key={l}
                  label={l}
                  count={assetPairs.filter((p) => p.license === l).length}
                  checked={lic.includes(l)}
                  onToggle={() => toggle(lic, setLic, l)}
                />
              ))}
            </FilterGroup>
            <Separator />

            <FilterGroup title="Access Level">
              {accessOptions.map((a) => (
                <CheckboxRow
                  key={a}
                  label={a}
                  count={assetPairs.filter((p) => p.access === a).length}
                  checked={access.includes(a)}
                  onToggle={() => toggle(access, setAccess, a)}
                />
              ))}
            </FilterGroup>
            <Separator />

            <FilterGroup title="Validation Status">
              {validationOptions.map((v) => (
                <CheckboxRow
                  key={v}
                  label={validationLabel[v]}
                  count={assetPairs.filter((p) => p.validation === v).length}
                  checked={validation.includes(v)}
                  onToggle={() => toggle(validation, setValidation, v)}
                />
              ))}
            </FilterGroup>
          </div>
        </aside>

        {/* Results */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span>개의 Asset Pair
            </span>
            <div className="flex rounded-lg border border-border bg-card p-1">
              {sortOptions.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setSort(o.key)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    sort === o.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filtered.map((pair, i) => (
                <PairCard key={pair.id} pair={pair} index={i} />
              ))}
            </div>
          ) : (
            <Empty className="rounded-2xl border border-dashed border-border py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search className="size-5" />
                </EmptyMedia>
                <EmptyTitle>조건에 맞는 페어가 없습니다</EmptyTitle>
                <EmptyDescription>필터를 조정하거나 검색어를 변경해 보세요.</EmptyDescription>
              </EmptyHeader>
              {hasFilters && (
                <Button variant="outline" onClick={reset}>
                  필터 초기화
                </Button>
              )}
            </Empty>
          )}
        </div>
      </section>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value.toLocaleString()}</span>
    </span>
  )
}
