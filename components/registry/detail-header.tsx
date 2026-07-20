"use client"

import { Download, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

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
import { cn } from "@/lib/utils"

export function DetailHeader({
  image,
  imageAlt,
  title,
  version,
  breadcrumb,
  tags,
  badges,
  stats,
  primaryAction,
  actions,
}: {
  image: string
  imageAlt: string
  title: string
  version: string
  breadcrumb: { label: string; href: string }
  tags: string[]
  badges: React.ReactNode
  stats?: { label: string; value: string; accent?: boolean }[]
  primaryAction?: { label: string; icon: typeof Download }
  /** Extra action buttons rendered alongside the favorite / primary action. */
  actions?: React.ReactNode
}) {
  const [favorite, setFavorite] = useState(false)
  const PrimaryIcon = primaryAction?.icon

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

      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 ring-1 ring-foreground/5 md:flex-row md:items-center md:p-5">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-muted md:aspect-square md:size-32">
          <Image src={image || "/placeholder.svg"} alt={imageAlt} fill className="object-cover" sizes="200px" />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {badges}
            <Badge variant="outline" className="font-mono">
              {version}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">{title}</h1>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="ghost" className="text-muted-foreground">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4 md:gap-5">
          {stats && stats.length > 0 && (
            <div className="flex items-center gap-4 md:gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <span
                    className={cn(
                      "text-lg font-semibold tabular-nums leading-none",
                      stat.accent ? "text-primary" : "text-foreground",
                    )}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
          {actions}
          <Button
            variant="outline"
            size="icon"
            aria-label="즐겨찾기"
            onClick={() => {
              setFavorite((v) => !v)
              toast.success(favorite ? "즐겨찾기에서 제거했습니다" : "즐겨찾기에 추가했습니다")
            }}
          >
            <Star className={cn("size-4", favorite && "fill-amber-400 text-amber-400")} />
          </Button>
          {primaryAction && PrimaryIcon && (
            <Button onClick={() => toast.info(`${primaryAction.label} 요청을 시작했습니다`)}>
              <PrimaryIcon data-icon="inline-start" />
              {primaryAction.label}
            </Button>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
