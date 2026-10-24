"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { apiRequest, type ApiDailyActivity } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

type Period = "7" | "30" | "90"

const chartConfig = {
  acertos: { label: "Acertos", color: "var(--primary)" },
  erros: { label: "Erros ou difíceis", color: "var(--destructive)" },
} satisfies ChartConfig

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", options).format(new Date(`${value}T12:00:00`))
}

export function ChartAreaInteractive() {
  const [period, setPeriod] = useState<Period>("30")
  const [result, setResult] = useState<{
    period: Period
    activity: ApiDailyActivity[]
    error: string | null
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    apiRequest<ApiDailyActivity[]>(`estatisticas/atividade?dias=${period}`)
      .then((result) => {
        if (!cancelled) setResult({ period, activity: result, error: null })
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setResult({
          period,
          activity: [],
          error: reason instanceof Error ? reason.message : "Não foi possível carregar a atividade.",
        })
      })
    return () => {
      cancelled = true
    }
  }, [period])

  const loading = result?.period !== period
  const error = loading ? null : result.error
  const activity = loading ? [] : result.activity
  const totalReviews = activity.reduce((total, day) => total + day.total, 0)
  const periodLabel = period === "7" ? "7 dias" : period === "30" ? "30 dias" : "90 dias"

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle>Atividade de revisão</CardTitle>
          <CardDescription>
            Acertos e erros registrados nos {periodLabel}. Difícil conta como não acertado.
          </CardDescription>
        </div>
        <Select value={period} onValueChange={(value) => {
          if (value === "7" || value === "30" || value === "90") setPeriod(value)
        }}>
          <SelectTrigger aria-label="Selecionar período das estatísticas" className="w-32" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dias</SelectItem>
            <SelectItem value="30">30 dias</SelectItem>
            <SelectItem value="90">90 dias</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6">
        {loading ? (
          <Skeleton aria-label="Carregando atividade de revisão" className="h-[250px] w-full" />
        ) : error ? (
          <p aria-live="polite" className="flex h-[250px] items-center justify-center text-center text-sm text-destructive">
            {error}
          </p>
        ) : totalReviews === 0 ? (
          <p className="flex h-[250px] items-center justify-center text-center text-sm text-muted-foreground">
            Nenhuma revisão registrada nos últimos {periodLabel}.
          </p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={activity} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="data"
                  minTickGap={32}
                  tickFormatter={(value: string) => formatDate(value, { day: "numeric", month: "short" })}
                  tickLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => formatDate(String(value), { day: "numeric", month: "long", year: "numeric" })}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="erros"
                  fill="var(--color-erros)"
                  fillOpacity={0.18}
                  stackId="revisoes"
                  stroke="var(--color-erros)"
                  type="monotone"
                />
                <Area
                  dataKey="acertos"
                  fill="var(--color-acertos)"
                  fillOpacity={0.28}
                  stackId="revisoes"
                  stroke="var(--color-acertos)"
                  type="monotone"
                />
              </AreaChart>
            </ChartContainer>
            <p className="pt-3 text-xs text-muted-foreground">
              {totalReviews} {totalReviews === 1 ? "revisão" : "revisões"} no período
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
