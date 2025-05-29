CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cuisine VARCHAR(50) NOT NULL,
    price_range VARCHAR(10) NOT NULL,
    avg_price_per_person NUMERIC(8,2),
    region VARCHAR(50),
    city VARCHAR(100),
    address VARCHAR(255),
    phone VARCHAR(50),
    rating NUMERIC(2,1),
    review_count INTEGER,
    website VARCHAR(255),
    popular_hours VARCHAR(50)
);

COPY restaurants(name, cuisine, price_range, avg_price_per_person, region, city, 
                address, phone, rating, review_count, website, popular_hours)
FROM '/docker-entrypoint-initdb.d/restaurants.csv' DELIMITER ',' CSV HEADER;