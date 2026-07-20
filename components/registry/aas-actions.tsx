"use client"

import Link from "next/link"
import { FileEdit, Network } from "lucide-react"
import { useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import type { AasEnvironment } from "@/lib/aas/aas-types"
import { type SeedVersionMeta, useAasVersions } from "@/lib/aas/aas-version-store"
import { parseAasTree } from "@/lib/aas/parse-aas-tree"
import { cn } from "@/lib/utils"
import { AasViewerDialog } from "./aas-viewer-dialog"

export function AasActions({
  entityId,
  entityKind,
  title,
  versionMeta,
  env,
}: {
  entityId: string
  entityKind: "model" | "dataset"
  title: string
  versionMeta: SeedVersionMeta[]
  env: AasEnvironment
}) {
  const versions = useAasVersions(entityId, () => parseAasTree(env), versionMeta)
  const [open, setOpen] = useState(false)

  const editHref = `/${entityKind}s/${entityId}/aas/edit`

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Network data-icon="inline-start" />
        AAS 구조 보기
      </Button>

      <Link
        href={editHref}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        <FileEdit data-icon="inline-start" />
        AAS 모델 수정
      </Link>

      <AasViewerDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        versions={versions}
      />
    </>
  )
}
