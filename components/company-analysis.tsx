import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, DollarSign, Package, Percent } from "lucide-react"

interface CompanyAnalysisProps {
  company: string
  data: {
    currentSize: number
    currentPrice: number
    priceChange: number
    sizeChange: number
    profitMargin: number
    marketShare: number
    recommendation: "shrink" | "maintain"
  }
  recommendation: "shrink" | "maintain"
}

export default function CompanyAnalysis({ company, data, recommendation }: CompanyAnalysisProps) {
  const logos = {
    "Milk Bikis": "🍪",
    "Good Day": "🍪",
    "Parle G": "🍘",
  }

  const logo = logos[company as keyof typeof logos] || "📊"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">{company}</CardTitle>
          <CardDescription>Shrinkflation Analysis</CardDescription>
        </div>
        <div className="text-4xl">{logo}</div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Current Size</span>
            </div>
            <span>{data.currentSize}ml/g</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Current Price</span>
            </div>
            <span>₹{data.currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Percent className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Profit Margin</span>
            </div>
            <span>{data.profitMargin}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ArrowDown className={`mr-2 h-4 w-4 ${data.sizeChange < 0 ? "text-red-500" : "text-muted-foreground"}`} />
              <span className="text-sm">Size Change</span>
            </div>
            <span className={data.sizeChange < 0 ? "text-red-500" : ""}>{data.sizeChange}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ArrowUp
                className={`mr-2 h-4 w-4 ${data.priceChange > 0 ? "text-amber-500" : "text-muted-foreground"}`}
              />
              <span className="text-sm">Price Change</span>
            </div>
            <span className={data.priceChange > 0 ? "text-amber-500" : ""}>
              {data.priceChange > 0 ? "+" : ""}
              {data.priceChange}%
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium">Optimal Strategy:</span>
            <Badge variant={recommendation === "shrink" ? "destructive" : "outline"}>
              {recommendation === "shrink" ? "Shrink Product" : "Maintain Size"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
