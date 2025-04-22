"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CompanyAnalysis from "@/components/company-analysis"
import GameTheoryMatrix from "@/components/game-theory-matrix"
import HistoricalTrends from "@/components/historical-trends"
import { calculateOptimalStrategies } from "@/lib/game-theory"

export default function ShrinkflationDashboard() {
  const [year, setYear] = useState("2023")
  const [strategies, setStrategies] = useState(() => calculateOptimalStrategies("2023"))

  const handleYearChange = (value: string) => {
    setYear(value)
    setStrategies(calculateOptimalStrategies(value))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Shrinkflation Analysis Dashboard</h1>
        <p className="text-muted-foreground">
          Analyzing shrinkflation strategies for Milk Bikis, Good Day, and Parle G using game theory
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Select value={year} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2019">2019</SelectItem>
              <SelectItem value="2020">2020</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Analysis</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CompanyAnalysis
          company="Milk Bikis"
          data={strategies.milkBikis}
          recommendation={strategies.milkBikis.recommendation}
        />
        <CompanyAnalysis
          company="Good Day"
          data={strategies.goodDay}
          recommendation={strategies.goodDay.recommendation}
        />
        <CompanyAnalysis company="Parle G" data={strategies.parleG} recommendation={strategies.parleG.recommendation} />
      </div>

      <Tabs defaultValue="matrix">
        <TabsList>
          <TabsTrigger value="matrix">Game Theory Matrix</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          <TabsTrigger value="simulation">Market Simulation</TabsTrigger>
        </TabsList>
        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Theory Analysis</CardTitle>
              <CardDescription>Nash equilibrium and optimal strategies based on payoff matrices</CardDescription>
            </CardHeader>
            <CardContent>
              <GameTheoryMatrix data={strategies.matrix} year={year} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Shrinkflation Trends</CardTitle>
              <CardDescription>Product size and price changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <HistoricalTrends />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Simulation</CardTitle>
              <CardDescription>Simulated market outcomes based on different strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">Run simulation to see projected market outcomes</p>
              <div className="flex justify-center">
                <Button>Run Simulation</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
