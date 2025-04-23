type DataType = "size" | "price" | "ratio"

interface HistoricalDataPoint {
  year: string
  "Milk Bikis": number
  "Good Day": number
  "Parle G": number
}

export function getHistoricalData(type: DataType): HistoricalDataPoint[] {
  // In a real implementation, this would fetch data from an API or database

  if (type === "size") {
    return [
      { year: "2019", "Milk Bikis": 150, "Good Day": 120, "Parle G": 90 },
      { year: "2020", "Milk Bikis": 145, "Good Day": 110, "Parle G": 90 },
      { year: "2021", "Milk Bikis": 140, "Good Day": 100, "Parle G": 85 },
      { year: "2022", "Milk Bikis": 135, "Good Day": 100, "Parle G": 80 },
      { year: "2023", "Milk Bikis": 130, "Good Day": 100, "Parle G": 80 },
    ]
  } else if (type === "price") {
    return [
      { year: "2019", "Milk Bikis": 20, "Good Day": 8, "Parle G": 5 },
      { year: "2020", "Milk Bikis": 20, "Good Day": 8, "Parle G": 5 },
      { year: "2021", "Milk Bikis": 22, "Good Day": 9, "Parle G": 5 },
      { year: "2022", "Milk Bikis": 22, "Good Day": 10, "Parle G": 5 },
      { year: "2023", "Milk Bikis": 24, "Good Day": 10, "Parle G": 5 },
    ]
  } else {
    // Price per unit (ratio)
    return [
      { year: "2019", "Milk Bikis": 0.06, "Good Day": 0.067, "Parle G": 0.056 },
      { year: "2020", "Milk Bikis": 0.06, "Good Day": 0.073, "Parle G": 0.056 },
      { year: "2021", "Milk Bikis": 0.069, "Good Day": 0.09, "Parle G": 0.059 },
      { year: "2022", "Milk Bikis": 0.077, "Good Day": 0.1, "Parle G": 0.063 },
      { year: "2023", "Milk Bikis": 0.08, "Good Day": 0.1, "Parle G": 0.063 },
    ]
  }
}
