"use client"

import * as React from "react"
import { GalleryImage } from "@/lib/types"
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  Cell
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Sparkles, BrainCircuit, BarChart3, PieChart } from "lucide-react"

interface InsightsProps {
  images: GalleryImage[]
}

export function Insights({ images }: InsightsProps) {
  const tagData = React.useMemo(() => {
    const counts: Record<string, number> = {}
    images.forEach(img => {
      img.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    })

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [images])

  const stats = React.useMemo(() => {
    const totalSize = images.reduce((acc, img) => acc + (img.size || 0), 0)
    const avgTags = images.length ? (images.reduce((acc, img) => acc + (img.tags?.length || 0), 0) / images.length).toFixed(1) : 0
    return {
      total: images.length,
      storage: (totalSize / (1024 * 1024)).toFixed(2),
      avgTags
    }
  }, [images])

  if (images.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
        No data available for AI analysis.
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full border-accent/20 bg-accent/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-accent" />
              AI Gallery Insights
            </CardTitle>
            <CardDescription>
              Analysis of your automatically tagged visual content.
            </CardDescription>
          </div>
          <Sparkles className="h-8 w-8 text-accent/20" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 pt-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Assets</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cloud Storage</p>
            <p className="text-2xl font-bold mt-1">{stats.storage} MB</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Density</p>
            <p className="text-2xl font-bold mt-1">{stats.avgTags} tags/img</p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Top AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] pt-4">
          <ChartContainer config={{ 
            count: { label: "Occurrences", color: "hsl(var(--accent))" } 
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={12}
                  width={80}
                />
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {tagData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--accent) / ${1 - (index * 0.1)})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <PieChart className="h-4 w-4" /> Top Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tagData.slice(0, 5).map((tag, i) => (
              <div key={tag.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent" style={{ opacity: 1 - (i * 0.15) }} />
                  <span className="text-sm font-medium">{tag.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{tag.count} photos</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
