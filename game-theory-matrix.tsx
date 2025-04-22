"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GameTheoryMatrixProps {
  data: {
    payoffs: {
      [key: string]: {
        [key: string]: {
          [key: string]: number
        }
      }
    }
    nashEquilibrium: string[]
  }
  year: string
}

export default function GameTheoryMatrix({ data, year }: GameTheoryMatrixProps) {
  const strategies = ["maintain", "shrink"]
  const companies = ["Milk Bikis", "Good Day", "Parle G"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Nash Equilibrium</h3>
            <div className="space-y-2">
              {data.nashEquilibrium.map((strategy, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge variant="outline">{strategy}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Key Insights</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Companies tend to follow each other's shrinkflation strategies</li>
              <li>Consumer awareness impacts optimal strategy</li>
              <li>Market leaders set the trend for shrinkflation</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Milk Bikis</TableHead>
              <TableHead colSpan={2} className="text-center">
                Good Day
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead></TableHead>
              <TableHead className="text-center">Maintain</TableHead>
              <TableHead className="text-center">Shrink</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.map((mbStrategy) => (
              <TableRow key={mbStrategy}>
                <TableCell className="font-medium">
                  {mbStrategy.charAt(0).toUpperCase() + mbStrategy.slice(1)}
                </TableCell>
                {strategies.map((goodDayStrategy) => (
                  <TableCell key={goodDayStrategy} className="text-center">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-right border-r pr-2">
                        <div className="font-medium">
                          {data.payoffs[mbStrategy]?.[goodDayStrategy]?.["Milk Bikis"] || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Milk Bikis</div>
                      </div>
                      <div className="text-left pl-2">
                        <div className="font-medium">
                          {data.payoffs[mbStrategy]?.[goodDayStrategy]?.["Good Day"] || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Good Day</div>
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="overflow-x-auto mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Parle G</TableHead>
              <TableHead colSpan={2} className="text-center">
                Milk Bikis
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead></TableHead>
              <TableHead className="text-center">Maintain</TableHead>
              <TableHead className="text-center">Shrink</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.map((parleStrategy) => (
              <TableRow key={parleStrategy}>
                <TableCell className="font-medium">
                  {parleStrategy.charAt(0).toUpperCase() + parleStrategy.slice(1)}
                </TableCell>
                {strategies.map((mbStrategy) => (
                  <TableCell key={mbStrategy} className="text-center">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-right border-r pr-2">
                        <div className="font-medium">{data.payoffs[parleStrategy]?.[mbStrategy]?.["Parle G"] || 0}</div>
                        <div className="text-xs text-muted-foreground">Parle G</div>
                      </div>
                      <div className="text-left pl-2">
                        <div className="font-medium">
                          {data.payoffs[parleStrategy]?.[mbStrategy]?.["Milk Bikis"] || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Milk Bikis</div>
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
