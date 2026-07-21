"use client"

import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  Cpu,
  Database,
  FileJson,
  Link2,
  UploadCloud,
  X,
} from "lucide-react"
import { useRef, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AasViewer } from "@/components/registry/aas-viewer"
import type { TreeNode } from "@/lib/aas/aas-types"
import { parseAasTree } from "@/lib/aas/parse-aas-tree"
import { dataTypes, frameworks, taskTypes } from "@/lib/registry-data"
import { cn } from "@/lib/utils"

/** Result of parsing an uploaded AAS file (fully client-side). */
type AasUpload =
  | { status: "empty" }
  | { status: "error"; fileName: string; message: string }
  | {
      status: "parsed"
      fileName: string
      fileSize: number
      tree: TreeNode
    }

const steps = [
  { id: 1, label: "AI Dataset 등록", icon: Database },
  { id: 2, label: "AI ModelNameplate 등록", icon: Cpu },
  { id: 3, label: "등록 내용 확인", icon: Check },
]

type DatasetForm = {
  title: string
  author: string
  version: string
  summary: string
  dataType: string
  task: string
  license: string
  keywords: string
}

type ModelForm = {
  title: string
  author: string
  version: string
  summary: string
  framework: string
  task: string
  license: string
  keywords: string
}

/** Registration exposes only two visibility-style licenses. */
const registrationLicenses = ["Public", "Internal"] as const

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

function GroupTitle({
  step,
  title,
  description,
}: {
  step: string
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-primary">{step}</span>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
    </div>
  )
}

function UploadZone({
  upload,
  onFile,
  onClear,
  label,
}: {
  upload: AasUpload
  onFile: (file: File) => void
  onClear: () => void
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    if (files && files.length > 0) onFile(files[0])
  }

  if (upload.status !== "empty") {
    const isError = upload.status === "error"
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border p-4",
          isError
            ? "border-destructive/40 bg-destructive/5"
            : "border-chart-2/40 bg-chart-2/5",
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            isError
              ? "bg-destructive/15 text-destructive"
              : "bg-chart-2/15 text-chart-2",
          )}
        >
          {isError ? (
            <AlertCircle className="size-5" />
          ) : (
            <FileJson className="size-5" />
          )}
        </span>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-medium">{upload.fileName}</span>
          {isError ? (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="size-3.5" />
              JSON 파싱 실패
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-chart-2">
              <CheckCircle2 className="size-3.5" />
              {label} 업로드 완료
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" aria-label="파일 제거" onClick={onClear}>
          <X data-icon="inline-start" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,.xml,application/json,application/xml,text/xml"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/5",
          dragging && "border-primary bg-primary/5",
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="size-6" />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            AAS Submodel 파일을 끌어다 놓거나 클릭하여 업로드
          </span>
          <span className="text-xs text-muted-foreground">JSON 또는 XML 형식 지원</span>
        </span>
      </button>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-pretty">{value || "—"}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main workflow                                                       */
/* ------------------------------------------------------------------ */

export function RegisterWorkflow() {
  const [activeStep, setActiveStep] = useState(1)

  const [dataset, setDataset] = useState<DatasetForm>({
    title: "",
    author: "",
    version: "v1.0",
    summary: "",
    dataType: "",
    task: "",
    license: "Internal",
    keywords: "",
  })
  const [datasetUpload, setDatasetUpload] = useState<AasUpload>({
    status: "empty",
  })

  const [model, setModel] = useState<ModelForm>({
    title: "",
    author: "",
    version: "v1.0",
    summary: "",
    framework: "",
    task: "",
    license: "Internal",
    keywords: "",
  })
  const [modelUpload, setModelUpload] = useState<AasUpload>({ status: "empty" })

  function goTo(step: number) {
    setActiveStep(step)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  /** Read, JSON.parse and convert the uploaded AAS file — fully client-side. */
  async function handleAasUpload(
    file: File,
    setUpload: (u: AasUpload) => void,
  ) {
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const tree = parseAasTree(json)
      setUpload({
        status: "parsed",
        fileName: file.name,
        fileSize: file.size,
        tree,
      })
    } catch {
      setUpload({
        status: "error",
        fileName: file.name,
        message:
          "AAS JSON 파일을 파싱할 수 없습니다. 올바른 JSON 형식인지 확인한 뒤 다시 업로드해 주세요.",
      })
    }
  }

  const inputBase = "h-10 rounded-lg"
  const textareaBase =
    "min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

  return (
    <div className="flex flex-col gap-10">
      {/* Step indicator */}
      <div className="sticky top-16 z-10 -mx-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-md md:-mx-8 md:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
          {steps.map((s, i) => {
            const active = activeStep === s.id
            const done = activeStep > s.id
            const Icon = s.icon
            return (
              <div key={s.id} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTo(s.id)}
                  className="flex items-center gap-2.5 text-left"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                      active && "border-primary bg-primary text-primary-foreground",
                      done && "border-chart-2 bg-chart-2 text-primary-foreground",
                      !active && !done && "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Step {s.id}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <span className="mx-1 hidden h-px flex-1 bg-border sm:block" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step 1 – Dataset */}
      {activeStep === 1 && (
      <Card className="p-6 md:p-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Database className="size-5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">AI Dataset 등록</h2>
              <p className="text-sm text-muted-foreground">
                기본 정보를 입력하고 AAS Submodel 파일을 업로드하세요.
              </p>
            </div>
          </div>

          {/* Basic information */}
          <div className="flex flex-col gap-5">
            <GroupTitle
              step="기본 정보"
              title="Basic Information"
              description="상세 기술 메타데이터는 업로드한 AAS Submodel에서 자동으로 추출됩니다."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="제목">
                <Input
                  className={inputBase}
                  value={dataset.title}
                  onChange={(e) => setDataset({ ...dataset, title: e.target.value })}
                  placeholder="예: 자동차 외관 이미지"
                />
              </Field>
              <Field label="작성자">
                <Input
                  className={inputBase}
                  value={dataset.author}
                  onChange={(e) => setDataset({ ...dataset, author: e.target.value })}
                  placeholder="예: 제조혁신팀"
                />
              </Field>
              <Field label="데이터 유형">
                <Select
                  value={dataset.dataType}
                  onValueChange={(v) => setDataset({ ...dataset, dataType: v as string })}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg">
                    <SelectValue placeholder="데이터 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="라이선스">
                <Select
                  value={dataset.license}
                  onValueChange={(v) => setDataset({ ...dataset, license: v as string })}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg">
                    <SelectValue placeholder="라이선스 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {registrationLicenses.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="개요" className="md:col-span-2">
                <textarea
                  className={textareaBase}
                  value={dataset.summary}
                  onChange={(e) => setDataset({ ...dataset, summary: e.target.value })}
                  placeholder="데이터셋에 대한 간단한 설명을 입력하세요."
                />
              </Field>
              <Field label="키워드" className="md:col-span-2">
                <Input
                  className={inputBase}
                  value={dataset.keywords}
                  onChange={(e) => setDataset({ ...dataset, keywords: e.target.value })}
                  placeholder="쉼표로 구분 (예: 외관검사, 자동차, 품질)"
                />
              </Field>
            </div>
          </div>

          {/* AAS upload */}
          <div className="flex flex-col gap-5">
            <GroupTitle
              step="AAS Submodel 업로드"
              title="AI Dataset AAS Submodel Upload"
              description="상세 메타데이터는 업로드 후 백엔드에서 자동으로 처리됩니다."
            />
            <UploadZone
              upload={datasetUpload}
              onFile={(file) => handleAasUpload(file, setDatasetUpload)}
              onClear={() => setDatasetUpload({ status: "empty" })}
              label="AAS Dataset Submodel"
            />

            {datasetUpload.status === "error" && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>AAS JSON을 읽을 수 없습니다</AlertTitle>
                <AlertDescription>{datasetUpload.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {datasetUpload.status === "parsed" && (
            <div className="border-t border-border pt-6">
              <AasViewer
                fileName={datasetUpload.fileName}
                fileSize={datasetUpload.fileSize}
                tree={datasetUpload.tree}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => goTo(2)}>
              건너뛰기
            </Button>
            <Button onClick={() => goTo(2)}>
              다음
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </Card>
      )}

      {/* Step 2 – ModelNameplate */}
      {activeStep === 2 && (
      <Card className="p-6 md:p-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cpu className="size-5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">AI ModelNameplate 등록</h2>
              <p className="text-sm text-muted-foreground">
                기본 정보를 입력하고 AAS Submodel 파일을 업로드하세요.
              </p>
            </div>
          </div>

          {/* Basic information */}
          <div className="flex flex-col gap-5">
            <GroupTitle
              step="기본 정보"
              title="Basic Information"
              description="상세 기술 메타데이터는 업로드한 AAS Submodel에서 자동으로 추출됩니다."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="제목">
                <Input
                  className={inputBase}
                  value={model.title}
                  onChange={(e) => setModel({ ...model, title: e.target.value })}
                  placeholder="예: YOLOv8 자동차 외관 검사"
                />
              </Field>
              <Field label="작성자">
                <Input
                  className={inputBase}
                  value={model.author}
                  onChange={(e) => setModel({ ...model, author: e.target.value })}
                  placeholder="예: 비전AI팀"
                />
              </Field>
              <Field label="Framework">
                <Select
                  value={model.framework}
                  onValueChange={(v) => setModel({ ...model, framework: v as string })}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg">
                    <SelectValue placeholder="Framework 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Task">
                <Select
                  value={model.task}
                  onValueChange={(v) => setModel({ ...model, task: v as string })}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg">
                    <SelectValue placeholder="Task 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="라이선스">
                <Select
                  value={model.license}
                  onValueChange={(v) => setModel({ ...model, license: v as string })}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg">
                    <SelectValue placeholder="라이선스 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {registrationLicenses.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="개요" className="md:col-span-2">
                <textarea
                  className={textareaBase}
                  value={model.summary}
                  onChange={(e) => setModel({ ...model, summary: e.target.value })}
                  placeholder="모델에 대한 간단한 설명을 입력하세요."
                />
              </Field>
              <Field label="키워드" className="md:col-span-2">
                <Input
                  className={inputBase}
                  value={model.keywords}
                  onChange={(e) => setModel({ ...model, keywords: e.target.value })}
                  placeholder="쉼표로 구분 (예: 실시간, 외관검사, YOLO)"
                />
              </Field>
            </div>
          </div>

          {/* AAS upload */}
          <div className="flex flex-col gap-5">
            <GroupTitle
              step="AAS Submodel 업로드"
              title="AI ModelNameplate AAS Submodel Upload"
              description="상세 메타데이터는 업로드 후 백엔드에서 자동으로 처리됩니다."
            />
            <UploadZone
              upload={modelUpload}
              onFile={(file) => handleAasUpload(file, setModelUpload)}
              onClear={() => setModelUpload({ status: "empty" })}
              label="AAS ModelNameplate Submodel"
            />

            {modelUpload.status === "error" && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>AAS JSON을 읽을 수 없습니다</AlertTitle>
                <AlertDescription>{modelUpload.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {modelUpload.status === "parsed" && (
            <div className="border-t border-border pt-6">
              <AasViewer
                fileName={modelUpload.fileName}
                fileSize={modelUpload.fileSize}
                tree={modelUpload.tree}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => goTo(1)}>
              <ArrowLeft data-icon="inline-start" />
              이전
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => goTo(3)}>
                건너뛰기
              </Button>
              <Button onClick={() => goTo(3)}>
                다음
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      )}

      {/* Step 3 – Review */}
      {activeStep === 3 && (
      <Card className="p-6 md:p-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Check className="size-5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">등록 내용 확인</h2>
              <p className="text-sm text-muted-foreground">
                입력한 내용과 업로드한 AAS Submodel을 확인하세요.
              </p>
            </div>
          </div>

          <div className="grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
            {/* Dataset summary */}
            <div className="flex flex-col gap-4 rounded-2xl border border-chart-3/30 bg-chart-3/5 p-6">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-chart-3/15 text-chart-3">
                  <Database className="size-4" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-chart-3">
                  AI Dataset
                </span>
              </div>
              <div className="flex flex-col divide-y divide-border/60">
                <SummaryRow label="제목" value={dataset.title} />
                <SummaryRow label="작성자" value={dataset.author} />
                <SummaryRow label="버전" value={dataset.version} />
                <SummaryRow label="데이터 유형" value={dataset.dataType} />
                <SummaryRow label="적용 Task" value={dataset.task} />
                <SummaryRow
                  label="업로드된 Submodel"
                  value={
                    datasetUpload.status !== "empty" ? datasetUpload.fileName : ""
                  }
                />
              </div>
            </div>

            {/* Relationship connector */}
            <div className="flex flex-row items-center justify-center gap-3 lg:flex-col">
              <span className="hidden text-xs font-medium text-muted-foreground lg:block">
                <Database className="size-4 text-chart-3" />
              </span>
              <ArrowDown className="hidden size-4 text-muted-foreground lg:block" />
              <Badge variant="secondary" className="gap-1.5 whitespace-nowrap">
                <Link2 className="size-3.5 text-primary" />
                Used for Training
              </Badge>
              <ArrowDown className="hidden size-4 text-muted-foreground lg:block" />
              <span className="hidden text-xs font-medium text-muted-foreground lg:block">
                <Cpu className="size-4 text-primary" />
              </span>
            </div>

            {/* Model summary */}
            <div className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Cpu className="size-4" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-primary">
                  AI ModelNameplate
                </span>
              </div>
              <div className="flex flex-col divide-y divide-border/60">
                <SummaryRow label="제목" value={model.title} />
                <SummaryRow label="작성자" value={model.author} />
                <SummaryRow label="버전" value={model.version} />
                <SummaryRow label="Framework" value={model.framework} />
                <SummaryRow label="Task" value={model.task} />
                <SummaryRow
                  label="업로드된 Submodel"
                  value={
                    modelUpload.status !== "empty" ? modelUpload.fileName : ""
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="outline" onClick={() => goTo(2)}>
              <ArrowLeft data-icon="inline-start" />
              이전
            </Button>
            <Button size="lg">
              <CheckCircle2 data-icon="inline-start" />
              등록 완료
            </Button>
          </div>
        </div>
      </Card>
      )}
    </div>
  )
}
