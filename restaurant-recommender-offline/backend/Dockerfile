FROM python:3.8-slim

WORKDIR /app

# Copy requirements and install from local wheelhouse
COPY wheelhouse /wheelhouse
COPY requirements.txt .
RUN pip install --no-index --find-links=/wheelhouse -r requirements.txt

# Copy application files
COPY . .
COPY knn_model.joblib .
COPY encoders.joblib .
COPY scaler.joblib .
COPY restaurant_ids.csv .

CMD ["python", "app.py"]