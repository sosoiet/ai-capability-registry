import type { Metadata } from "next"

import { RegisterWorkflow } from "@/components/register/register-workflow"

export const metadata: Metadata = {
  title: "AI 자산 등록 — AI Model Registry",
  description:
    "AI 데이터셋과 AI ModelNameplate의 기본 정보를 입력하고 AAS Submodel 파일을 업로드하여 레지스트리에 등록하세요.",
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col">
      {/* Page header */}
      <section className="border-b border-border bg-muted/30 px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
            AI 자산 등록
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
            AI Dataset과 AI ModelNameplate의 기본 정보를 입력하고, 각 AAS Submodel 파일을
            업로드하세요.
            <br />
            상세 메타데이터는 업로드 후 Submodel에서 자동으로 추출됩니다.
          </p>
        </div>
      </section>

      {/* Workflow */}
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <RegisterWorkflow />
      </div>
    </div>
  )
}
