import type { Metadata } from "next"

import { DatasetCard } from "@/components/registry/dataset-card"
import { datasets } from "@/lib/registry-data"

export const metadata: Metadata = {
  title: "AI Dataset — AI Model Registry",
  description: "등록된 AI 데이터셋 목록을 탐색하세요.",
}

export default function DatasetsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-2 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">AI Dataset</h1>
        <p className="max-w-2xl text-muted-foreground text-pretty">
          AI 모델 학습에 사용된 데이터셋입니다. 데이터의 구성, 품질, 그리고 어떤 모델에
          연계되어 있는지 확인할 수 있습니다.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {datasets.map((dataset, i) => (
          <DatasetCard key={dataset.id} dataset={dataset} index={i} />
        ))}
      </div>
    </div>
  )
}
