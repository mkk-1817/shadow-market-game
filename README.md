# Shadow Market Game - Shrinkflation Analysis

This project analyzes shrinkflation strategies for Coca Cola, Good Day, and Parle G using game theory principles. The application provides recommendations on whether companies should shrink their products or maintain current sizes based on market conditions.

## Features

- Game theory analysis to determine optimal shrinkflation strategies
- Historical data visualization for product sizes, prices, and price-to-size ratios
- MongoDB integration for data storage and retrieval
- Interactive dashboard with detailed analysis views
- Market simulation capabilities to test different scenarios
- Comprehensive insights based on economic factors and consumer behavior

## Requirements

- Python 3.9+
- MongoDB
- Flask
- NumPy
- Pandas
- Matplotlib
- Seaborn

## Installation

### Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed
2. Clone this repository
3. Run `docker-compose up -d`
4. Access the application at http://localhost:5000

### Manual Installation

1. Clone this repository
2. Install MongoDB and make sure it's running
3. Create a virtual environment: `python -m venv venv`
4. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
5. Install dependencies: `pip install -r requirements.txt`
6. Set the MongoDB URI environment variable:
   - Windows: `set MONGODB_URI=mongodb://localhost:27017/`
   - Unix/MacOS: `export MONGODB_URI=mongodb://localhost:27017/`
7. Run the application: `flask run`
8. Access the application at http://localhost:5000

## Project Structure

- `app.py`: Main Flask application with routes and game theory logic
- `templates/`: HTML templates for the web interface
- `static/`: CSS and JavaScript files for the frontend
- `requirements.txt`: Python dependencies
- `Dockerfile` and `docker-compose.yml`: Docker configuration

## How It Works

### Game Theory Model

The application models the shrinkflation market as a 3-player game where each company (Coca Cola, Good Day, and Parle G) can choose to either maintain their current product size or shrink it while maintaining the price.

The payoff matrix is calculated based on multiple factors:
- Current market share
- Profit margins
- Production costs
- Consumer awareness of shrinkflation
- Brand loyalty
- Economic conditions
- Competitor strategies

### Nash Equilibrium

The application calculates Nash equilibria to determine optimal strategies for each company. A Nash equilibrium is a set of strategies where no player can improve their outcome by unilaterally changing their strategy.

### Data Analysis

The application provides comprehensive data analysis:
- Historical trends of product sizes, prices, and price-to-size ratios
- Market share analysis
- Profit margin comparison
- Economic factor impact
- Consumer behavior analysis

### Simulation

The simulation feature allows users to test different market scenarios:
- Changes in consumer awareness
- Economic downturns
- Raw material cost fluctuations
- Competitor strategy changes

## API Endpoints

- `/api/years`: Get available years
- `/api/analysis/<year>`: Get analysis data for a specific year
- `/api/historical-data/<data_type>`: Get historical data for a specific data type
- `/api/run-analysis/<year>`: Run analysis for a specific year
- `/api/simulate`: Run simulation with custom scenarios
- `/api/generate-chart/<chart_type>/<year>`: Generate chart for a specific type and year
- `/api/export-data/<year>`: Export analysis data for a specific year

## Extending the Project

To extend this project:
1. Add more sophisticated game theory models
2. Incorporate real-time market data
3. Implement machine learning for predictive analysis
4. Add more companies to the analysis
5. Enhance the simulation capabilities
