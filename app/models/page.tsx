import type { Metadata } from "next"

import { ModelCard } from "@/components/registry/model-card"
import { models } from "@/lib/registry-data"

export const metadata: Metadata = {
  title: "AI Model — AI Model Registry",
  description: "등록된 AI 모델 목록을 탐색하세요.",
}

export default function ModelsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-2 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">AI Model</h1>
        <p className="max-w-2xl text-muted-foreground text-pretty">
          제조 현장의 문제를 해결하는 AI 모델 카탈로그입니다. 카드를 선택하면 모델의 성능,
          입출력, 생성 흐름, 연계 정보를 확인할 수 있습니다.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model, i) => (
          <ModelCard key={model.id} model={model} index={i} />
        ))}
      </div>
    </div>
  )
}
