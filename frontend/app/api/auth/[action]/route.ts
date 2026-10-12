import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { backendEndpoint } from "@/lib/backend-url"

type RouteContext = { params: Promise<{ action: string }> }

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60,
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { action } = await context.params
  if (action === "logout") {
    const jar = await cookies()
    jar.delete("accessToken")
    return NextResponse.json({ ok: true })
  }

  if (action !== "login" && action !== "register") {
    return NextResponse.json({ message: "Ação de autenticação não encontrada." }, { status: 404 })
  }

  try {
    const body: unknown = await request.json()
    const endpoint = action === "login" ? "auth/login" : "auth/registro"
    const backendResponse = await fetch(backendEndpoint(endpoint), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const payload: unknown = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok) {
      return NextResponse.json(
        payload ?? { message: "O servidor retornou uma resposta inválida." },
        { status: backendResponse.status },
      )
    }

    if (action === "login") {
      if (
        !payload ||
        typeof payload !== "object" ||
        !("accessToken" in payload) ||
        typeof payload.accessToken !== "string"
      ) {
        return NextResponse.json(
          { message: "O servidor de autenticação não retornou um token válido." },
          { status: 502 },
        )
      }
      const jar = await cookies()
      jar.set("accessToken", payload.accessToken, cookieOptions)
    }

    return NextResponse.json(
      action === "login" ? { ok: true } : payload,
      { status: backendResponse.status },
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "A solicitação de autenticação é inválida." }, { status: 400 })
    }
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor de autenticação." },
      { status: 502 },
    )
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { action } = await context.params
  if (action !== "profile") {
    return NextResponse.json({ message: "Ação de autenticação não encontrada." }, { status: 404 })
  }

  const token = (await cookies()).get("accessToken")?.value
  if (!token) {
    return NextResponse.json({ message: "Sua sessão expirou. Entre novamente." }, { status: 401 })
  }

  try {
    const backendResponse = await fetch(backendEndpoint("auth/perfil"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    const payload: unknown = await backendResponse.json().catch(() => null)
    if (backendResponse.status === 401) (await cookies()).delete("accessToken")
    return NextResponse.json(
      payload ?? { message: "O servidor de autenticação retornou uma resposta inválida." },
      { status: backendResponse.status },
    )
  } catch {
    return NextResponse.json(
      { message: "Não foi possível verificar sua sessão no servidor." },
      { status: 502 },
    )
  }
}
