export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = "ApiError"
  }
}

function errorMessage(payload: unknown, status: number) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message
    if (typeof message === "string") return message
    if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
      return message.join(", ")
    }
  }
  return `Não foi possível concluir a solicitação (HTTP ${status}).`
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" })
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null)
    throw new ApiError(errorMessage(payload, response.status), response.status)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function apiRequest<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  return requestJson<T>(`/api/backend/${path.replace(/^\/+/, "")}`, {
    ...init,
    headers,
  }).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("memora:session-expired"))
    }
    throw error
  })
}

export type ApiDeck = {
  id: string
  nome: string
  descricao: string | null
  totalCartoes: number
  cartoesPendentes: number
  createdAt: string
  updatedAt: string
}

export type ApiCard = {
  id: string
  baralhoId: string
  frente: string
  verso: string
  facilidade: number
  repeticoes: number
  intervaloDias: number
  proximaRevisao: string
  ultimaRevisao: string | null
  createdAt: string
  updatedAt: string
}

export type ApiStats = {
  totalBaralhos: number
  totalCartoes: number
  cartoesEstudados: number
  taxaAcertoPorcentagem: number
  sequenciaDiasAtual: number
  periodoFiltro: string
  atividadeSemanal: { dia: string; total: number }[]
}
