"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { getHistoricalData } from "@/lib/data"

export default function HistoricalTrends() {
  const sizeData = getHistoricalData("size")
  const priceData = getHistoricalData("price")
  const ratioData = getHistoricalData("ratio")

  return (
    <Tabs defaultValue="size">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="size">Product Size</TabsTrigger>
        <TabsTrigger value="price">Product Price</TabsTrigger>
        <TabsTrigger value="ratio">Price/Size Ratio</TabsTrigger>
      </TabsList>
      <TabsContent value="size">
        <Card>
          <CardContent className="pt-6">
            <ChartContainer
              config={{
                "Milk Bikis": {
                  label: "Milk Bikis",
                  color: "hsl(var(--chart-1))",
                },
                "Good Day": {
                  label: "Good Day",
                  color: "hsl(var(--chart-2))",
                },
                "Parle G": {
                  label: "Parle G",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={sizeData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `${value}ml/g`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="Milk Bikis" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Good Day" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Parle G" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="price">
        <Card>
          <CardContent className="pt-6">
            <ChartContainer
              config={{
                "Milk Bikis": {
                  label: "Milk Bikis",
                  color: "hsl(var(--chart-1))",
                },
                "Good Day": {
                  label: "Good Day",
                  color: "hsl(var(--chart-2))",
                },
                "Parle G": {
                  label: "Parle G",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={priceData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `₹${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="Milk Bikis" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Good Day" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Parle G" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="ratio">
        <Card>
          <CardContent className="pt-6">
            <ChartContainer
              config={{
                "Milk Bikis": {
                  label: "Milk Bikis",
                  color: "hsl(var(--chart-1))",
                },
                "Good Day": {
                  label: "Good Day",
                  color: "hsl(var(--chart-2))",
                },
                "Parle G": {
                  label: "Parle G",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={ratioData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `₹${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="Milk Bikis" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Good Day" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Parle G" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
