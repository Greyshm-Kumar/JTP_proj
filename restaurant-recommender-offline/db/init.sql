CREATE TABLE restaurants (
    id INTEGER PRIMARY KEY,
    name TEXT,
    cuisine TEXT,
    price_range TEXT,
    avg_price_per_person FLOAT,
    region TEXT,
    city TEXT,
    address TEXT,
    phone TEXT,
    rating FLOAT,
    review_count INTEGER,
    website TEXT,
    popular_hours TEXT
);

COPY restaurants FROM '/docker-entrypoint-initdb.d/restaurants.csv' DELIMITER ',' CSV HEADER;