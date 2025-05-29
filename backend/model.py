from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import pandas as pd
import numpy as np

class Recommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        
    def get_recommendations(self, target_cuisine, price_filter, min_rating, restaurants):
        filtered = [r for r in restaurants 
                   if (not price_filter or r['price_range'] == price_filter) 
                   and r['rating'] >= min_rating]
        
        features = [f"{r['cuisine']} {r['region']} {r['price_range']}" for r in filtered]
        tfidf_matrix = self.vectorizer.fit_transform(features)
        target_vec = self.vectorizer.transform([target_cuisine])
        
        cosine_sim = cosine_similarity(target_vec, tfidf_matrix)
        sim_scores = sorted(enumerate(cosine_sim[0]), key=lambda x: x[1], reverse=True)
        return [filtered[i[0]] for i in sim_scores]

class KNNRecommender:
    def __init__(self, restaurants):
        self.restaurants = restaurants
        self.encoders = joblib.load('encoders.joblib')
        self.scaler = joblib.load('scaler.joblib')
        self.knn = joblib.load('knn_model.joblib')
        self.df_ids = pd.read_csv('restaurant_ids.csv')
        
    def get_similar(self, restaurant_id, n=10):
        try:
            idx = self.df_ids[self.df_ids['db_id'] == restaurant_id].index[0]
            distances, indices = self.knn.kneighbors(self.knn._fit_X[idx].reshape(1, -1), n_neighbors=n+1)
            return [self.restaurants[i] for i in indices[0][1:]]
        except:
            return []