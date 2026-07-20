"use client"

import { Download, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { PreviousVersionNotice, VersionSelect } from "@/components/registry/version-select"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import type { VersionEntry } from "@/lib/registry-data"
import { cn } from "@/lib/utils"

type DetailHeaderProps = {
  image: string
  imageAlt: string
  title: string
  version: string
  /** Full version history. When it has more than one entry, a version selector is shown. */
  versions?: VersionEntry[]
  breadcrumb: {
    label: string
    href: string
  }
  tags: string[]
  badges: React.ReactNode
  stats?: {
    label: string
    value: string
    accent?: boolean
  }[]
  primaryAction?: {
    label: string
    icon: typeof Download
  }
  /** Extra action buttons rendered alongside the favorite / primary action. */
  actions?: React.ReactNode
}

export function DetailHeader({
  image,
  imageAlt,
  title,
  version,
  versions,
  breadcrumb,
  tags,
  badges,
  stats,
  primaryAction,
  actions,
}: DetailHeaderProps) {
  const [favorite, setFavorite] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(version)
  const PrimaryIcon = primaryAction?.icon

  const hasHistory = !!versions && versions.length > 1
  const latestVersion = versions?.[0]?.version ?? version
  const selectedEntry = versions?.find((item) => item.version === selectedVersion)
  const viewingPrevious = hasHistory && selectedVersion !== latestVersion

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={breadcrumb.href} />}>
              {breadcrumb.label}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-5 rounded-2xl border border-border bg-card p-4 ring-1 ring-foreground/5 md:grid-cols-[128px_minmax(0,1fr)_390px] md:items-stretch md:p-5">
        {/* 왼쪽: 썸네일 */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted md:aspect-square md:size-32">
          <Image
            src={image || "/placeholder.svg"}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="200px"
          />
        </div>

        {/* 가운데: 배지, 제목, 태그 */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {badges}

            {hasHistory ? (
              <VersionSelect
                versions={versions!}
                value={selectedVersion}
                onValueChange={setSelectedVersion}
              />
            ) : (
              <Badge variant="outline" className="font-mono">
                {version}
              </Badge>
            )}
          </div>

          <h1 className="mt-5 text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>

          <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="ghost"
                className="text-muted-foreground"
              >
                #{tag}
              </Badge>
            ))}
          </div>

          {viewingPrevious && selectedEntry && (
            <div className="mt-3">
              <PreviousVersionNotice entry={selectedEntry} />
            </div>
          )}
        </div>

        {/* 오른쪽: 액션 버튼 및 통계 */}
        <div className="flex min-w-0 flex-col">
          {/* 액션 버튼 */}
          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
            {actions}

            <Button
              variant="outline"
              size="icon"
              aria-label="즐겨찾기"
              aria-pressed={favorite}
              onClick={() => {
                setFavorite((current) => !current)

                toast.success(
                  favorite
                    ? "즐겨찾기에서 제거했습니다"
                    : "즐겨찾기에 추가했습니다",
                )
              }}
            >
              <Star
                className={cn(
                  "size-4",
                  favorite && "fill-amber-400 text-amber-400",
                )}
              />
            </Button>

            {primaryAction && PrimaryIcon && (
              <Button
                onClick={() =>
                  toast.info(`${primaryAction.label} 요청을 시작했습니다`)
                }
              >
                <PrimaryIcon data-icon="inline-start" />
                {primaryAction.label}
              </Button>
            )}
          </div>

          {/* 다운로드 수 / 즐겨찾기 수 */}
          {stats && stats.length > 0 && (
            <div className="flex flex-1 items-center justify-center py-5 md:py-0">
              <div className="flex items-center justify-center">
                {stats.map((stat, index) => {
                  const StatIcon = stat.label.includes("다운로드")
                    ? Download
                    : Star

                  return (
                    <div key={stat.label} className="flex items-center">
                      {index > 0 && (
                        <div className="mx-6 h-12 w-px shrink-0 bg-border" />
                      )}

                      <div className="flex min-w-32 items-center justify-center gap-3">
                        <StatIcon className="size-5 shrink-0 text-primary" />

                        <div>
                          <p
                            className={cn(
                              "text-xl font-semibold leading-none tabular-nums",
                              stat.accent
                                ? "text-primary"
                                : "text-foreground",
                            )}
                          >
                            {stat.value}
                          </p>

                          <p className="mt-1.5 whitespace-nowrap text-xs text-muted-foreground">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}