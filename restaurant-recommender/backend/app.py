from flask import Flask, jsonify, request
from flask_cors import CORS  # Add CORS support
from model import Recommender
import psycopg2
import os
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'db'),
    'database': os.getenv('DB_NAME', 'restaurants'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASS', 'password')
}

def get_restaurants():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute('SELECT * FROM restaurants;')
        columns = [desc[0] for desc in cur.description]
        restaurants = [dict(zip(columns, row)) for row in cur.fetchall()]
        return restaurants
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        raise
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

recommender = Recommender()

@app.route('/recommend', methods=['POST'])
def recommend():
    logger.debug(f"Received headers: {dict(request.headers)}")
    logger.debug(f"Raw data: {request.get_data(as_text=True)}")

    try:
        # Manually parse JSON to debug
        if request.content_type.startswith('application/json'):
            data = json.loads(request.get_data(as_text=True))
        else:
            return jsonify({"error": "Unsupported Content-Type"}), 415
            
        logger.debug(f"Parsed JSON: {data}")
        
        if 'cuisine' not in data:
            return jsonify({"error": "Missing required 'cuisine' parameter"}), 400
            
        restaurants = get_restaurants()
        recommendations = recommender.get_recommendations(
            data['cuisine'],
            data.get('price_range', ''),
            float(data.get('rating', 3.5)),
            restaurants
        )
        return jsonify(recommendations[:5])
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return jsonify({"error": f"Invalid JSON: {str(e)}"}), 400
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)