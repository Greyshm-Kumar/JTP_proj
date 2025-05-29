FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY knn_model.joblib .
COPY encoders.joblib .
COPY scaler.joblib .
COPY restaurant_ids.csv .

CMD ["python", "app.py"]