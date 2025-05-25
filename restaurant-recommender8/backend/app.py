from flask import Flask, jsonify, request
from flask_cors import CORS
from model import Recommender, KNNRecommender
import psycopg2
import os
import logging
import json
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3001", "http://frontend:81"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'db'),
    'database': os.getenv('DB_NAME', 'restaurants'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASS', 'password'),
    'port': 5432
}

def get_restaurants():
    max_retries = 5
    retry_delay = 3
    
    for i in range(max_retries):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cur = conn.cursor()
            cur.execute('SELECT * FROM restaurants;')
            columns = [desc[0] for desc in cur.description]
            restaurants = [dict(zip(columns, row)) for row in cur.fetchall()]
            return restaurants
        except psycopg2.OperationalError as e:
            if i == max_retries - 1:
                logger.error(f"Database connection failed: {str(e)}")
                raise
            logger.warning(f"Retrying database connection ({i+1}/{max_retries})...")
            time.sleep(retry_delay)
        finally:
            if 'cur' in locals(): cur.close()
            if 'conn' in locals(): conn.close()

restaurants = get_restaurants()
tfidf_recommender = Recommender()
knn_recommender = KNNRecommender(restaurants)

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = json.loads(request.data)
        recommendations = tfidf_recommender.get_recommendations(
            data['cuisine'],
            data.get('price_range', ''),
            float(data.get('rating', 3.5)),
            restaurants
        )
        return jsonify(recommendations[:10])
    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/similar/<int:restaurant_id>', methods=['GET'])
def get_similar(restaurant_id):
    try:
        similar = knn_recommender.get_similar(restaurant_id)
        return jsonify(similar)
    except Exception as e:
        logger.error(f"Similarity error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/restaurant/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    try:
        restaurant = next((r for r in restaurants if r['id'] == restaurant_id), None)
        if restaurant:
            return jsonify(restaurant)
        return jsonify({"error": "Restaurant not found"}), 404
    except Exception as e:
        logger.error(f"Restaurant lookup error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/track-click', methods=['POST'])
def track_click():
    try:
        data = request.get_json()
        logger.info(f"Tracked click for restaurant: {data.get('id')}")
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)