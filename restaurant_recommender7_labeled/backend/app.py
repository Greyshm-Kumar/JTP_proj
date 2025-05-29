# ====== IMPORTS & INITIALIZATION ======
from flask import Flask, jsonify, request  # Core Flask functionality
from flask_cors import CORS  # Cross-Origin Resource Sharing handling
from model import Recommender, KNNRecommender  # Custom recommendation models
import psycopg2  # PostgreSQL database adapter
import os  # Environment variable access
import logging  # Application logging
import json  # JSON data handling
import time  # Time utilities for retry logic

# Initialize logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask application instance
app = Flask(__name__)

# Configure CORS with specific rules
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://frontend:80"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# ====== DATABASE CONFIGURATION ======
# Database connection parameters from environment variables
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'db'),  # Database host (default: 'db')
    'database': os.getenv('DB_NAME', 'restaurants'),  # Database name
    'user': os.getenv('DB_USER', 'postgres'),  # Database user
    'password': os.getenv('DB_PASS', 'password'),  # Database password
    'port': 5432  # Database port
}

# ====== DATABASE HELPER FUNCTIONS ======
def get_restaurants():
    """Fetch all restaurants from database with retry logic"""
    max_retries = 5  # Maximum connection attempts
    retry_delay = 3  # Seconds between retries
    
    # Retry loop for database connection
    for i in range(max_retries):
        try:
            # Establish database connection
            conn = psycopg2.connect(**DB_CONFIG)
            cur = conn.cursor()
            
            # Execute query and fetch results
            cur.execute('SELECT * FROM restaurants;')
            columns = [desc[0] for desc in cur.description]  # Get column names
            restaurants = [dict(zip(columns, row)) for row in cur.fetchall()]
            return restaurants
        
        except psycopg2.OperationalError as e:
            # Final error after max retries
            if i == max_retries - 1:
                logger.error(f"Database connection failed: {str(e)}")
                raise
            # Retry notification
            logger.warning(f"Retrying database connection ({i+1}/{max_retries})...")
            time.sleep(retry_delay)
            
        finally:
            # Ensure resources are cleaned up
            if 'cur' in locals(): cur.close()
            if 'conn' in locals(): conn.close()

# ====== GLOBAL DATA INITIALIZATION ======
# Load restaurant data at startup
restaurants = get_restaurants()

# Initialize recommendation systems
tfidf_recommender = Recommender()  # Content-based recommender
knn_recommender = KNNRecommender(restaurants)  # Collaborative filtering recommender

# ====== ROUTE HANDLERS ======
@app.route('/recommend', methods=['POST'])
def recommend():
    """Handle recommendation requests based on user preferences"""
    try:
        # Parse JSON request data
        data = json.loads(request.data)
        
        # Get recommendations from TF-IDF model
        recommendations = tfidf_recommender.get_recommendations(
            data['cuisine'],  # Required cuisine type
            data.get('price_range', ''),  # Optional price range
            float(data.get('rating', 3.5)),  # Default rating: 3.5
            restaurants  # Dataset to search
        )
        
        # Return top 10 recommendations
        return jsonify(recommendations[:10])
    
    except Exception as e:
        # Log and return error
        logger.error(f"Recommendation error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/similar/<int:restaurant_id>', methods=['GET'])
def get_similar(restaurant_id):
    """Find similar restaurants using KNN model"""
    try:
        # Get similar restaurants
        similar = knn_recommender.get_similar(restaurant_id)
        return jsonify(similar)
    
    except Exception as e:
        logger.error(f"Similarity error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/restaurant/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    """Fetch details for a specific restaurant"""
    try:
        # Find restaurant by ID
        restaurant = next((r for r in restaurants if r['id'] == restaurant_id), None)
        
        # Return result or 404 error
        if restaurant:
            return jsonify(restaurant)
        return jsonify({"error": "Restaurant not found"}), 404
    
    except Exception as e:
        logger.error(f"Restaurant lookup error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/track-click', methods=['POST'])
def track_click():
    """Track restaurant clicks for personalization"""
    try:
        # Log click event
        data = request.get_json()
        logger.info(f"Tracked click for restaurant: {data.get('id')}")
        return jsonify({"status": "success"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ====== APPLICATION ENTRY POINT ======
if __name__ == '__main__':
    # Start Flask development server
    app.run(host='0.0.0.0', port=5000)  # Listen on all interfaces