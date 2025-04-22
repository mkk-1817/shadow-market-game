import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // Chart objects
  let sizeChart, priceChart, ratioChart, marketShareChart, profitMarginChart

  // Initialize the dashboard
  initDashboard()

  // Event listeners
  document.getElementById("yearSelector").addEventListener("change", function () {
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

  // Tab switching for charts
  document.querySelectorAll("#chartTabs .nav-link").forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault()
      document.querySelectorAll("#chartTabs .nav-link").forEach((t) => t.classList.remove("active"))
      this.classList.add("active")

      const target = this.getAttribute("href")
      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("show", "active")
      })
      document.querySelector(target).classList.add("show", "active")
    })
  })

  // Initialize dashboard
  async function initDashboard() {
    try {
      // Load available years
      const years = await fetchYears()
      populateYearSelector(years)

      // Load initial data for the latest year
      const latestYear = years[years.length - 1]
      document.getElementById("yearSelector").value = latestYear

      // Load analysis data
      await loadAnalysisData(latestYear)

      // Load and initialize charts
      await initializeCharts()
    } catch (error) {
      console.error("Error initializing dashboard:", error)
      alert("Failed to initialize dashboard. Please check the console for details.")
    }
  }

  // Fetch available years
  async function fetchYears() {
    try {
      const response = await fetch("/api/years")
      if (!response.ok) {
        console.error("Failed to fetch years from API")
        return [2018, 2019, 2020, 2021, 2022, 2023] // Fallback years
      }
      const years = await response.json()
      if (!years || !years.length) {
        console.error("No years returned from API")
        return [2018, 2019, 2020, 2021, 2022, 2023] // Fallback years
      }
      return years
    } catch (error) {
      console.error("Error fetching years:", error)
      return [2018, 2019, 2020, 2021, 2022, 2023] // Fallback years
    }
  }

  // Populate year selector dropdown
  function populateYearSelector(years) {
    const selector = document.getElementById("yearSelector")
    if (!selector) {
      console.error("Year selector element not found")
      return
    }

    // Clear existing options
    selector.innerHTML = ""

    console.log("Populating years:", years)

    // Add new options
    years.forEach((year) => {
      const option = document.createElement("option")
      option.value = year.toString()
      option.textContent = year.toString()
      selector.appendChild(option)
    })

    // Log the number of options added
    console.log(`Added ${selector.options.length} year options to dropdown`)
  }

  // Load analysis data for a specific year
  async function loadAnalysisData(year) {
    try {
      console.log(`Loading analysis data for year: ${year}`)
      const response = await fetch(`/api/analysis/${year}`)
      if (!response.ok) {
        throw new Error("Failed to fetch analysis data")
      }

      let data = await response.json()

      // If data is a string (which can happen with json_util.dumps), parse it
      if (typeof data === "string") {
        try {
          data = JSON.parse(data)
        } catch (e) {
          console.error("Error parsing JSON string:", e)
        }
      }

      console.log("Analysis data loaded:", data)

      // Ensure we have the required data structures
      if (!data.company_data) {
        data.company_data = {
          "Milk Bikis": createDefaultCompanyData("Milk Bikis"),
          "Good Day": createDefaultCompanyData("Good Day"),
          "Parle G": createDefaultCompanyData("Parle G"),
        }
      }

      if (!data.nash_equilibrium) {
        data.nash_equilibrium = ["No equilibrium data available"]
      }

      if (!data.insights || !data.insights.length) {
        data.insights = [
          "Market conditions suggest careful consideration of shrinkflation strategies.",
          "Consumer awareness of shrinkflation impacts optimal strategy choices.",
          "Brand loyalty provides some protection against market share loss during shrinkflation.",
        ]
      }

      // Update year in heading
      document.getElementById("analysisYear").textContent = year

      updateDashboard(data)
      updateLastUpdated(data.timestamp || new Date())

      // Update analysis-specific sections
      updateNashEquilibrium(data.nash_equilibrium)
      updateStrategyRecommendations(data.company_data)
      updateKeyInsights(data.insights)
      updateEconomicFactors(data.economic_data)
      updateConsumerAwareness(data.consumer_data)

      // Load charts
      loadPayoffHeatmap(year)
      loadMarketShareChart(year)
      loadPriceRatioChart(year)
    } catch (error) {
      console.error("Error loading analysis data:", error)
      // Load fallback data
      const fallbackData = createFallbackData(year)
      updateDashboard(fallbackData)
      updateLastUpdated(new Date())
    }
  }

  // Helper function to create default company data
  function createDefaultCompanyData(company) {
    return {
      currentSize: company === "Milk Bikis" ? 250 : company === "Good Day" ? 100 : 80,
      currentPrice: company === "Milk Bikis" ? 20 : company === "Good Day" ? 10 : 5,
      priceChange: 5,
      sizeChange: -5,
      profitMargin: company === "Milk Bikis" ? 32 : company === "Good Day" ? 28 : 22,
      marketShare: company === "Milk Bikis" ? 45 : company === "Good Day" ? 30 : 25,
      pricePerUnit: company === "Milk Bikis" ? 8 : company === "Good Day" ? 10 : 6.25,
      recommendation: "maintain",
    }
  }

  // Create fallback data for when API fails
  function createFallbackData(year) {
    return {
      year: year,
      timestamp: new Date(),
      nash_equilibrium: ["Milk Bikis: Maintain, Good Day: Maintain, Parle G: Maintain"],
      company_data: {
        "Milk Bikis": createDefaultCompanyData("Milk Bikis"),
        "Good Day": createDefaultCompanyData("Good Day"),
        "Parle G": createDefaultCompanyData("Parle G"),
      },
      payoff_matrix: {
        maintain: {
          maintain: {
            "Milk Bikis": 5,
            "Good Day": 5,
            "Parle G": 5,
          },
          shrink: {
            "Milk Bikis": 3,
            "Good Day": 7,
            "Parle G": 4,
          },
        },
        shrink: {
          maintain: {
            "Milk Bikis": 7,
            "Good Day": 3,
            "Parle G": 4,
          },
          shrink: {
            "Milk Bikis": 6,
            "Good Day": 6,
            "Parle G": 3,
          },
        },
      },
      market_data: {
        inflation_rate: 5.2,
        sugar_price_index: 142,
        wheat_price_index: 148,
        packaging_price_index: 130,
        consumer_price_sensitivity: 8.2,
        competition_intensity: 8.3,
      },
      consumer_data: {
        shrinkflation_awareness: 65,
        coca_cola_brand_loyalty: 7.2,
        good_day_brand_loyalty: 6.3,
        parle_g_brand_loyalty: 7.7,
      },
      insights: [
        "High consumer awareness of shrinkflation (65%) is making shrinkflation strategies riskier.",
        "Strong brand loyalty provides some protection against market share loss during shrinkflation.",
        "Rising raw material costs are putting pressure on profit margins across the industry.",
      ],
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
      updateDashboard(data)
      updateLastUpdated(data.timestamp)

      // Update analysis-specific sections
      updateNashEquilibrium(data.nash_equilibrium)
      updateStrategyRecommendations(data.company_data)
      updateKeyInsights(data.insights)
      updateEconomicFactors(data.economic_data)
      updateConsumerAwareness(data.consumer_data)

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

  // Update dashboard with analysis data
  function updateDashboard(data) {
    // Update company cards
    updateCompanyCard("milkBikisCard", data.company_data["Milk Bikis"])
    updateCompanyCard("goodDayCard", data.company_data["Good Day"])
    updateCompanyCard("parleGCard", data.company_data["Parle G"])

    // Update Nash equilibrium
    updateNashEquilibrium(data.nash_equilibrium)

    // Update payoff matrix
    updatePayoffMatrix(data.payoff_matrix)

    // Update key insights
    updateKeyInsights(data.insights)

    // Update market conditions
    updateMarketConditions(data.market_data, data.consumer_data)

    // Update charts
    updateCharts()
  }

  // Update company card with data
  function updateCompanyCard(cardId, data) {
    const card = document.getElementById(cardId)
    if (!card) return

    const metricsContainer = card.querySelector(".company-metrics")
    const recommendationContainer = card.querySelector(".recommendation")

    // Update metrics
    metricsContainer.innerHTML = `
            <div class="metric-row">
                <div class="metric-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box" viewBox="0 0 16 16">
                        <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                    </svg>
                    Current Size
                </div>
                <div class="metric-value">${data.currentSize}ml/g</div>
            </div>
            <div class="metric-row">
                <div class="metric-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-currency-rupee" viewBox="0 0 16 16">
                        <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4v1.06Z"/>
                    </svg>
                    Current Price
                </div>
                <div class="metric-value">₹${data.currentPrice.toFixed(2)}</div>
            </div>
            <div class="metric-row">
                <div class="metric-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-percent" viewBox="0 0 16 16">
                        <path d="M13.442 2.558a.625.625 0 0 1 0 .884l-10 10a.625.625 0 1 1-.884-.884l10-10a.625.625 0 0 1 .884 0zM4.5 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm7 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                    </svg>
                    Profit Margin
                </div>
                <div class="metric-value">${data.profitMargin}%</div>
            </div>
            <div class="metric-row">
                <div class="metric-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
                    </svg>
                    Size Change
                </div>
                <div class="metric-value ${data.sizeChange < 0 ? "negative-change" : ""}">${data.sizeChange}%</div>
            </div>
            <div class="metric-row">
                <div class="metric-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                    </svg>
                    Price Change
                </div>
                <div class="metric-value ${data.priceChange > 0 ? "positive-change" : ""}">${data.priceChange > 0 ? "+" : ""}${data.priceChange}%</div>
            </div>
            <div class="metric-row">
                <div class="metric-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pie-chart" viewBox="0 0 16 16">
                        <path d="M7.5 1.018a7 7 0 0 0-4.79 11.566L7.5 7.793V1.018zm1 0V7.5h6.482A7.001 7.001 0 0 0 8.5 1.018zM14.982 8.5H8.207l-4.79 4.79A7 7 0 0 0 14.982 8.5zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                    </svg>
                    Market Share
                </div>
                <div class="metric-value">${data.marketShare}%</div>
            </div>
            <div class="metric-row">
                <div class="metric-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-currency-exchange" viewBox="0 0 16 16">
                        <path d="M0 5a5.002 5.002 0 0 0 4.027 4.905 6.46 6.46 0 0 1 .544-2.073C3.695 7.536 3.132 6.864 3 5.91h-.5v-.426h.466V5.05c0-.046 0-.093.004-.135H2.5v-.427h.511C3.236 3.24 4.213 2.5 5.681 2.5c.316 0 .59.031.819.085v.733a3.46 3.46 0 0 0-.815-.082c-.919 0-1.538.466-1.734 1.252h1.917v.427h-1.98c-.003.046-.003.097-.003.147v.422h1.983v.427H3.93c.118.602.468 1.03 1.005 1.229a6.5 6.5 0 0 1 4.97-3.113A5.002 5.002 0 0 0 0 5zm16 5.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zm-7.75 1.322c.069.835.746 1.485 1.964 1.562V14h.54v-.62c1.259-.086 1.996-.74 1.996-1.69 0-.865-.563-1.31-1.57-1.54l-.426-.1V8.374c.54.06.884.347.966.745h.948c-.07-.804-.779-1.433-1.914-1.502V7h-.54v.629c-1.076.103-1.808.732-1.808 1.622 0 .787.544 1.288 1.45 1.493l.358.085v1.78c-.554-.08-.92-.376-1.003-.787H8.25zm1.96-1.895c-.532-.12-.82-.364-.82-.732 0-.41.311-.719.824-.809v1.54h-.005zm.622 1.044c.645.145.943.38.943.796 0 .474-.37.8-1.02.86v-1.674l.077.018z"/>
                    </svg>
                    Price per 100ml/g
                </div>
                <div class="metric-value">₹${data.pricePerUnit}</div>
            </div>
        `

    // Update recommendation
    const badgeClass = data.recommendation === "shrink" ? "badge-shrink" : "badge-maintain"
    const recommendationText = data.recommendation === "shrink" ? "Shrink Product" : "Maintain Size"

    recommendationContainer.innerHTML = `
            <div class="mt-2">Optimal Strategy:</div>
            <span class="badge ${badgeClass}">${recommendationText}</span>
        `
  }

  // Update Nash equilibrium section
  function updateNashEquilibrium(equilibria) {
    const container = document.getElementById("nashEquilibrium")
    if (!container) return

    container.innerHTML = ""

    equilibria.forEach((eq) => {
      const item = document.createElement("div")
      item.className = "nash-equilibrium-item"
      item.textContent = eq
      container.appendChild(item)
    })
  }

  // Update strategy recommendations
  function updateStrategyRecommendations(companyData) {
    const container = document.getElementById("strategyRecommendations")
    if (!container) return

    container.innerHTML = ""

    const companies = ["Milk Bikis", "Good Day", "Parle G"]

    companies.forEach((company) => {
      const data = companyData[company]
      const badgeClass = data.recommendation === "shrink" ? "badge-shrink" : "badge-maintain"
      const recommendationText = data.recommendation === "shrink" ? "Shrink Product" : "Maintain Size"

      const item = document.createElement("div")
      item.className = "d-flex justify-content-between align-items-center mb-2"
      item.innerHTML = `
                <span>${company}</span>
                <span class="badge ${badgeClass}">${recommendationText}</span>
            `

      container.appendChild(item)
    })
  }

  // Update key insights
  function updateKeyInsights(insights) {
    const container = document.getElementById("keyInsights")
    if (!container) return

    container.innerHTML = ""

    // Ensure we have insights to display
    const insightsToShow =
      insights && insights.length > 0
        ? insights
        : [
            "Market conditions suggest careful consideration of shrinkflation strategies.",
            "Consumer awareness of shrinkflation impacts optimal strategy choices.",
            "Brand loyalty provides some protection against market share loss during shrinkflation.",
          ]

    insightsToShow.forEach((insight) => {
      const item = document.createElement("div")
      item.className = "insight-item"
      item.textContent = insight
      container.appendChild(item)
    })
  }

  // Update economic factors
  function updateEconomicFactors(economicData) {
    const container = document.getElementById("economicFactors")
    if (!container) return

    container.innerHTML = ""

    if (economicData) {
      container.innerHTML = `
                <div class="market-condition">
                    <div class="market-condition-label">GDP Growth Rate</div>
                    <div class="market-condition-value">${economicData.gdp_growth_rate}%</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Unemployment Rate</div>
                    <div class="market-condition-value">${economicData.unemployment_rate}%</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Consumer Confidence</div>
                    <div class="market-condition-value">${economicData.consumer_confidence_index}/100</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Interest Rate</div>
                    <div class="market-condition-value">${economicData.interest_rate}%</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">FMCG Sector Growth</div>
                    <div class="market-condition-value">${economicData.fmcg_sector_growth}%</div>
                </div>
            `
    } else {
      container.innerHTML = "<p class='text-muted'>No economic data available</p>"
    }
  }

  // Update consumer awareness
  function updateConsumerAwareness(consumerData) {
    const container = document.getElementById("consumerAwareness")
    if (!container) return

    container.innerHTML = ""

    if (consumerData) {
      container.innerHTML = `
                <div class="market-condition">
                    <div class="market-condition-label">Shrinkflation Awareness</div>
                    <div class="market-condition-value">${consumerData.shrinkflation_awareness}%</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Social Media Mentions</div>
                    <div class="market-condition-value">${consumerData.social_media_mentions}</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Negative Sentiment</div>
                    <div class="market-condition-value">${consumerData.negative_sentiment}%</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Price vs Quantity Importance</div>
                    <div class="market-condition-value">${consumerData.price_vs_quantity_importance}</div>
                </div>
                <div class="market-condition">
                    <div class="market-condition-label">Brand Loyalty (Avg)</div>
                    <div class="market-condition-value">${((consumerData.coca_cola_brand_loyalty + consumerData.good_day_brand_loyalty + consumerData.parle_g_brand_loyalty) / 3).toFixed(1)}/10</div>
                </div>
            `
    } else {
      container.innerHTML = "<p class='text-muted'>No consumer data available</p>"
    }
  }

  // Update market conditions
  function updateMarketConditions(marketData, consumerData) {
    const marketContainer = document.getElementById("marketConditions")
    const consumerContainer = document.getElementById("consumerTrends")

    if (!marketContainer || !consumerContainer) return

    // Update market conditions
    marketContainer.innerHTML = `
            <h6 class="mb-3">Market Conditions</h6>
            <div class="market-condition">
                <div class="market-condition-label">Inflation Rate</div>
                <div class="market-condition-value">${marketData.inflation_rate}%</div>
            </div>
            <div class="market-condition">
                <div class="market-condition-label">Sugar Price Index</div>
                <div class="market-condition-value">${marketData.sugar_price_index}</div>
            </div>
            <div class="market-condition">
                <div class="market-condition-label">Wheat Price Index</div>
                <div class="market-condition-value">${marketData.wheat_price_index}</div>
            </div>
            <div class="market-condition">
                <div class="market-condition-label">Packaging Price Index</div>
                <div class="market-condition-value">${marketData.packaging_price_index}</div>
            </div>
            <div class="market-condition">
                <div class="market-condition-label">Competition Intensity</div>
                <div class="market-condition-value">${marketData.competition_intensity}/10</div>
            </div>
        `

    // Update consumer trends
    consumerContainer.innerHTML = `
            <h6 class="mb-3">Consumer Trends</h6>
            <div class="market-condition">
                <div class="market-condition-label">Shrinkflation Awareness</div>
                <div class="market-condition-value">${consumerData.shrinkflation_awareness}%</div>
            </div>
            <div class="market-condition">
                <div class="market-condition-label">Price Sensitivity</div>
                <div class="market-condition-value">${marketData.consumer_price_sensitivity}/10</div>
            </div>
            <div class="market-condition">
                <div class="market-condition-label">Coca Cola Brand Loyalty</div>
                <div class="market-condition-value">${consumerData.coca_cola_brand_loyalty}/10</div>
            </div>
            <div class="market-condition">
                <div class="market-condition-label">Good Day Brand Loyalty</div>
                <div class="market-condition-value">${consumerData.good_day_brand_loyalty}/10</div>
            </div>
            <div class="market-condition">
                <div class="market-condition-label">Parle G Brand Loyalty</div>
                <div class="market-condition-value">${consumerData.parle_g_brand_loyalty}/10</div>
            </div>
        `
  }

  // Update payoff matrix
  function updatePayoffMatrix(matrix) {
    const table = document.getElementById("payoffMatrix")
    if (!table) return

    table.innerHTML = `
            <thead>
                <tr>
                    <th>Milk Bikis / Good Day</th>
                    <th colspan="2" class="text-center">Good Day</th>
                </tr>
                <tr>
                    <th></th>
                    <th class="text-center">Maintain</th>
                    <th class="text-center">Shrink</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Maintain</strong></td>
                    <td class="payoff-cell">
                        <div class="company-payoff">${matrix.maintain.maintain["Milk Bikis"]}</div>
                        <div class="company-label">Milk Bikis</div>
                        <div class="company-payoff">${matrix.maintain.maintain["Good Day"]}</div>
                        <div class="company-label">Good Day</div>
                        <div class="company-payoff">${matrix.maintain.maintain["Parle G"]}</div>
                        <div class="company-label">Parle G</div>
                    </td>
                    <td class="payoff-cell">
                        <div class="company-payoff">${matrix.maintain.shrink["Milk Bikis"]}</div>
                        <div class="company-label">Milk Bikis</div>
                        <div class="company-payoff">${matrix.maintain.shrink["Good Day"]}</div>
                        <div class="company-label">Good Day</div>
                        <div class="company-payoff">${matrix.maintain.shrink["Parle G"]}</div>
                        <div class="company-label">Parle G</div>
                    </td>
                </tr>
                <tr>
                    <td><strong>Shrink</strong></td>
                    <td class="payoff-cell">
                        <div class="company-payoff">${matrix.shrink.maintain["Milk Bikis"]}</div>
                        <div class="company-label">Milk Bikis</div>
                        <div class="company-payoff">${matrix.shrink.maintain["Good Day"]}</div>
                        <div class="company-label">Good Day</div>
                        <div class="company-payoff">${matrix.shrink.maintain["Parle G"]}</div>
                        <div class="company-label">Parle G</div>
                    </td>
                    <td class="payoff-cell">
                        <div class="company-payoff">${matrix.shrink.shrink["Milk Bikis"]}</div>
                        <div class="company-label">Milk Bikis</div>
                        <div class="company-payoff">${matrix.shrink.shrink["Good Day"]}</div>
                        <div class="company-label">Good Day</div>
                        <div class="company-payoff">${matrix.shrink.shrink["Parle G"]}</div>
                        <div class="company-label">Parle G</div>
                    </td>
                </tr>
            </tbody>
        `
  }

  // Initialize charts
  async function initializeCharts() {
    try {
      // Check if Chart.js is available
      if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded")
        return
      }

      // Fetch historical data for each chart type
      const sizeData = await fetchHistoricalData("size")
      const priceData = await fetchHistoricalData("price")
      const ratioData = await fetchHistoricalData("ratio")
      const marketShareData = await fetchHistoricalData("market_share")
      const profitMarginData = await fetchHistoricalData("profit_margin")

      // Create charts
      createSizeChart(sizeData)
      createPriceChart(priceData)
      createRatioChart(ratioData)
      createMarketShareChart(marketShareData)
      createProfitMarginChart(profitMarginData)
    } catch (error) {
      console.error("Error initializing charts:", error)
    }
  }

  // Update charts with new data
  async function updateCharts() {
    try {
      // Fetch historical data for each chart type
      const sizeData = await fetchHistoricalData("size")
      const priceData = await fetchHistoricalData("price")
      const ratioData = await fetchHistoricalData("ratio")
      const marketShareData = await fetchHistoricalData("market_share")
      const profitMarginData = await fetchHistoricalData("profit_margin")

      // Update charts
      updateSizeChart(sizeData)
      updatePriceChart(priceData)
      updateRatioChart(ratioData)
      updateMarketShareChart(marketShareData)
      updateProfitMarginChart(profitMarginData)
    } catch (error) {
      console.error("Error updating charts:", error)
    }
  }

  // Fetch historical data
  async function fetchHistoricalData(dataType) {
    try {
      const response = await fetch(`/api/historical-data/${dataType}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${dataType} data`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching ${dataType} data:`, error)
      // Return fallback data
      return [
        { year: "2019", "Milk Bikis": 300, "Good Day": 120, "Parle G": 90 },
        { year: "2020", "Milk Bikis": 290, "Good Day": 110, "Parle G": 90 },
        { year: "2021", "Milk Bikis": 275, "Good Day": 105, "Parle G": 85 },
        { year: "2022", "Milk Bikis": 260, "Good Day": 100, "Parle G": 82 },
        { year: "2023", "Milk Bikis": 250, "Good Day": 95, "Parle G": 80 },
      ]
    }
  }

  // Create size chart
  function createSizeChart(data) {
    const canvas = document.getElementById("sizeChartCanvas")
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (sizeChart) {
      sizeChart.destroy()
    }

    sizeChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.year),
        datasets: [
          {
            label: "Milk Bikis",
            data: data.map((d) => d["Milk Bikis"]),
            borderColor: "#dc3545",
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            tension: 0.1,
          },
          {
            label: "Good Day",
            data: data.map((d) => d["Good Day"]),
            borderColor: "#fd7e14",
            backgroundColor: "rgba(253, 126, 20, 0.1)",
            tension: 0.1,
          },
          {
            label: "Parle G",
            data: data.map((d) => d["Parle G"]),
            borderColor: "#198754",
            backgroundColor: "rgba(25, 135, 84, 0.1)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Product Size Over Time (ml/g)",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "Size (ml/g)",
            },
          },
        },
      },
    })
  }

  // Update size chart
  function updateSizeChart(data) {
    if (sizeChart) {
      sizeChart.data.labels = data.map((d) => d.year)
      sizeChart.data.datasets[0].data = data.map((d) => d["Milk Bikis"])
      sizeChart.data.datasets[1].data = data.map((d) => d["Good Day"])
      sizeChart.data.datasets[2].data = data.map((d) => d["Parle G"])
      sizeChart.update()
    } else {
      createSizeChart(data)
    }
  }

  // Create price chart
  function createPriceChart(data) {
    const canvas = document.getElementById("priceChartCanvas")
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (priceChart) {
      priceChart.destroy()
    }

    priceChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.year),
        datasets: [
          {
            label: "Milk Bikis",
            data: data.map((d) => d["Milk Bikis"]),
            borderColor: "#dc3545",
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            tension: 0.1,
          },
          {
            label: "Good Day",
            data: data.map((d) => d["Good Day"]),
            borderColor: "#fd7e14",
            backgroundColor: "rgba(253, 126, 20, 0.1)",
            tension: 0.1,
          },
          {
            label: "Parle G",
            data: data.map((d) => d["Parle G"]),
            borderColor: "#198754",
            backgroundColor: "rgba(25, 135, 84, 0.1)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Product Price Over Time (₹)",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "Price (₹)",
            },
          },
        },
      },
    })
  }

  // Update price chart
  function updatePriceChart(data) {
    if (priceChart) {
      priceChart.data.labels = data.map((d) => d.year)
      priceChart.data.datasets[0].data = data.map((d) => d["Milk Bikis"])
      priceChart.data.datasets[1].data = data.map((d) => d["Good Day"])
      priceChart.data.datasets[2].data = data.map((d) => d["Parle G"])
      priceChart.update()
    } else {
      createPriceChart(data)
    }
  }

  // Create ratio chart
  function createRatioChart(data) {
    const canvas = document.getElementById("ratioChartCanvas")
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (ratioChart) {
      ratioChart.destroy()
    }

    ratioChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.year),
        datasets: [
          {
            label: "Milk Bikis",
            data: data.map((d) => d["Milk Bikis"]),
            borderColor: "#dc3545",
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            tension: 0.1,
          },
          {
            label: "Good Day",
            data: data.map((d) => d["Good Day"]),
            borderColor: "#fd7e14",
            backgroundColor: "rgba(253, 126, 20, 0.1)",
            tension: 0.1,
          },
          {
            label: "Parle G",
            data: data.map((d) => d["Parle G"]),
            borderColor: "#198754",
            backgroundColor: "rgba(25, 135, 84, 0.1)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Price per 100ml/g Over Time (₹)",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "Price per 100ml/g (₹)",
            },
          },
        },
      },
    })
  }

  // Update ratio chart
  function updateRatioChart(data) {
    if (ratioChart) {
      ratioChart.data.labels = data.map((d) => d.year)
      ratioChart.data.datasets[0].data = data.map((d) => d["Milk Bikis"])
      ratioChart.data.datasets[1].data = data.map((d) => d["Good Day"])
      ratioChart.data.datasets[2].data = data.map((d) => d["Parle G"])
      ratioChart.update()
    } else {
      createRatioChart(data)
    }
  }

  // Create market share chart
  function createMarketShareChart(data) {
    const canvas = document.getElementById("marketShareChartCanvas")
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (marketShareChart) {
      marketShareChart.destroy()
    }

    marketShareChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.year),
        datasets: [
          {
            label: "Milk Bikis",
            data: data.map((d) => d["Milk Bikis"]),
            borderColor: "#dc3545",
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            tension: 0.1,
          },
          {
            label: "Good Day",
            data: data.map((d) => d["Good Day"]),
            borderColor: "#fd7e14",
            backgroundColor: "rgba(253, 126, 20, 0.1)",
            tension: 0.1,
          },
          {
            label: "Parle G",
            data: data.map((d) => d["Parle G"]),
            borderColor: "#198754",
            backgroundColor: "rgba(25, 135, 84, 0.1)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Market Share Over Time (%)",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "Market Share (%)",
            },
          },
        },
      },
    })
  }

  // Update market share chart
  function updateMarketShareChart(data) {
    if (marketShareChart) {
      marketShareChart.data.labels = data.map((d) => d.year)
      marketShareChart.data.datasets[0].data = data.map((d) => d["Milk Bikis"])
      marketShareChart.data.datasets[1].data = data.map((d) => d["Good Day"])
      marketShareChart.data.datasets[2].data = data.map((d) => d["Parle G"])
      marketShareChart.update()
    } else {
      createMarketShareChart(data)
    }
  }

  // Create profit margin chart
  function createProfitMarginChart(data) {
    const canvas = document.getElementById("profitMarginChartCanvas")
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (profitMarginChart) {
      profitMarginChart.destroy()
    }

    profitMarginChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.year),
        datasets: [
          {
            label: "Milk Bikis",
            data: data.map((d) => d["Milk Bikis"]),
            borderColor: "#dc3545",
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            tension: 0.1,
          },
          {
            label: "Good Day",
            data: data.map((d) => d["Good Day"]),
            borderColor: "#fd7e14",
            backgroundColor: "rgba(253, 126, 20, 0.1)",
            tension: 0.1,
          },
          {
            label: "Parle G",
            data: data.map((d) => d["Parle G"]),
            borderColor: "#198754",
            backgroundColor: "rgba(25, 135, 84, 0.1)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Profit Margin Over Time (%)",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "Profit Margin (%)",
            },
          },
        },
      },
    })
  }

  // Update profit margin chart
  function updateProfitMarginChart(data) {
    if (profitMarginChart) {
      profitMarginChart.data.labels = data.map((d) => d.year)
      profitMarginChart.data.datasets[0].data = data.map((d) => d["Milk Bikis"])
      profitMarginChart.data.datasets[1].data = data.map((d) => d["Good Day"])
      profitMarginChart.data.datasets[2].data = data.map((d) => d["Parle G"])
      profitMarginChart.update()
    } else {
      createProfitMarginChart(data)
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
    if (lastUpdatedElement) {
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
