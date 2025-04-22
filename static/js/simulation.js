document.addEventListener("DOMContentLoaded", () => {
  // Store selected scenarios
  const selectedScenarios = []

  // Initialize the simulation page
  initSimulationPage()

  // Event listeners
  document.getElementById("yearSelector").addEventListener("change", () => {
    updateScenarioParams()
  })

  document.getElementById("scenarioType").addEventListener("change", () => {
    updateScenarioParams()
  })

  document.getElementById("addScenarioBtn").addEventListener("click", () => {
    addScenario()
  })

  document.getElementById("runSimulationBtn").addEventListener("click", () => {
    runSimulation()
  })

  // Initialize simulation page
  async function initSimulationPage() {
    try {
      // Load available years
      const years = await fetchYears()
      populateYearSelector(years)

      // Set initial year to latest
      const latestYear = years[years.length - 1]
      document.getElementById("yearSelector").value = latestYear

      // Initialize scenario parameters
      updateScenarioParams()
    } catch (error) {
      console.error("Error initializing simulation page:", error)
      alert("Failed to initialize simulation page. Please check the console for details.")
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

  // Update scenario parameters based on selected scenario type
  function updateScenarioParams() {
    const scenarioType = document.getElementById("scenarioType").value
    const paramsContainer = document.getElementById("scenarioParams")

    switch (scenarioType) {
      case "consumer_awareness":
        paramsContainer.innerHTML = `
                    <div class="mb-3">
                        <label for="awarenessChange" class="form-label">Awareness Change (%)</label>
                        <input type="range" class="form-range" id="awarenessChange" min="-20" max="20" value="10">
                        <div class="d-flex justify-content-between">
                            <span>-20%</span>
                            <span id="awarenessChangeValue">+10%</span>
                            <span>+20%</span>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="scenarioName" class="form-label">Scenario Name</label>
                        <input type="text" class="form-control" id="scenarioName" value="Increased Consumer Awareness">
                    </div>
                `

        // Add event listener for range input
        document.getElementById("awarenessChange").addEventListener("input", function () {
          const value = Number.parseInt(this.value)
          document.getElementById("awarenessChangeValue").textContent = value >= 0 ? `+${value}%` : `${value}%`
        })
        break

      case "economic_downturn":
        paramsContainer.innerHTML = `
                    <div class="mb-3">
                        <label for="downturnSeverity" class="form-label">Downturn Severity</label>
                        <select class="form-select" id="downturnSeverity">
                            <option value="1">Mild</option>
                            <option value="2" selected>Moderate</option>
                            <option value="3">Severe</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="scenarioName" class="form-label">Scenario Name</label>
                        <input type="text" class="form-control" id="scenarioName" value="Economic Downturn">
                    </div>
                `
        break

      case "raw_material_cost":
        paramsContainer.innerHTML = `
                    <div class="mb-3">
                        <label for="costChange" class="form-label">Cost Change (%)</label>
                        <input type="range" class="form-range" id="costChange" min="-20" max="40" value="15">
                        <div class="d-flex justify-content-between">
                            <span>-20%</span>
                            <span id="costChangeValue">+15%</span>
                            <span>+40%</span>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="scenarioName" class="form-label">Scenario Name</label>
                        <input type="text" class="form-control" id="scenarioName" value="Rising Raw Material Costs">
                    </div>
                `

        // Add event listener for range input
        document.getElementById("costChange").addEventListener("input", function () {
          const value = Number.parseInt(this.value)
          document.getElementById("costChangeValue").textContent = value >= 0 ? `+${value}%` : `${value}%`
        })
        break

      case "competitor_strategy":
        paramsContainer.innerHTML = `
                    <div class="mb-3">
                        <label for="competitorCompany" class="form-label">Company</label>
                        <select class="form-select" id="competitorCompany">
                            <option value="Coca Cola">Coca Cola</option>
                            <option value="Good Day">Good Day</option>
                            <option value="Parle G">Parle G</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="competitorStrategy" class="form-label">Strategy</label>
                        <select class="form-select" id="competitorStrategy">
                            <option value="shrink">Shrink Product</option>
                            <option value="maintain">Maintain Size</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="scenarioName" class="form-label">Scenario Name</label>
                        <input type="text" class="form-control" id="scenarioName" value="Competitor Strategy Change">
                    </div>
                `

        // Update scenario name when company or strategy changes
        document.getElementById("competitorCompany").addEventListener("change", updateCompetitorScenarioName)
        document.getElementById("competitorStrategy").addEventListener("change", updateCompetitorScenarioName)

        function updateCompetitorScenarioName() {
          const company = document.getElementById("competitorCompany").value
          const strategy = document.getElementById("competitorStrategy").value
          const strategyText = strategy === "shrink" ? "Shrinks Product" : "Maintains Size"
          document.getElementById("scenarioName").value = `${company} ${strategyText}`
        }

        // Initial update
        updateCompetitorScenarioName()
        break
    }
  }

  // Add scenario to selected scenarios
  function addScenario() {
    const scenarioType = document.getElementById("scenarioType").value
    const scenarioName = document.getElementById("scenarioName").value

    const scenarioData = {
      type: scenarioType,
      name: scenarioName,
    }

    // Add scenario-specific data
    switch (scenarioType) {
      case "consumer_awareness":
        scenarioData.change = Number.parseInt(document.getElementById("awarenessChange").value)
        break

      case "economic_downturn":
        scenarioData.severity = Number.parseInt(document.getElementById("downturnSeverity").value)
        break

      case "raw_material_cost":
        scenarioData.change = Number.parseInt(document.getElementById("costChange").value)
        break

      case "competitor_strategy":
        scenarioData.company = document.getElementById("competitorCompany").value
        scenarioData.strategy = document.getElementById("competitorStrategy").value
        break
    }

    // Add to selected scenarios
    selectedScenarios.push(scenarioData)

    // Update UI
    updateSelectedScenarios()
  }

  // Update selected scenarios UI
  function updateSelectedScenarios() {
    const container = document.getElementById("selectedScenarios")

    if (selectedScenarios.length === 0) {
      container.innerHTML = "<p class='text-muted'>No scenarios selected</p>"
      document.getElementById("runSimulationBtn").disabled = true
      return
    }

    container.innerHTML = ""
    selectedScenarios.forEach((scenario, index) => {
      const scenarioElement = document.createElement("div")
      scenarioElement.className = "scenario-item"
      scenarioElement.innerHTML = `
                <span class="remove-btn" data-index="${index}"><i class="bi bi-x-circle"></i></span>
                <strong>${scenario.name}</strong>
                <div class="text-muted small">${getScenarioDescription(scenario)}</div>
            `
      container.appendChild(scenarioElement)
    })

    // Add event listeners to remove buttons
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = Number.parseInt(this.getAttribute("data-index"))
        selectedScenarios.splice(index, 1)
        updateSelectedScenarios()
      })
    })

    // Enable run button
    document.getElementById("runSimulationBtn").disabled = false
  }

  // Get scenario description
  function getScenarioDescription(scenario) {
    switch (scenario.type) {
      case "consumer_awareness":
        const changeDirection = scenario.change >= 0 ? "Increase" : "Decrease"
        return `${changeDirection} consumer awareness by ${Math.abs(scenario.change)}%`

      case "economic_downturn":
        const severityText = ["", "Mild", "Moderate", "Severe"][scenario.severity]
        return `${severityText} economic downturn`

      case "raw_material_cost":
        const costDirection = scenario.change >= 0 ? "Increase" : "Decrease"
        return `${costDirection} raw material costs by ${Math.abs(scenario.change)}%`

      case "competitor_strategy":
        const strategyText = scenario.strategy === "shrink" ? "shrinks product" : "maintains size"
        return `${scenario.company} ${strategyText}`

      default:
        return ""
    }
  }

  // Run simulation
  async function runSimulation() {
    try {
      const year = document.getElementById("yearSelector").value

      // Disable run button and show loading
      const runBtn = document.getElementById("runSimulationBtn")
      runBtn.disabled = true
      runBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Running...'

      // Prepare simulation data
      const simulationData = {
        year: Number.parseInt(year),
        scenarios: selectedScenarios,
      }

      // Send request
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simulationData),
      })

      if (!response.ok) {
        throw new Error("Failed to run simulation")
      }

      const data = await response.json()

      // Display results
      displaySimulationResults(data.simulations)

      // Re-enable run button
      runBtn.disabled = false
      runBtn.innerHTML = '<i class="bi bi-play-fill"></i> Run Simulation'
    } catch (error) {
      console.error("Error running simulation:", error)
      alert("Failed to run simulation. Please check the console for details.")

      // Re-enable run button
      const runBtn = document.getElementById("runSimulationBtn")
      runBtn.disabled = false
      runBtn.innerHTML = '<i class="bi bi-play-fill"></i> Run Simulation'
    }
  }

  // Display simulation results
  function displaySimulationResults(simulations) {
    const container = document.getElementById("simulationResults")
    container.innerHTML = ""

    simulations.forEach((simulation) => {
      const resultElement = document.createElement("div")
      resultElement.className = "simulation-result"

      // Create result content
      resultElement.innerHTML = `
            <div class="simulation-scenario">
                <i class="bi bi-diagram-3"></i> ${simulation.scenario.name}
            </div>
            <div class="simulation-nash mb-3">
                <strong>Nash Equilibrium:</strong> ${simulation.result.nash_equilibrium[0] || "No clear equilibrium found"}
            </div>
            <div class="mb-3">
                <strong>Recommended Strategies:</strong>
                <div class="simulation-recommendations">
                    <span class="badge ${simulation.result.recommendations["Coca Cola"] === "shrink" ? "badge-shrink" : "badge-maintain"}">
                        Coca Cola: ${simulation.result.recommendations["Coca Cola"].charAt(0).toUpperCase() + simulation.result.recommendations["Coca Cola"].slice(1)}
                    </span>
                    <span class="badge ${simulation.result.recommendations["Good Day"] === "shrink" ? "badge-shrink" : "badge-maintain"}">
                        Good Day: ${simulation.result.recommendations["Good Day"].charAt(0).toUpperCase() + simulation.result.recommendations["Good Day"].slice(1)}
                    </span>
                    <span class="badge ${simulation.result.recommendations["Parle G"] === "shrink" ? "badge-shrink" : "badge-maintain"}">
                        Parle G: ${simulation.result.recommendations["Parle G"].charAt(0).toUpperCase() + simulation.result.recommendations["Parle G"].slice(1)}
                    </span>
                </div>
            </div>
            <div class="mb-3">
                <strong>Scenario Impact:</strong> 
                <div class="text-muted small">
                    ${getScenarioImpactDescription(simulation.scenario)}
                </div>
            </div>
        `

      container.appendChild(resultElement)
    })

    // Add comparison if multiple simulations
    if (simulations.length > 1) {
      createSimulationComparison(simulations)
    } else {
      document.getElementById("simulationComparison").innerHTML =
        "<p class='text-center py-5 text-muted'>Run multiple simulations to compare results</p>"
    }
  }

  // Add this new function to provide more context about the scenario impact
  function getScenarioImpactDescription(scenario) {
    switch (scenario.type) {
      case "consumer_awareness":
        const changeDirection = scenario.change >= 0 ? "increased" : "decreased"
        return `Consumer awareness ${changeDirection} by ${Math.abs(scenario.change)}%, affecting how consumers respond to shrinkflation.`

      case "economic_downturn":
        const severityText = ["", "mild", "moderate", "severe"][scenario.severity]
        return `A ${severityText} economic downturn has made consumers more price-sensitive and reduced their purchasing power.`

      case "raw_material_cost":
        const costDirection = scenario.change >= 0 ? "increased" : "decreased"
        return `Raw material costs have ${costDirection} by ${Math.abs(scenario.change)}%, directly impacting production costs and profit margins.`

      case "competitor_strategy":
        const strategyText = scenario.strategy === "shrink" ? "shrinks its product" : "maintains its product size"
        return `${scenario.company} ${strategyText}, changing the competitive dynamics in the market.`

      default:
        return "This scenario modifies market conditions and may affect optimal strategies."
    }
  }

  // Create simulation comparison
  function createSimulationComparison(simulations) {
    const container = document.getElementById("simulationComparison")
    container.innerHTML = ""

    // Create comparison table
    const table = document.createElement("table")
    table.className = "table table-bordered"

    // Create header
    const thead = document.createElement("thead")
    const headerRow = document.createElement("tr")
    headerRow.innerHTML = `
            <th>Scenario</th>
            <th>Coca Cola</th>
            <th>Good Day</th>
            <th>Parle G</th>
        `
    thead.appendChild(headerRow)
    table.appendChild(thead)

    // Create body
    const tbody = document.createElement("tbody")

    simulations.forEach((simulation) => {
      const row = document.createElement("tr")

      row.innerHTML = `
                <td>${simulation.scenario.name}</td>
                <td class="${simulation.result.recommendations["Coca Cola"] === "shrink" ? "text-danger" : "text-success"}">
                    ${simulation.result.recommendations["Coca Cola"].charAt(0).toUpperCase() + simulation.result.recommendations["Coca Cola"].slice(1)}
                </td>
                <td class="${simulation.result.recommendations["Good Day"] === "shrink" ? "text-danger" : "text-success"}">
                    ${simulation.result.recommendations["Good Day"].charAt(0).toUpperCase() + simulation.result.recommendations["Good Day"].slice(1)}
                </td>
                <td class="${simulation.result.recommendations["Parle G"] === "shrink" ? "text-danger" : "text-success"}">
                    ${simulation.result.recommendations["Parle G"].charAt(0).toUpperCase() + simulation.result.recommendations["Parle G"].slice(1)}
                </td>
            `

      tbody.appendChild(row)
    })

    table.appendChild(tbody)
    container.appendChild(table)

    // Add summary
    const summary = document.createElement("div")
    summary.className = "mt-4"
    summary.innerHTML = `
            <h6>Key Findings</h6>
            <ul>
                ${generateKeyFindings(simulations)}
            </ul>
        `

    container.appendChild(summary)
  }

  // Generate key findings from simulations
  function generateKeyFindings(simulations) {
    const findings = []

    // Check if any scenario changes Coca Cola's strategy
    const cocaColaStrategies = simulations.map((s) => s.result.recommendations["Coca Cola"])
    if (new Set(cocaColaStrategies).size > 1) {
      findings.push("<li>Coca Cola's optimal strategy is sensitive to market conditions</li>")
    }

    // Check if any scenario changes Good Day's strategy
    const goodDayStrategies = simulations.map((s) => s.result.recommendations["Good Day"])
    if (new Set(goodDayStrategies).size > 1) {
      findings.push("<li>Good Day's optimal strategy is sensitive to market conditions</li>")
    }

    // Check if any scenario changes Parle G's strategy
    const parleGStrategies = simulations.map((s) => s.result.recommendations["Parle G"])
    if (new Set(parleGStrategies).size > 1) {
      findings.push("<li>Parle G's optimal strategy is sensitive to market conditions</li>")
    }

    // Check for consumer awareness impact
    const awarenessScenarios = simulations.filter((s) => s.scenario.type === "consumer_awareness")
    if (awarenessScenarios.length > 0) {
      const impactedCompanies = []

      // Get baseline strategies
      const baselineScenario = simulations.find((s) => s.scenario.type !== "consumer_awareness")
      if (baselineScenario) {
        const baselineStrategies = baselineScenario.result.recommendations

        // Check each company for changes
        ;["Coca Cola", "Good Day", "Parle G"].forEach((company) => {
          const changed = awarenessScenarios.some(
            (s) => s.result.recommendations[company] !== baselineStrategies[company],
          )

          if (changed) {
            impactedCompanies.push(company)
          }
        })

        if (impactedCompanies.length > 0) {
          findings.push(`<li>Consumer awareness changes impact ${impactedCompanies.join(", ")}'s optimal strategy</li>`)
        } else {
          findings.push("<li>Consumer awareness changes have limited impact on optimal strategies</li>")
        }
      }
    }

    // Add general findings if we don't have enough specific ones
    if (findings.length < 2) {
      findings.push("<li>Market conditions significantly influence optimal shrinkflation strategies</li>")
      findings.push("<li>Companies should monitor competitor strategies closely when making decisions</li>")
    }

    return findings.join("")
  }

  // Update last updated timestamp
  function updateLastUpdated(timestamp) {
    const lastUpdatedElement = document.getElementById("lastUpdated")
    if (lastUpdatedElement) {
      const date = new Date(timestamp)
      lastUpdatedElement.textContent = date.toLocaleString()
    }
  }
})
