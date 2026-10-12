import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { backendEndpoint } from "@/lib/backend-url"

type RouteContext = { params: Promise<{ path: string[] }> }

async function proxy(request: NextRequest, context: RouteContext) {
  const token = (await cookies()).get("accessToken")?.value
  if (!token) {
    return NextResponse.json({ message: "Sua sessão expirou. Entre novamente." }, { status: 401 })
  }

  const { path } = await context.params
  const target = backendEndpoint(path.map(encodeURIComponent).join("/"))
  target.search = new URL(request.url).search
  const headers = new Headers(request.headers)
  headers.delete("cookie")
  headers.delete("host")
  headers.delete("content-length")
  headers.set("Authorization", `Bearer ${token}`)

  try {
    const backendResponse = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
    })
    if (backendResponse.status === 401) (await cookies()).delete("accessToken")
    const responseHeaders = new Headers()
    const contentType = backendResponse.headers.get("content-type")
    if (contentType) responseHeaders.set("content-type", contentType)
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    })
  } catch {
    return NextResponse.json(
      { message: "Não foi possível conectar à API. Verifique se o back-end está em execução." },
      { status: 502 },
    )
  }
}

export const GET = proxy
export const POST = proxy
export const PATCH = proxy
export const DELETE = proxy
