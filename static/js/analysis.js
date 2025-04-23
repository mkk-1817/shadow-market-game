document.addEventListener("DOMContentLoaded", () => {
  // Initialize the analysis page
  initAnalysisPage()

  // Event listeners
  document.getElementById("yearSelector").addEventListener("change", function () {
    // Update URL with selected year
    const url = new URL(window.location)
    url.searchParams.set("year", this.value)
    window.history.pushState({}, "", url)

    // Load analysis data
    loadAnalysisData(this.value)
  })

  document.getElementById("runAnalysisBtn").addEventListener("click", () => {
    const year = document.getElementById("yearSelector").value
    runAnalysis(year)
  })

  document.getElementById("exportDataBtn").addEventListener("click", () => {
    const year = document.getElementById("yearSelector").value
    exportData(year)
  })

  // Initialize analysis page
  async function initAnalysisPage() {
    try {
      // Load available years
      const years = await fetchYears()
      populateYearSelector(years)

      // Get year from URL or use latest
      const urlParams = new URLSearchParams(window.location.search)
      const yearParam = urlParams.get("year")

      const year = yearParam || years[years.length - 1]
      document.getElementById("yearSelector").value = year
      document.getElementById("analysisYear").textContent = year

      // Load analysis data
      await loadAnalysisData(year)
    } catch (error) {
      console.error("Error initializing analysis page:", error)
      alert("Failed to initialize analysis page. Please check the console for details.")
    }
  }

  // Fetch available years
  async function fetchYears() {
    const response = await fetch("/api/years")
    if (!response.ok) {
      throw new Error("Failed to fetch years")
    }
    return await response.json()
  }

  // Populate year selector dropdown
  function populateYearSelector(years) {
    const selector = document.getElementById("yearSelector")
    selector.innerHTML = ""

    years.forEach((year) => {
      const option = document.createElement("option")
      option.value = year
      option.textContent = year
      selector.appendChild(option)
    })
  }

  // Load analysis data for a specific year
  async function loadAnalysisData(year) {
    try {
      const response = await fetch(`/api/analysis/${year}`)
      if (!response.ok) {
        throw new Error("Failed to fetch analysis data")
      }

      const data = await response.json()
      updateAnalysisPage(data)
      updateLastUpdated(data.timestamp)

      // Update year in heading
      document.getElementById("analysisYear").textContent = year

      // Load charts
      loadPayoffHeatmap(year)
      loadMarketShareChart(year)
      loadPriceRatioChart(year)
    } catch (error) {
      console.error("Error loading analysis data:", error)
      alert("Failed to load analysis data. Please check the console for details.")
    }
  }

  // Run analysis for a specific year
  async function runAnalysis(year) {
    try {
      const runBtn = document.getElementById("runAnalysisBtn")
      runBtn.disabled = true
      runBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Running...'

      const response = await fetch(`/api/run-analysis/${year}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to run analysis")
      }

      const data = await response.json()
      updateAnalysisPage(data)
      updateLastUpdated(data.timestamp)

      // Reload charts
      loadPayoffHeatmap(year)
      loadMarketShareChart(year)
      loadPriceRatioChart(year)

      runBtn.disabled = false
      runBtn.innerHTML = '<i class="bi bi-play-fill"></i> Run Analysis'

      alert("Analysis completed successfully!")
    } catch (error) {
      console.error("Error running analysis:", error)
      alert("Failed to run analysis. Please check the console for details.")

      const runBtn = document.getElementById("runAnalysisBtn")
      runBtn.disabled = false
      runBtn.innerHTML = '<i class="bi bi-play-fill"></i> Run Analysis'
    }
  }

  // Update analysis page with data
  function updateAnalysisPage(data) {
    if (!data) {
      console.error("No data available to update the analysis page")
      return
    }
    
    // Update Nash equilibrium
    updateNashEquilibrium(data.nash_equilibrium || [])

    // Update strategy recommendations
    updateStrategyRecommendations(data.company_data || {})

    // Update key insights
    updateKeyInsights(data.insights || [])

    // Update economic factors
    updateEconomicFactors(data.economic_data || {})

    // Update consumer awareness
    updateConsumerAwareness(data.consumer_data || {})
  }

  // Update Nash equilibrium section
  function updateNashEquilibrium(equilibria) {
    const container = document.getElementById("nashEquilibrium")
    container.innerHTML = ""

    if (equilibria && equilibria.length > 0) {
      equilibria.forEach((eq) => {
        const item = document.createElement("div")
        item.className = "nash-equilibrium-item"
        item.textContent = eq
        container.appendChild(item)
      })
    } else {
      container.innerHTML = "<p class='text-muted'>No Nash equilibrium data available</p>"
    }
  }

  // Update strategy recommendations
  function updateStrategyRecommendations(companyData) {
    const container = document.getElementById("strategyRecommendations")
    container.innerHTML = ""

    const companies = ["Milk Bikis", "Good Day", "Parle G"]

    companies.forEach((company) => {
      const data = companyData[company]
      if (data && data.recommendation) {
        const badgeClass = data.recommendation === "shrink" ? "badge-shrink" : "badge-maintain"
        const recommendationText = data.recommendation === "shrink" ? "Shrink Product" : "Maintain Size"

        const item = document.createElement("div")
        item.className = "d-flex justify-content-between align-items-center mb-2"
        item.innerHTML = `
                  <span>${company}</span>
                  <span class="badge ${badgeClass}">${recommendationText}</span>
              `

        container.appendChild(item)
      } else {
        const item = document.createElement("div")
        item.className = "d-flex justify-content-between align-items-center mb-2"
        item.innerHTML = `
                  <span>${company}</span>
                  <span class="badge badge-secondary">No Data</span>
              `
        container.appendChild(item)
      }
    })
  }

  // Update key insights
  function updateKeyInsights(insights) {
    const container = document.getElementById("keyInsights")
    container.innerHTML = ""

    if (insights && insights.length > 0) {
      insights.forEach((insight) => {
        const item = document.createElement("div")
        item.className = "insight-item"
        item.textContent = insight
        container.appendChild(item)
      })
    } else {
      container.innerHTML = "<p class='text-muted'>No insights available</p>"
    }
  }

  // Update economic factors
  function updateEconomicFactors(economicData) {
    const container = document.getElementById("economicFactors")
    container.innerHTML = ""

    if (economicData && Object.keys(economicData).length > 0) {
      container.innerHTML = `
                <div class="market-condition">
                    <div class="market-condition-label">GDP Growth Rate</div>
                    <div class="market-condition-value">${economicData.gdp_growth_rate || 'N/A'}%</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Unemployment Rate</div>
                    <div class="market-condition-value">${economicData.unemployment_rate || 'N/A'}%</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Consumer Confidence</div>
                    <div class="market-condition-value">${economicData.consumer_confidence_index || 'N/A'}/100</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Interest Rate</div>
                    <div class="market-condition-value">${economicData.interest_rate || 'N/A'}%</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">FMCG Sector Growth</div>
                    <div class="market-condition-value">${economicData.fmcg_sector_growth || 'N/A'}%</div>
                </div>
            `
    } else {
      container.innerHTML = "<p class='text-muted'>No economic data available</p>"
    }
  }

  // Update consumer awareness
  function updateConsumerAwareness(consumerData) {
    const container = document.getElementById("consumerAwareness")
    container.innerHTML = ""

    if (consumerData && Object.keys(consumerData).length > 0) {
      // Calculate average brand loyalty
      const milkBikisLoyalty = consumerData.milk_bikis_brand_loyalty || 0
      const goodDayLoyalty = consumerData.good_day_brand_loyalty || 0
      const parleGLoyalty = consumerData.parle_g_brand_loyalty || 0
      const avgLoyalty = ((milkBikisLoyalty + goodDayLoyalty + parleGLoyalty) / 3).toFixed(1)

      container.innerHTML = `
                <div class="market-condition">
                    <div class="market-condition-label">Shrinkflation Awareness</div>
                    <div class="market-condition-value">${consumerData.shrinkflation_awareness || 'N/A'}%</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Social Media Mentions</div>
                    <div class="market-condition-value">${consumerData.social_media_mentions || 'N/A'}</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Negative Sentiment</div>
                    <div class="market-condition-value">${consumerData.negative_sentiment || 'N/A'}%</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Price vs Quantity Importance</div>
                    <div class="market-condition-value">${consumerData.price_vs_quantity_importance || 'N/A'}</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Brand Loyalty (Avg)</div>
                    <div class="market-condition-value">${avgLoyalty}/10</div>
                </div>
            `
    } else {
      container.innerHTML = "<p class='text-muted'>No consumer data available</p>"
    }
  }

  // Load payoff heatmap
  async function loadPayoffHeatmap(year) {
    try {
      const response = await fetch(`/api/generate-chart/payoff_heatmap/${year}`)
      if (!response.ok) {
        throw new Error("Failed to generate payoff heatmap")
      }

      const data = await response.json()

      const container = document.getElementById("payoffHeatmap")
      container.innerHTML = `<img src="${data.image}" alt="Payoff Heatmap" class="img-fluid">`
    } catch (error) {
      console.error("Error loading payoff heatmap:", error)
      const container = document.getElementById("payoffHeatmap")
      container.innerHTML = "<p class='text-danger'>Failed to load payoff heatmap</p>"
    }
  }

  // Load market share chart
  async function loadMarketShareChart(year) {
    try {
      const response = await fetch(`/api/generate-chart/market_share/${year}`)
      if (!response.ok) {
        throw new Error("Failed to generate market share chart")
      }

      const data = await response.json()

      const container = document.getElementById("marketShareChart")
      container.innerHTML = `<img src="${data.image}" alt="Market Share Chart" class="img-fluid">`
    } catch (error) {
      console.error("Error loading market share chart:", error)
      const container = document.getElementById("marketShareChart")
      container.innerHTML = "<p class='text-danger'>Failed to load market share chart</p>"
    }
  }

  // Load price ratio chart
  async function loadPriceRatioChart(year) {
    try {
      const response = await fetch(`/api/generate-chart/price_size_ratio/${year}`)
      if (!response.ok) {
        throw new Error("Failed to generate price/size ratio chart")
      }

      const data = await response.json()

      const container = document.getElementById("priceRatioChart")
      container.innerHTML = `<img src="${data.image}" alt="Price/Size Ratio Chart" class="img-fluid">`
    } catch (error) {
      console.error("Error loading price/size ratio chart:", error)
      const container = document.getElementById("priceRatioChart")
      container.innerHTML = "<p class='text-danger'>Failed to load price/size ratio chart</p>"
    }
  }

  // Update last updated timestamp
  function updateLastUpdated(timestamp) {
    const lastUpdatedElement = document.getElementById("lastUpdated")
    if (lastUpdatedElement && timestamp) {
      const date = new Date(timestamp)
      lastUpdatedElement.textContent = date.toLocaleString()
    }
  }

  // Export data
  async function exportData(year) {
    try {
      window.location.href = `/api/export-data/${year}`
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Failed to export data. Please check the console for details.")
    }
  }
})
