# ====== IMPORTS ======
from sklearn.feature_extraction.text import TfidfVectorizer  # TF-IDF vectorization
from sklearn.metrics.pairwise import cosine_similarity  # Cosine similarity calculation
import joblib  # Model serialization/deserialization
import pandas as pd  # Data manipulation
import numpy as np  # Numerical operations

# ====== CONTENT-BASED RECOMMENDER ======
class Recommender:
    """Content-based recommender using TF-IDF and cosine similarity"""
    
    def __init__(self):
        """Initialize TF-IDF vectorizer"""
        self.vectorizer = TfidfVectorizer()
        
    def get_recommendations(self, target_cuisine, price_filter, min_rating, restaurants):
        """
        Get recommendations based on cuisine, price, and rating
        
        Args:
            target_cuisine (str): Desired cuisine type
            price_filter (str): Price range filter (e.g., '$', '$$')
            min_rating (float): Minimum acceptable rating
            restaurants (list): Restaurant data
            
        Returns:
            list: Recommended restaurants sorted by similarity
        """
        # Filter restaurants based on price and rating criteria
        filtered = [
            r for r in restaurants 
            if (not price_filter or r['price_range'] == price_filter) 
            and r['rating'] >= min_rating
        ]
        
        # Create feature strings combining cuisine, region, and price
        features = [f"{r['cuisine']} {r['region']} {r['price_range']}" for r in filtered]
        
        # Transform features into TF-IDF vectors
        tfidf_matrix = self.vectorizer.fit_transform(features)
        
        # Transform target cuisine into TF-IDF vector
        target_vec = self.vectorizer.transform([target_cuisine])
        
        # Calculate cosine similarity between target and restaurant features
        cosine_sim = cosine_similarity(target_vec, tfidf_matrix)
        
        # Sort restaurants by similarity score (highest first)
        sim_scores = sorted(
            enumerate(cosine_sim[0]), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        # Return filtered restaurants in similarity order
        return [filtered[i[0]] for i in sim_scores]

# ====== COLLABORATIVE FILTERING RECOMMENDER ======
class KNNRecommender:
    """K-Nearest Neighbors recommender for similar restaurants"""
    
    def __init__(self, restaurants):
        """
        Initialize KNN recommender with pre-trained components
        
        Args:
            restaurants (list): Restaurant data for ID mapping
        """
        self.restaurants = restaurants
        
        # Load pre-trained components
        self.encoders = joblib.load('encoders.joblib')  # Feature encoders
        self.scaler = joblib.load('scaler.joblib')  # Feature scaler
        self.knn = joblib.load('knn_model.joblib')  # Trained KNN model
        
        # Load restaurant ID mapping
        self.df_ids = pd.read_csv('restaurant_ids.csv')  # DB ID to index mapping
        
    def get_similar(self, restaurant_id, n=10):
        """
        Find similar restaurants using KNN
        
        Args:
            restaurant_id (int): ID of target restaurant
            n (int): Number of similar restaurants to return
            
        Returns:
            list: Similar restaurants (excluding the input restaurant)
        """
        try:
            # Find dataset index for given restaurant ID
            idx = self.df_ids[self.df_ids['db_id'] == restaurant_id].index[0]
            
            # Get nearest neighbors from KNN model
            distances, indices = self.knn.kneighbors(
                self.knn._fit_X[idx].reshape(1, -1), 
                n_neighbors=n+1  # Include self + n neighbors
            )
            
            # Return similar restaurants (excluding self)
            return [self.restaurants[i] for i in indices[0][1:]]
            
        except Exception as e:
            # Log error and return empty list on failure
            print(f"KNN recommendation failed: {str(e)}")
            return []