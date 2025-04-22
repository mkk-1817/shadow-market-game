from flask import Flask, render_template, request, jsonify, redirect, url_for
import pymongo
import json
import os
import numpy as np
from datetime import datetime
from bson import json_util
import pandas as pd
import matplotlib.pyplot as plt
import io
import base64
from matplotlib.figure import Figure
import seaborn as sns
import random
from scipy.stats import norm

app = Flask(__name__)

# MongoDB connection
client = pymongo.MongoClient(os.environ.get("MONGODB_URI", "mongodb+srv://karthikmakkam:mkk_1817@project.e5qxv.mongodb.net/?retryWrites=true&w=majority&appName=Project"))
db = client["shrinkflation_db"]
products_collection = db["products"]
analysis_collection = db["analysis"]
market_collection = db["market_data"]
consumer_collection = db["consumer_data"]
economic_collection = db["economic_data"]

# Initialize database with realistic data
def init_db():
    if products_collection.count_documents({}) == 0:
        # Load data from CSV files if they exist, otherwise use default data
        try:
            products_data = pd.read_csv('data/products.csv').to_dict('records')
            # Add production_cost if missing
            for product in products_data:
                if "production_cost" not in product:
                    product["production_cost"] = product["price"] * 0.5  # Default to 50% of price
            products_collection.insert_many(products_data)
        except:
            # Generate realistic historical data for the three companies
            products_data = []
            
            # Milk Bikis data - realistic shrinkflation pattern
            milk_bikis_sizes = [150, 150, 145, 140, 135, 130, 125, 120]  # g
            milk_bikis_prices = [20, 20, 20, 22, 22, 24, 25, 25]  # rupees
            milk_bikis_market_share = [42, 43, 43.5, 44, 45, 45, 46, 47]  # percentage
            milk_bikis_production_cost = [9, 9.2, 9.3, 9.5, 9.7, 9.9, 10.2, 10.5]  # rupees per unit
            
            # Good Day data - aggressive shrinkflation
            good_day_sizes = [120, 110, 105, 100, 95, 90, 85, 80]  # g
            good_day_prices = [8, 8, 9, 10, 10, 10, 12, 12]  # rupees
            good_day_market_share = [28, 29, 29.5, 30, 30.5, 31, 31.5, 32]  # percentage
            good_day_production_cost = [3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.2, 4.4]  # rupees per unit
            
            # Parle G data - conservative shrinkflation
            parle_g_sizes = [90, 90, 88, 85, 82, 80, 78, 75]  # g
            parle_g_prices = [5, 5, 5, 5, 5, 5, 6, 6]  # rupees
            parle_g_market_share = [22, 23, 23.5, 24, 24.5, 25, 25.5, 26]  # percentage
            parle_g_production_cost = [2.0, 2.1, 2.15, 2.2, 2.25, 2.3, 2.4, 2.5]  # rupees per unit
            
            years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
            
            for i, year in enumerate(years):
                # Milk Bikis
                products_data.append({
                    "company": "Milk Bikis",
                    "year": year,
                    "size": milk_bikis_sizes[i],
                    "price": milk_bikis_prices[i],
                    "market_share": milk_bikis_market_share[i],
                    "production_cost": milk_bikis_production_cost[i],
                    "category": "biscuit",
                    "packaging": "packet",
                    "target_demographic": "all ages"
                })
                
                # Good Day
                products_data.append({
                    "company": "Good Day",
                    "year": year,
                    "size": good_day_sizes[i],
                    "price": good_day_prices[i],
                    "market_share": good_day_market_share[i],
                    "production_cost": good_day_production_cost[i],
                    "category": "biscuit",
                    "packaging": "packet",
                    "target_demographic": "middle class"
                })
                
                # Parle G
                products_data.append({
                    "company": "Parle G",
                    "year": year,
                    "size": parle_g_sizes[i],
                    "price": parle_g_prices[i],
                    "market_share": parle_g_market_share[i],
                    "production_cost": parle_g_production_cost[i],
                    "category": "biscuit",
                    "packaging": "packet",
                    "target_demographic": "mass market"
                })
            
            products_collection.insert_many(products_data)
    
    # Always run initial analysis for each year to ensure data is available
    for year in range(2018, 2026):
        if not analysis_collection.find_one({"year": year}):
            run_game_theory_analysis(year)
    
    # Initialize market data if empty
    if market_collection.count_documents({}) == 0:
        try:
            market_data = pd.read_csv('data/market.csv').to_dict('records')
            market_collection.insert_many(market_data)
        except:
            # Generate realistic market data
            market_data = []
            years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
            
            # Inflation rates (%)
            inflation_rates = [4.9, 3.7, 6.2, 5.5, 6.7, 5.2, 4.8, 4.5]
            
            # Raw material costs (index, 2018=100)
            sugar_index = [100, 105, 112, 120, 135, 142, 150, 155]
            wheat_index = [100, 103, 110, 125, 140, 148, 155, 160]
            packaging_index = [100, 104, 108, 115, 125, 130, 135, 140]
            
            # Consumer price sensitivity (scale 1-10)
            price_sensitivity = [6.2, 6.4, 7.1, 7.5, 8.0, 8.2, 8.4, 8.5]
            
            # Market competition intensity (scale 1-10)
            competition_intensity = [7.0, 7.2, 7.5, 7.8, 8.0, 8.3, 8.5, 8.7]
            
            for i, year in enumerate(years):
                market_data.append({
                    "year": year,
                    "inflation_rate": inflation_rates[i],
                    "sugar_price_index": sugar_index[i],
                    "wheat_price_index": wheat_index[i],
                    "packaging_price_index": packaging_index[i],
                    "consumer_price_sensitivity": price_sensitivity[i],
                    "competition_intensity": competition_intensity[i],
                    "gdp_growth": random.uniform(3.5, 7.5),
                    "disposable_income_growth": random.uniform(2.0, 6.0)
                })
            
            market_collection.insert_many(market_data)
    
    # Initialize consumer data if empty
    if consumer_collection.count_documents({}) == 0:
        try:
            consumer_data = pd.read_csv('data/consumer.csv').to_dict('records')
            consumer_collection.insert_many(consumer_data)
        except:
            # Generate realistic consumer data
            consumer_data = []
            years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
            
            # Awareness of shrinkflation (%)
            awareness = [25, 30, 38, 45, 55, 65, 72, 78]
            
            # Brand loyalty scores (scale 1-10)
            milk_bikis_loyalty = [7.8, 7.7, 7.6, 7.4, 7.3, 7.2, 7.1, 7.0]
            good_day_loyalty = [6.9, 6.8, 6.7, 6.5, 6.4, 6.3, 6.2, 6.1]
            parle_g_loyalty = [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.6, 7.5]
            
            # Price importance vs. quantity importance (ratio)
            price_quantity_ratio = [0.8, 0.85, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4]
            
            for i, year in enumerate(years):
                consumer_data.append({
                    "year": year,
                    "shrinkflation_awareness": awareness[i],
                    "milk_bikis_brand_loyalty": milk_bikis_loyalty[i],
                    "good_day_brand_loyalty": good_day_loyalty[i],
                    "parle_g_brand_loyalty": parle_g_loyalty[i],
                    "price_vs_quantity_importance": price_quantity_ratio[i],
                    "social_media_mentions": int(awareness[i] * 100 * random.uniform(0.8, 1.2)),
                    "negative_sentiment": awareness[i] * random.uniform(0.4, 0.6)
                })
            
            consumer_collection.insert_many(consumer_data)
    
    # Initialize economic data if empty
    if economic_collection.count_documents({}) == 0:
        try:
            economic_data = pd.read_csv('data/economic.csv').to_dict('records')
            economic_collection.insert_many(economic_data)
        except:
            # Generate realistic economic data
            economic_data = []
            years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
            
            # GDP growth rates (%)
            gdp_growth = [6.8, 6.5, 3.7, 8.7, 7.2, 6.1, 6.5, 6.8]
            
            # Unemployment rates (%)
            unemployment = [6.1, 5.8, 8.0, 7.5, 6.0, 5.5, 5.2, 5.0]
            
            # Consumer confidence index (scale 0-100)
            consumer_confidence = [75, 72, 58, 65, 70, 68, 72, 75]
            
            for i, year in enumerate(years):
                economic_data.append({
                    "year": year,
                    "gdp_growth_rate": gdp_growth[i],
                    "unemployment_rate": unemployment[i],
                    "consumer_confidence_index": consumer_confidence[i],
                    "interest_rate": random.uniform(4.0, 7.0),
                    "exchange_rate_usd_inr": random.uniform(65.0, 83.0),
                    "fmcg_sector_growth": gdp_growth[i] + random.uniform(-1.0, 2.0)
                })
            
            economic_collection.insert_many(economic_data)
    
    # Run initial analysis for each year
    for year in range(2018, 2026):
        run_game_theory_analysis(year)

# Game theory analysis using numpy for payoff calculations
def run_game_theory_analysis(year):
    # Get data for the specified year
    milk_bikis_data = products_collection.find_one({"company": "Milk Bikis", "year": year})
    good_day_data = products_collection.find_one({"company": "Good Day", "year": year})
    parle_g_data = products_collection.find_one({"company": "Parle G", "year": year})
    market_data = market_collection.find_one({"year": year})
    consumer_data = consumer_collection.find_one({"year": year})
    economic_data = economic_collection.find_one({"year": year})
    
    if not all([milk_bikis_data, good_day_data, parle_g_data, market_data, consumer_data, economic_data]):
        return None
    
    # Create a 2x2x2 game (3 players, 2 strategies each: maintain or shrink)
    # Since pygambit has API issues, we'll implement our own game theory logic
    
    # Define payoff calculation function based on multiple factors
    def calculate_payoff(company_data, strategy, competitor1_data, competitor1_strategy, 
                         competitor2_data, competitor2_strategy, market_data, consumer_data):
        
        # Base profit calculation
        current_size = company_data["size"]
        current_price = company_data["price"]
        # Add a default value if production_cost is missing
        production_cost = company_data.get("production_cost", current_price * 0.5)  # Default to 50% of price if missing
        market_share = company_data["market_share"]
        
        # Adjust size and cost based on strategy
        if strategy == "shrink":
            # Shrink by 5%
            new_size = current_size * 0.95
            # Production cost decreases by 3%
            new_cost = production_cost * 0.97
        else:
            new_size = current_size
            new_cost = production_cost
        
        # Calculate base profit
        base_profit = current_price - new_cost
        
        # Adjust market share based on strategies
        # Consumer awareness penalty
        awareness_penalty = consumer_data["shrinkflation_awareness"] / 100
        
        # Brand loyalty protection
        brand_key = f"{company_data['company'].lower().replace(' ', '_')}_brand_loyalty"
        brand_loyalty = consumer_data.get(brand_key, 7.0) / 10
        
        # Market share adjustments
        market_share_change = 0
        
        # If company shrinks but competitors don't
        if strategy == "shrink" and competitor1_strategy == "maintain" and competitor2_strategy == "maintain":
            # Penalty for being the only one to shrink
            market_share_change -= awareness_penalty * (1 - brand_loyalty) * 2
        
        # If company maintains but competitors shrink
        elif strategy == "maintain" and competitor1_strategy == "shrink" and competitor2_strategy == "shrink":
            # Bonus for being the only one to maintain
            market_share_change += awareness_penalty * 1.5
        
        # If everyone shrinks
        elif strategy == "shrink" and competitor1_strategy == "shrink" and competitor2_strategy == "shrink":
            # Small penalty as consumers have no alternative
            market_share_change -= awareness_penalty * 0.5
        
        # If company shrinks and one competitor maintains
        elif strategy == "shrink" and (competitor1_strategy == "maintain" or competitor2_strategy == "maintain"):
            # Moderate penalty
            market_share_change -= awareness_penalty * (1 - brand_loyalty)
        
        # Adjust for economic conditions
        economic_factor = economic_data["consumer_confidence_index"] / 70  # Normalize around 70
        market_share_change *= economic_factor
        
        # Calculate new market share
        new_market_share = market_share + market_share_change
        
        # Calculate profit based on market share and profit margin
        market_size = 1000000  # Assumed market size in units
        units_sold = (market_size * new_market_share / 100)
        total_profit = units_sold * base_profit
        
        # Normalize to a 0-10 scale for the game
        normalized_profit = min(10, max(0, total_profit / 1000000))
        
        return round(normalized_profit, 2)
    
    # Calculate all payoffs
    payoffs = {}
    strategies = ["maintain", "shrink"]
    
    for mb_strategy in strategies:
        if mb_strategy not in payoffs:
            payoffs[mb_strategy] = {}
            
        for gd_strategy in strategies:
            if gd_strategy not in payoffs[mb_strategy]:
                payoffs[mb_strategy][gd_strategy] = {}
                
            for pg_strategy in strategies:
                if pg_strategy not in payoffs[mb_strategy][gd_strategy]:
                    payoffs[mb_strategy][gd_strategy][pg_strategy] = {}
                
                # Calculate Milk Bikis payoff
                mb_payoff = calculate_payoff(
                    milk_bikis_data, mb_strategy,
                    good_day_data, gd_strategy,
                    parle_g_data, pg_strategy,
                    market_data, consumer_data
                )
                
                # Calculate Good Day payoff
                gd_payoff = calculate_payoff(
                    good_day_data, gd_strategy,
                    milk_bikis_data, mb_strategy,
                    parle_g_data, pg_strategy,
                    market_data, consumer_data
                )
                
                # Calculate Parle G payoff
                pg_payoff = calculate_payoff(
                    parle_g_data, pg_strategy,
                    milk_bikis_data, mb_strategy,
                    good_day_data, gd_strategy,
                    market_data, consumer_data
                )
                
                payoffs[mb_strategy][gd_strategy][pg_strategy] = {
                    "Milk Bikis": mb_payoff,
                    "Good Day": gd_payoff,
                    "Parle G": pg_payoff
                }
    
    # Find Nash equilibria using best response analysis
    nash_equilibria = []
    
    for mb_strategy in strategies:
        for gd_strategy in strategies:
            for pg_strategy in strategies:
                # Check if this is a Nash equilibrium
                mb_payoff = payoffs[mb_strategy][gd_strategy][pg_strategy]["Milk Bikis"]
                gd_payoff = payoffs[mb_strategy][gd_strategy][pg_strategy]["Good Day"]
                pg_payoff = payoffs[mb_strategy][gd_strategy][pg_strategy]["Parle G"]
                
                # Check if Milk Bikis can improve by changing strategy
                mb_can_improve = False
                other_strategy = "maintain" if mb_strategy == "shrink" else "shrink"
                if payoffs[other_strategy][gd_strategy][pg_strategy]["Milk Bikis"] > mb_payoff:
                    mb_can_improve = True
                
                # Check if Good Day can improve by changing strategy
                gd_can_improve = False
                other_strategy = "maintain" if gd_strategy == "shrink" else "shrink"
                if payoffs[mb_strategy][other_strategy][pg_strategy]["Good Day"] > gd_payoff:
                    gd_can_improve = True
                
                # Check if Parle G can improve by changing strategy
                pg_can_improve = False
                other_strategy = "maintain" if pg_strategy == "shrink" else "shrink"
                if payoffs[mb_strategy][gd_strategy][other_strategy]["Parle G"] > pg_payoff:
                    pg_can_improve = True
                
                # If no player can improve by changing strategy, this is a Nash equilibrium
                if not (mb_can_improve or gd_can_improve or pg_can_improve):
                    nash_equilibria.append(f"Milk Bikis: {mb_strategy.capitalize()}, Good Day: {gd_strategy.capitalize()}, Parle G: {pg_strategy.capitalize()}")
    
    # If no Nash equilibrium is found, identify the most likely outcome
    if not nash_equilibria:
        # Find the strategy profile with the highest total payoff
        max_total_payoff = 0
        best_profile = None
        
        for mb_strategy in strategies:
            for gd_strategy in strategies:
                for pg_strategy in strategies:
                    total_payoff = sum(payoffs[mb_strategy][gd_strategy][pg_strategy].values())
                    if total_payoff > max_total_payoff:
                        max_total_payoff = total_payoff
                        best_profile = f"Milk Bikis: {mb_strategy.capitalize()}, Good Day: {gd_strategy.capitalize()}, Parle G: {pg_strategy.capitalize()}"
        
        nash_equilibria.append(f"{best_profile} (Dominant Total Payoff)")
    
    # Determine recommendations based on Nash equilibria and payoffs
    recommendations = {}
    
    # Extract strategies from the first Nash equilibrium
    if nash_equilibria:
        eq_parts = nash_equilibria[0].split(", ")
        recommendations["Milk Bikis"] = eq_parts[0].split(": ")[1].lower()
        recommendations["Good Day"] = eq_parts[1].split(": ")[1].lower()
        recommendations["Parle G"] = eq_parts[2].split(": ")[1].lower()
    else:
        # Default recommendations based on payoff analysis
        recommendations["Milk Bikis"] = "maintain"
        recommendations["Good Day"] = "maintain"
        recommendations["Parle G"] = "maintain"
    
    # Create simplified payoff matrix for visualization
    payoff_matrix = {
        "maintain": {
            "maintain": {
                "Milk Bikis": payoffs["maintain"]["maintain"]["maintain"]["Milk Bikis"],
                "Good Day": payoffs["maintain"]["maintain"]["maintain"]["Good Day"],
                "Parle G": payoffs["maintain"]["maintain"]["maintain"]["Parle G"]
            },
            "shrink": {
                "Milk Bikis": payoffs["maintain"]["shrink"]["maintain"]["Milk Bikis"],
                "Good Day": payoffs["maintain"]["shrink"]["maintain"]["Good Day"],
                "Parle G": payoffs["maintain"]["shrink"]["maintain"]["Parle G"]
            }
        },
        "shrink": {
            "maintain": {
                "Milk Bikis": payoffs["shrink"]["maintain"]["maintain"]["Milk Bikis"],
                "Good Day": payoffs["shrink"]["maintain"]["maintain"]["Good Day"],
                "Parle G": payoffs["shrink"]["maintain"]["maintain"]["Parle G"]
            },
            "shrink": {
                "Milk Bikis": payoffs["shrink"]["shrink"]["shrink"]["Milk Bikis"],
                "Good Day": payoffs["shrink"]["shrink"]["shrink"]["Good Day"],
                "Parle G": payoffs["shrink"]["shrink"]["shrink"]["Parle G"]
            }
        }
    }
    
    # Calculate additional metrics for each company
    company_data = {}
    
    for company, company_obj in [("Milk Bikis", milk_bikis_data), ("Good Day", good_day_data), ("Parle G", parle_g_data)]:
        # Get previous year data
        prev_year = year - 1
        prev_data = products_collection.find_one({"company": company, "year": prev_year})
        
        # Calculate changes
        size_change = 0
        price_change = 0
        
        if prev_data:
            size_change = ((company_obj["size"] - prev_data["size"]) / prev_data["size"]) * 100
            price_change = ((company_obj["price"] - prev_data["price"]) / prev_data["price"]) * 100
        
        # Calculate profit margin
        # Add a default value if production_cost is missing
        production_cost = company_obj.get("production_cost", company_obj["price"] * 0.5)  # Default to 50% of price if missing
        profit_margin = ((company_obj["price"] - production_cost) / company_obj["price"]) * 100
        
        # Calculate price per unit
        price_per_unit = company_obj["price"] / company_obj["size"]
        
        company_data[company] = {
            "currentSize": company_obj["size"],
            "currentPrice": company_obj["price"],
            "priceChange": round(price_change, 1),
            "sizeChange": round(size_change, 1),
            "profitMargin": round(profit_margin, 1),
            "marketShare": company_obj["market_share"],
            "pricePerUnit": round(price_per_unit * 100, 2),  # Price per 100 ml/g
            "productionCost": production_cost,
            "recommendation": recommendations[company]
        }
    
    # Generate insights based on the analysis
    insights = generate_insights(company_data, market_data, consumer_data, economic_data, nash_equilibria)
    
    # Save analysis results to database
    analysis_result = {
        "year": year,
        "timestamp": datetime.now(),
        "nash_equilibrium": nash_equilibria,
        "payoff_matrix": payoff_matrix,
        "company_data": company_data,
        "market_data": market_data,
        "consumer_data": consumer_data,
        "economic_data": economic_data,
        "insights": insights,
        "full_payoffs": payoffs
    }
    
    # Update or insert analysis
    analysis_collection.update_one(
        {"year": year},
        {"$set": analysis_result},
        upsert=True
    )
    
    return analysis_result

def generate_insights(company_data, market_data, consumer_data, economic_data, nash_equilibria):
    insights = []
    
    # Insight 1: Impact of consumer awareness
    if consumer_data["shrinkflation_awareness"] > 50:
        insights.append("High consumer awareness of shrinkflation ({}%) is making shrinkflation strategies riskier, especially for companies with lower brand loyalty.".format(consumer_data["shrinkflation_awareness"]))
    else:
        insights.append("Low consumer awareness of shrinkflation ({}%) creates an opportunity for companies to implement shrinkflation with minimal market share impact.".format(consumer_data["shrinkflation_awareness"]))
    
    # Insight 2: Economic conditions
    if economic_data["consumer_confidence_index"] < 65:
        insights.append("Low consumer confidence ({}) is making consumers more price-sensitive, potentially favoring shrinkflation over price increases.".format(economic_data["consumer_confidence_index"]))
    else:
        insights.append("Strong consumer confidence ({}) suggests consumers may be less sensitive to package size changes.".format(economic_data["consumer_confidence_index"]))
    
    # Insight 3: Brand loyalty impact
    max_loyalty = max(consumer_data["milk_bikis_brand_loyalty"], consumer_data["good_day_brand_loyalty"], consumer_data["parle_g_brand_loyalty"])
    min_loyalty = min(consumer_data["milk_bikis_brand_loyalty"], consumer_data["good_day_brand_loyalty"], consumer_data["parle_g_brand_loyalty"])
    
    if max_loyalty - min_loyalty > 1.5:
        insights.append("Significant differences in brand loyalty between companies suggest different optimal strategies for each company.")
    
    # Insight 4: Nash equilibrium analysis
    if len(nash_equilibria) > 1:
        insights.append("Multiple Nash equilibria indicate market uncertainty. Companies should monitor competitors' actions closely.")
    elif "shrink" in nash_equilibria[0].lower() and "maintain" in nash_equilibria[0].lower():
        insights.append("Mixed Nash equilibrium suggests a market in transition, with some companies benefiting from shrinkflation while others should maintain sizes.")
    
    # Insight 5: Raw material costs
    if market_data["sugar_price_index"] > 130 or market_data["wheat_price_index"] > 130:
        insights.append("High raw material costs are putting pressure on profit margins, making shrinkflation an attractive strategy to maintain profitability.")
    
    # Insight 6: Price/size ratio comparison
    price_per_unit = {
        "Milk Bikis": company_data["Milk Bikis"]["pricePerUnit"],
        "Good Day": company_data["Good Day"]["pricePerUnit"],
        "Parle G": company_data["Parle G"]["pricePerUnit"]
    }
    
    max_price = max(price_per_unit.values())
    min_price = min(price_per_unit.values())
    max_company = [k for k, v in price_per_unit.items() if v == max_price][0]
    min_company = [k for k, v in price_per_unit.items() if v == min_price][0]
    
    insights.append("{} has the highest price per unit (₹{} per 100ml/g), while {} has the lowest (₹{} per 100ml/g).".format(
        max_company, max_price, min_company, min_price
    ))
    
    # Always ensure we have at least one insight
    if not insights:
        insights.append("Analysis suggests monitoring market conditions closely for optimal shrinkflation strategy.")
    
    return insights

def calculate_change(data, field, year):
    # Get previous year data
    prev_year = year - 1
    prev_data = products_collection.find_one({"company": data["company"], "year": prev_year})
    
    if not prev_data:
        return 0
    
    # Calculate percentage change
    if prev_data[field] == 0:
        return 0
    
    change = ((data[field] - prev_data[field]) / prev_data[field]) * 100
    return round(change, 1)

# Routes
@app.route('/')
def index():
    return redirect(url_for('analysis'))

# Remove the dashboard route since we're integrating everything into analysis
# @app.route('/dashboard')
# def dashboard():
#     return render_template('dashboard.html')

@app.route('/analysis')
def analysis():
    year = request.args.get('year', '2023')
    return render_template('analysis.html', year=year)

@app.route('/simulation')
def simulation():
    return render_template('simulation.html')

@app.route('/api/years')
def get_years():
    try:
        years = products_collection.distinct("year")
        if not years:
            # Fallback if no years in database
            years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
        return jsonify(sorted(years))
    except Exception as e:
        print(f"Error fetching years: {e}")
        # Return fallback years if there's an error
        return jsonify([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025])

@app.route('/api/analysis/<int:year>')
def get_analysis(year):
    analysis = analysis_collection.find_one({"year": year})
    if not analysis:
        # Run analysis if it doesn't exist
        analysis = run_game_theory_analysis(year)
        if not analysis:
            return jsonify({"error": "No data available for the specified year"}), 404
    
    # Convert MongoDB document to JSON
    return json_util.dumps(analysis)

@app.route('/api/historical-data/<data_type>')
def get_historical_data(data_type):
    if data_type not in ["size", "price", "ratio", "market_share", "profit_margin"]:
        return jsonify({"error": "Invalid data type"}), 400
    
    # Get all years
    years = sorted(products_collection.distinct("year"))
    
    # Get data for each company and year
    result = []
    
    for year in years:
        data_point = {"year": str(year)}
        
        for company in ["Milk Bikis", "Good Day", "Parle G"]:
            product = products_collection.find_one({"company": company, "year": year})
            
            if product:
                if data_type == "size":
                    data_point[company] = product["size"]
                elif data_type == "price":
                    data_point[company] = product["price"]
                elif data_type == "ratio":
                    # Price per unit (ml or g)
                    data_point[company] = round(product["price"] / product["size"] * 100, 2)  # Price per 100 ml/g
                elif data_type == "market_share":
                    data_point[company] = product["market_share"]
                elif data_type == "profit_margin":
                    # Calculate profit margin
                    profit_margin = ((product["price"] - product["production_cost"]) / product["price"]) * 100
                    data_point[company] = round(profit_margin, 1)
        
        result.append(data_point)
    
    return jsonify(result)

@app.route('/api/market-data')
def get_market_data():
    # Get all years
    years = sorted(market_collection.distinct("year"))
    
    # Get market data for each year
    result = []
    
    for year in years:
        market_data = market_collection.find_one({"year": year})
        if market_data:
            # Remove MongoDB _id field
            market_data.pop("_id", None)
            result.append(market_data)
    
    return jsonify(result)

@app.route('/api/consumer-data')
def get_consumer_data():
    # Get all years
    years = sorted(consumer_collection.distinct("year"))
    
    # Get consumer data for each year
    result = []
    
    for year in years:
        consumer_data = consumer_collection.find_one({"year": year})
        if consumer_data:
            # Remove MongoDB _id field
            consumer_data.pop("_id", None)
            result.append(consumer_data)
    
    return jsonify(result)

@app.route('/api/economic-data')
def get_economic_data():
    # Get all years
    years = sorted(economic_collection.distinct("year"))
    
    # Get economic data for each year
    result = []
    
    for year in years:
        economic_data = economic_collection.find_one({"year": year})
        if economic_data:
            # Remove MongoDB _id field
            economic_data.pop("_id", None)
            result.append(economic_data)
    
    return jsonify(result)

@app.route('/api/run-analysis/<int:year>', methods=['POST'])
def trigger_analysis(year):
    result = run_game_theory_analysis(year)
    if not result:
        return jsonify({"error": "Failed to run analysis"}), 500
    
    return json_util.dumps(result)

@app.route('/api/simulate', methods=['POST'])
def simulate_scenario():
    data = request.json
    
    if not data or 'year' not in data or 'scenarios' not in data:
        return jsonify({"error": "Invalid simulation data"}), 400
    
    year = data['year']
    scenarios = data['scenarios']
    
    # Get base data
    base_analysis = analysis_collection.find_one({"year": year})
    if not base_analysis:
        return jsonify({"error": "No analysis data available for the specified year"}), 404
    
    # Run simulations for each scenario
    simulation_results = []
    
    for scenario in scenarios:
        # Apply scenario modifications to a copy of the data
        modified_data = simulate_scenario_data(year, scenario)
        
        # Run analysis with modified data
        result = run_simulation_analysis(year, modified_data)
        
        simulation_results.append({
            "scenario": scenario,
            "result": result
        })
    
    return json_util.dumps({"simulations": simulation_results})

def simulate_scenario_data(year, scenario):
    # Get base data
    products = list(products_collection.find({"year": year}))
    market = market_collection.find_one({"year": year})
    consumer = consumer_collection.find_one({"year": year})
    economic = economic_collection.find_one({"year": year})
    
    # Create copies of the data
    products_copy = [product.copy() for product in products]
    market_copy = market.copy() if market else {}
    consumer_copy = consumer.copy() if consumer else {}
    economic_copy = economic.copy() if economic else {}
    
    # Apply scenario modifications
    scenario_type = scenario.get("type", "")
    
    if scenario_type == "consumer_awareness":
        # Modify consumer awareness
        awareness_change = scenario.get("change", 0)
        consumer_copy["shrinkflation_awareness"] = min(100, max(0, consumer_copy.get("shrinkflation_awareness", 0) + awareness_change))
    
    elif scenario_type == "economic_downturn":
        # Simulate economic downturn
        severity = scenario.get("severity", 1)
        economic_copy["gdp_growth_rate"] = max(0, economic_copy.get("gdp_growth_rate", 0) - severity)
        economic_copy["consumer_confidence_index"] = max(0, economic_copy.get("consumer_confidence_index", 0) - severity * 10)
        market_copy["consumer_price_sensitivity"] = min(10, market_copy.get("consumer_price_sensitivity", 0) + severity)
    
    elif scenario_type == "raw_material_cost":
        # Modify raw material costs
        cost_change = scenario.get("change", 0)
        market_copy["sugar_price_index"] = max(0, market_copy.get("sugar_price_index", 100) + cost_change * 1.5)  # Amplify effect
        market_copy["wheat_price_index"] = max(0, market_copy.get("wheat_price_index", 100) + cost_change * 1.5)  # Amplify effect
        market_copy["packaging_price_index"] = max(0, market_copy.get("packaging_price_index", 100) + cost_change * 1.5)  # Amplify effect
        
        # Also adjust production costs based on raw material changes
        for product in products_copy:
            if "production_cost" in product:
                # Increase or decrease production cost based on raw material cost change
                adjustment = 1 + (cost_change / 100)
                product["production_cost"] = product["production_cost"] * adjustment
            else:
                # Add production cost if missing
                product["production_cost"] = product["price"] * 0.5
    
    elif scenario_type == "competitor_strategy":
        # Modify a specific company's strategy
        company = scenario.get("company", "")
        strategy = scenario.get("strategy", "")
        
        if company and strategy in ["shrink", "maintain"]:
            for product in products_copy:
                if product["company"] == company:
                    if strategy == "shrink":
                        product["size"] = product["size"] * 0.90  # Shrink by 10% instead of 5%
                        # Also adjust production cost
                        if "production_cost" in product:
                            product["production_cost"] = product["production_cost"] * 0.94  # Production cost decreases by 6%
                        else:
                            product["production_cost"] = product["price"] * 0.47  # Lower than default 50%
                    else:  # maintain
                        # No size change, but ensure production_cost exists
                        if "production_cost" not in product:
                            product["production_cost"] = product["price"] * 0.5
    
    return {
        "products": products_copy,
        "market": market_copy,
        "consumer": consumer_copy,
        "economic": economic_copy
    }

def run_simulation_analysis(year, modified_data):
    # Extract modified data
    products = modified_data["products"]
    market = modified_data["market"]
    consumer = modified_data["consumer"]
    economic = modified_data["economic"]
    
    # Get company data
    milk_bikis_data = next((p for p in products if p["company"] == "Milk Bikis"), None)
    good_day_data = next((p for p in products if p["company"] == "Good Day"), None)
    parle_g_data = next((p for p in products if p["company"] == "Parle G"), None)
    
    if not all([milk_bikis_data, good_day_data, parle_g_data, market, consumer, economic]):
        return None
    
    # Use the same game theory logic as in run_game_theory_analysis
    # but with the modified data
    # This is a simplified version for simulation
    
    # Define payoff calculation function based on multiple factors
    def calculate_payoff(company_data, strategy, competitor1_data, competitor1_strategy, 
                         competitor2_data, competitor2_strategy, market_data, consumer_data):
        
        # Base profit calculation
        current_size = company_data["size"]
        current_price = company_data["price"]
        # Add a default value if production_cost is missing
        production_cost = company_data.get("production_cost", current_price * 0.5)  # Default to 50% of price if missing
        market_share = company_data["market_share"]
        
        # Adjust size and cost based on strategy
        if strategy == "shrink":
            # Shrink by 5%
            new_size = current_size * 0.95
            # Production cost decreases by 3%
            new_cost = production_cost * 0.97
        else:
            new_size = current_size
            new_cost = production_cost
        
        # Calculate base profit
        base_profit = current_price - new_cost
        
        # Adjust market share based on strategies
        # Consumer awareness penalty
        awareness_penalty = consumer_data["shrinkflation_awareness"] / 100
        
        # Brand loyalty protection
        brand_key = f"{company_data['company'].lower().replace(' ', '_')}_brand_loyalty"
        brand_loyalty = consumer_data.get(brand_key, 7.0) / 10
        
        # Market share adjustments
        market_share_change = 0
        
        # If company shrinks but competitors don't
        if strategy == "shrink" and competitor1_strategy == "maintain" and competitor2_strategy == "maintain":
            # Penalty for being the only one to shrink
            market_share_change -= awareness_penalty * (1 - brand_loyalty) * 3  # Increased from 2 to 3
        
        # If company maintains but competitors shrink
        elif strategy == "maintain" and competitor1_strategy == "shrink" and competitor2_strategy == "shrink":
            # Bonus for being the only one to maintain
            market_share_change += awareness_penalty * 2.5  # Increased from 1.5 to 2.5
        
        # If everyone shrinks
        elif strategy == "shrink" and competitor1_strategy == "shrink" and competitor2_strategy == "shrink":
            # Small penalty as consumers have no alternative
            market_share_change -= awareness_penalty * 0.3  # Reduced from 0.5 to 0.3
        
        # If company shrinks and one competitor maintains
        elif strategy == "shrink" and (competitor1_strategy == "maintain" or competitor2_strategy == "maintain"):
            # Moderate penalty
            market_share_change -= awareness_penalty * (1 - brand_loyalty) * 1.5  # Increased from 1 to 1.5
        
        # Adjust for economic conditions
        # economic_factor = economic_data["consumer_confidence_index"] / 70  # type: ignore # Normalize around 70
        # market_share_change *= economic_factor
        
        # Calculate new market share
        new_market_share = market_share
        
        # Calculate profit based on market share and profit margin
        market_size = 1000000  # Assumed market size in units
        units_sold = (market_size * new_market_share / 100)
        total_profit = units_sold * base_profit
        
        # Normalize to a 0-10 scale for the game
        normalized_profit = min(10, max(0, total_profit / 1000000))
        
        return round(normalized_profit, 2)
    
    # Calculate all payoffs
    payoffs = {}
    strategies = ["maintain", "shrink"]
    
    for mb_strategy in strategies:
        if mb_strategy not in payoffs:
            payoffs[mb_strategy] = {}
            
        for gd_strategy in strategies:
            if gd_strategy not in payoffs[mb_strategy]:
                payoffs[mb_strategy][gd_strategy] = {}
                
            for pg_strategy in strategies:
                if pg_strategy not in payoffs[mb_strategy][gd_strategy]:
                    payoffs[mb_strategy][gd_strategy][pg_strategy] = {}
                
                # Calculate Milk Bikis payoff
                mb_payoff = calculate_payoff(
                    milk_bikis_data, mb_strategy,
                    good_day_data, gd_strategy,
                    parle_g_data, pg_strategy,
                    market, consumer
                )
                
                # Calculate Good Day payoff
                gd_payoff = calculate_payoff(
                    good_day_data, gd_strategy,
                    milk_bikis_data, mb_strategy,
                    parle_g_data, pg_strategy,
                    market, consumer
                )
                
                # Calculate Parle G payoff
                pg_payoff = calculate_payoff(
                    parle_g_data, pg_strategy,
                    milk_bikis_data, mb_strategy,
                    good_day_data, gd_strategy,
                    market, consumer
                )
                
                payoffs[mb_strategy][gd_strategy][pg_strategy] = {
                    "Milk Bikis": mb_payoff,
                    "Good Day": gd_payoff,
                    "Parle G": pg_payoff
                }
    
    # Find Nash equilibria using best response analysis
    nash_equilibria = []
    
    for mb_strategy in strategies:
        for gd_strategy in strategies:
            for pg_strategy in strategies:
                # Check if this is a Nash equilibrium
                mb_payoff = payoffs[mb_strategy][gd_strategy][pg_strategy]["Milk Bikis"]
                gd_payoff = payoffs[mb_strategy][gd_strategy][pg_strategy]["Good Day"]
                pg_payoff = payoffs[mb_strategy][gd_strategy][pg_strategy]["Parle G"]
                
                # Check if Milk Bikis can improve by changing strategy
                mb_can_improve = False
                other_strategy = "maintain" if mb_strategy == "shrink" else "shrink"
                if payoffs[other_strategy][gd_strategy][pg_strategy]["Milk Bikis"] > mb_payoff:
                    mb_can_improve = True
                
                # Check if Good Day can improve by changing strategy
                gd_can_improve = False
                other_strategy = "maintain" if gd_strategy == "shrink" else "shrink"
                if payoffs[mb_strategy][other_strategy][pg_strategy]["Good Day"] > gd_payoff:
                    gd_can_improve = True
                
                # Check if Parle G can improve by changing strategy
                pg_can_improve = False
                other_strategy = "maintain" if pg_strategy == "shrink" else "shrink"
                if payoffs[mb_strategy][gd_strategy][other_strategy]["Parle G"] > pg_payoff:
                    pg_can_improve = True
                
                # If no player can improve by changing strategy, this is a Nash equilibrium
                if not (mb_can_improve or gd_can_improve or pg_can_improve):
                    nash_equilibria.append(f"Milk Bikis: {mb_strategy.capitalize()}, Good Day: {gd_strategy.capitalize()}, Parle G: {pg_strategy.capitalize()}")
    
    # Determine recommendations based on Nash equilibria and payoffs
    recommendations = {}
    
    # Extract strategies from the first Nash equilibrium
    if nash_equilibria:
        eq_parts = nash_equilibria[0].split(", ")
        recommendations["Milk Bikis"] = eq_parts[0].split(": ")[1].lower()
        recommendations["Good Day"] = eq_parts[1].split(": ")[1].lower()
        recommendations["Parle G"] = eq_parts[2].split(": ")[1].lower()
    else:
        # Default recommendations based on payoff analysis
        recommendations["Milk Bikis"] = "maintain"
        recommendations["Good Day"] = "maintain"
        recommendations["Parle G"] = "maintain"
    
    # Return simulation results
    return {
        "nash_equilibrium": nash_equilibria,
        "recommendations": recommendations,
        "payoffs": payoffs
    }

@app.route('/api/generate-chart/<chart_type>/<int:year>')
def generate_chart(chart_type, year):
    # Get analysis data
    analysis = analysis_collection.find_one({"year": year})
    if not analysis:
        return jsonify({"error": "No analysis data available"}), 404
    
    # Create figure
    fig = Figure(figsize=(10, 6))
    ax = fig.subplots()
    
    if chart_type == "payoff_heatmap":
        # Create payoff heatmap
        payoffs = analysis.get("full_payoffs", {})
        
        # Extract payoffs for Milk Bikis when Parle G maintains
        mb_gd_payoffs = np.zeros((2, 2))
        
        strategies = ["maintain", "shrink"]
        for i, mb_strategy in enumerate(strategies):
            for j, gd_strategy in enumerate(strategies):
                mb_gd_payoffs[i, j] = payoffs.get(mb_strategy, {}).get(gd_strategy, {}).get("maintain", {}).get("Milk Bikis", 0)
        
        sns.heatmap(mb_gd_payoffs, annot=True, fmt=".2f", cmap="YlGnBu", 
                    xticklabels=strategies, yticklabels=strategies, ax=ax)
        
        ax.set_title("Milk Bikis Payoffs (when Parle G maintains)")
        ax.set_xlabel("Good Day Strategy")
        ax.set_ylabel("Milk Bikis Strategy")
    
    elif chart_type == "market_share":
        # Create market share comparison
        companies = ["Milk Bikis", "Good Day", "Parle G"]
        market_shares = [analysis["company_data"][company]["marketShare"] for company in companies]
        
        ax.bar(companies, market_shares, color=["#dc3545", "#fd7e14", "#198754"])
        ax.set_title("Market Share Comparison")
        ax.set_ylabel("Market Share (%)")
        ax.set_ylim(0, 50)
        
        # Add value labels
        for i, v in enumerate(market_shares):
            ax.text(i, v + 1, f"{v}%", ha='center')
    
    elif chart_type == "price_size_ratio":
        # Create price/size ratio comparison
        companies = ["Milk Bikis", "Good Day", "Parle G"]
        ratios = [analysis["company_data"][company]["pricePerUnit"] for company in companies]
        
        ax.bar(companies, ratios, color=["#dc3545", "#fd7e14", "#198754"])
        ax.set_title("Price per 100ml/g Comparison")
        ax.set_ylabel("Price (₹)")
        
        # Add value labels
        for i, v in enumerate(ratios):
            ax.text(i, v + 0.1, f"₹{v}", ha='center')
    
    # Save figure to a PNG image
    buf = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format="png")
    buf.seek(0)
    
    # Encode the image to base64
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    
    return jsonify({"image": f"data:image/png;base64,{img_base64}"})

@app.route('/api/export-data/<int:year>')
def export_data(year):
    # Get analysis data
    analysis = analysis_collection.find_one({"year": year})
    if not analysis:
        return jsonify({"error": "No analysis data available"}), 404
    
    # Convert MongoDB document to JSON
    analysis_json = json_util.dumps(analysis)
    
    # Return as downloadable file
    return analysis_json, 200, {
        'Content-Type': 'application/json',
        'Content-Disposition': f'attachment; filename=shrinkflation_analysis_{year}.json'
    }

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
