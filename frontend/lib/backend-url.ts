const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export function backendEndpoint(path: string) {
  return new URL(path.replace(/^\/+/, ""), `${backendUrl.replace(/\/+$/, "")}/`)
}
