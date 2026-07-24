// Derived facet metadata for the Dataset / Model registry explorers.
// The base mock data (registry-data.ts) does not carry every marketplace
// dimension (access level, file formats, deployment targets, etc.), so we
// derive them here from real fields where possible and fall back to a stable
// hash of the item id so distributions look natural and filtering stays
// consistent across renders.

import {
  getDataset,
  getModelsByDataset,
  type Dataset,
  type Model,
} from "./registry-data"

/* ------------------------------------------------------------------ */
/* Deterministic helpers                                               */
/* ------------------------------------------------------------------ */

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

/* ------------------------------------------------------------------ */
/* Shared mappings                                                     */
/* ------------------------------------------------------------------ */

/** Korean dataType enum -> English marketplace "data / input type". */
function dataTypeToEnglish(dataType: string): string[] {
  switch (dataType) {
    case "이미지":
      return ["Image"]
    case "시계열":
      return ["Time-series", "Sensor"]
    case "정형 데이터":
      return ["Tabular"]
    case "텍스트":
      return ["Text"]
    case "오디오":
      return ["Sensor"]
    case "비디오":
      return ["Image"]
    case "멀티모달":
      return ["Image", "Text"]
    default:
      return ["Image"]
  }
}

function accessLevel(license: string, seed: string): string {
  const restricted = /NC|Internal|Proprietary|Restricted/i.test(license)
  if (!restricted) return "Public"
  // Split restricted licenses into Restricted / Private for coverage.
  return hashStr(`${seed}-access`) % 3 === 0 ? "Private" : "Restricted"
}

/* ------------------------------------------------------------------ */
/* Dataset facets                                                      */
/* ------------------------------------------------------------------ */

export const datasetFilterGroups = [
  {
    id: "task",
    label: "Task Suitability",
    options: [
      "Object Detection",
      "OCR",
      "Segmentation",
      "Classification",
      "Anomaly Detection",
      "Forecasting",
    ],
  },
  {
    id: "dataType",
    label: "Data Type",
    options: ["Image", "Sensor", "Tabular", "Time-series", "Text", "Log"],
  },
  {
    id: "domain",
    label: "Domain",
    options: [
      "Automotive Inspection",
      "Document Processing",
      "Equipment Monitoring",
      "PCB Inspection",
      "Manufacturing",
    ],
  },
  {
    id: "labelStatus",
    label: "Label Status",
    options: ["Labeled", "Unlabeled", "Partially Labeled"],
  },
  {
    id: "fileFormat",
    label: "File Format",
    options: ["JPG", "PNG", "CSV", "JSON", "Parquet", "TXT"],
  },
  {
    id: "access",
    label: "Access Level",
    options: ["Public", "Restricted", "Private"],
  },
  {
    id: "linked",
    label: "Linked Model",
    options: ["Linked", "Not Linked"],
  },
] as const

function datasetDomain(d: Dataset): string {
  if (d.task === "OCR") return "Document Processing"
  switch (d.industry) {
    case "자동차":
      return "Automotive Inspection"
    case "전자·반도체":
      return "PCB Inspection"
    case "기계·장비":
    case "에너지":
      return "Equipment Monitoring"
    default:
      return "Manufacturing"
  }
}

function datasetLabelStatus(d: Dataset): string {
  if (!d.labeled) return "Unlabeled"
  return hashStr(`${d.id}-label`) % 4 === 0 ? "Partially Labeled" : "Labeled"
}

function datasetFileFormats(d: Dataset): string[] {
  const formats: string[] = []
  const eng = dataTypeToEnglish(d.dataType)
  if (eng.includes("Image")) formats.push("JPG", "PNG")
  if (eng.includes("Tabular")) formats.push("CSV", "Parquet")
  if (eng.includes("Time-series") || eng.includes("Sensor")) formats.push("CSV", "Parquet")
  if (eng.includes("Text")) formats.push("TXT", "JSON")

  // Storage hints
  const ft = d.storage?.fileType?.toUpperCase()
  if (ft && ["JPG", "PNG", "CSV", "JSON", "PARQUET", "TXT"].includes(ft)) {
    formats.push(ft === "PARQUET" ? "Parquet" : ft)
  }
  const af = `${d.storage?.annotationFile ?? ""} ${d.storage?.annotationFormat ?? ""}`.toLowerCase()
  if (/json|coco/.test(af)) formats.push("JSON")
  if (/log|로그|이력/.test(`${d.name} ${d.tags.join(" ")}`)) formats.push("TXT")

  return uniq(formats)
}

function datasetDataTypeValues(d: Dataset): string[] {
  const values = dataTypeToEnglish(d.dataType)
  if (/log|로그|이력/.test(`${d.name} ${d.tags.join(" ")}`)) values.push("Log")
  return uniq(values)
}

function datasetTaskValues(d: Dataset): string[] {
  const values = [d.task as string]
  if (d.dataType === "시계열") values.push("Forecasting")
  return uniq(values)
}

export function datasetIsLinked(d: Dataset): boolean {
  return getModelsByDataset(d.id).length > 0
}

/** Facet values for a dataset, keyed by filter group id. */
export function datasetFacetValues(d: Dataset): Record<string, string[]> {
  return {
    task: datasetTaskValues(d),
    dataType: datasetDataTypeValues(d),
    domain: [datasetDomain(d)],
    labelStatus: [datasetLabelStatus(d)],
    fileFormat: datasetFileFormats(d),
    access: [accessLevel(d.license, d.id)],
    linked: [datasetIsLinked(d) ? "Linked" : "Not Linked"],
  }
}

/** Small metadata chips shown on a dataset card. */
export function datasetMetaChips(d: Dataset): string[] {
  const eng = datasetDataTypeValues(d)[0] ?? "Image"
  const label = datasetLabelStatus(d)
  const formats = datasetFileFormats(d).slice(0, 2).join("/")
  const access = accessLevel(d.license, d.id)
  return uniq([eng, label, formats, access])
}

export function datasetSampleCount(d: Dataset): number {
  return Number(d.totalSamples.replace(/[^0-9]/g, "")) || 0
}

export function datasetLinkedCount(d: Dataset): number {
  return getModelsByDataset(d.id).length
}

/* ------------------------------------------------------------------ */
/* Model facets                                                        */
/* ------------------------------------------------------------------ */

export const modelFilterGroups = [
  {
    id: "task",
    label: "Task",
    options: [
      "Object Detection",
      "OCR",
      "Classification",
      "Anomaly Detection",
      "Segmentation",
      "Forecasting",
    ],
  },
  {
    id: "inputType",
    label: "Input Type",
    options: ["Image", "Sensor", "Tabular", "Time-series", "Text", "Log"],
  },
  {
    id: "framework",
    label: "Framework",
    options: ["PyTorch", "TensorFlow", "ONNX", "scikit-learn", "Transformers"],
  },
  {
    id: "architecture",
    label: "Architecture",
    options: ["YOLO", "CNN", "LSTM", "Transformer", "Random Forest", "XGBoost"],
  },
  {
    id: "metric",
    label: "Performance Metric",
    options: ["Accuracy", "F1-score", "mAP@50", "RMSE", "MAE", "AUC"],
  },
  {
    id: "deployment",
    label: "Deployment Target",
    options: ["Cloud", "Edge", "On-premise", "Docker"],
  },
  {
    id: "access",
    label: "Access Level",
    options: ["Public", "Restricted", "Private"],
  },
] as const

function modelArchitectureValues(m: Model): string[] {
  const a = m.architecture
  const values: string[] = []
  if (/yolo/i.test(a)) values.push("YOLO")
  if (/lstm|rnn|gru/i.test(a)) values.push("LSTM")
  if (/transformer|bert|vit|segformer|gpt/i.test(a)) values.push("Transformer")
  if (/forest/i.test(a)) values.push("Random Forest")
  if (/xgb|boost/i.test(a)) values.push("XGBoost")
  if (/cnn|resnet|efficientnet|efficient|conv/i.test(a)) values.push("CNN")
  if (values.length === 0) values.push("CNN")
  return uniq(values)
}

function modelFrameworkValues(m: Model): string[] {
  const values: string[] = []
  const arch = modelArchitectureValues(m)
  if (arch.includes("Random Forest") || arch.includes("XGBoost")) {
    values.push("scikit-learn")
  }
  if (arch.includes("Transformer")) values.push("Transformers")
  switch (m.framework) {
    case "TensorRT":
      values.push("ONNX")
      break
    default:
      values.push(m.framework)
  }
  return uniq(values)
}

function modelMetricValues(m: Model): string[] {
  const values = ["Accuracy", "F1-score"]
  const names = m.metrics.map((x) => x.name.toLowerCase()).join(" ")
  if (/map/.test(names) || m.task === "Object Detection" || m.task === "Segmentation") {
    values.push("mAP@50")
  }
  if (/auc|roc/.test(names) || m.task === "Anomaly Detection") values.push("AUC")
  if (m.task === "Anomaly Detection") values.push("RMSE", "MAE")
  return uniq(values)
}

function modelDeploymentValues(m: Model): string[] {
  const values: string[] = []
  for (const env of m.supportedEnv) {
    if (/jetson|edge/i.test(env)) values.push("Edge")
    if (/server|on-?prem|factory/i.test(env)) values.push("On-premise")
    if (/onnx|docker|runtime|container/i.test(env)) values.push("Docker")
    if (/cloud|aws|gcp|azure/i.test(env)) values.push("Cloud")
  }
  if (m.featured) values.push("Cloud")
  if (values.length === 0) values.push("On-premise")
  return uniq(values)
}

function modelAccessLevel(m: Model): string {
  const ds = getDataset(m.datasetId)
  return accessLevel(ds?.license ?? "Public", m.id)
}

function modelInputTypeValues(m: Model): string[] {
  return dataTypeToEnglish(m.dataType)
}

/** Primary headline metric for a model card (task-dependent). */
export function modelPrimaryMetric(m: Model): { label: string; value: string } {
  switch (m.task) {
    case "Anomaly Detection":
      return { label: "AUC", value: (0.9 + m.f1 / 1000).toFixed(3) }
    case "Segmentation":
      return { label: "mIoU", value: (m.accuracy / 100).toFixed(3) }
    case "OCR":
      return { label: "CER", value: (1 - m.accuracy / 100).toFixed(3) }
    case "Classification":
      return { label: "Accuracy", value: (m.accuracy / 100).toFixed(3) }
    default:
      return { label: "mAP@50", value: (m.accuracy / 100).toFixed(3) }
  }
}

/** Facet values for a model, keyed by filter group id. */
export function modelFacetValues(m: Model): Record<string, string[]> {
  return {
    task: [m.task as string],
    inputType: modelInputTypeValues(m),
    framework: modelFrameworkValues(m),
    architecture: modelArchitectureValues(m),
    metric: modelMetricValues(m),
    deployment: modelDeploymentValues(m),
    access: [modelAccessLevel(m)],
  }
}

/** Deterministic engagement stats (base data has no downloads for models). */
export function modelStats(m: Model): { downloads: number; usage: number; likes: number } {
  const h = hashStr(m.id)
  return {
    downloads: 800 + (h % 9000),
    usage: 1200 + ((h >>> 3) % 14000),
    likes: 60 + ((h >>> 7) % 900),
  }
}

export function modelDate(m: Model): string {
  return m.versions?.[0]?.date ?? ""
}

/** Small metadata chips shown on a model card. */
export function modelMetaChips(m: Model): string[] {
  const framework = modelFrameworkValues(m)[0]
  const arch = modelArchitectureValues(m)[0]
  const input = modelInputTypeValues(m)[0]
  const access = modelAccessLevel(m)
  return uniq([framework, arch, input, access])
}
