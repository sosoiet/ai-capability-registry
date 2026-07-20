"use client"

import type { TreeNode } from "@/lib/aas/aas-types"
import { AasTreeNode } from "./aas-tree-node"

export function AasTree({ root }: { root: TreeNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <AasTreeNode node={root} depth={0} defaultOpen />
    </div>
  )
}
