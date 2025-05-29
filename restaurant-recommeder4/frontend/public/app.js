const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : '/api';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('restaurant.html')) {
        loadRestaurantDetails();
    } else if (window.location.pathname.endsWith('recommend.html')) {
        document.querySelector('button').addEventListener('click', getRecommendations);
    } else {
        loadHomeRecommendations();
    }
});

async function getRecommendations() {
    const inputs = {
        cuisine: document.getElementById('cuisine').value,
        price_range: document.getElementById('price_range').value,
        rating: parseFloat(document.getElementById('rating').value) || 3.5
    };

    try {
        const response = await fetch(`${API_BASE}/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(inputs)
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const results = await response.json();
        displayResults(results);
        
    } catch (error) {
        document.getElementById('results').innerHTML = `
            <div class="error">
                Error: ${error.message}
            </div>`;
    }
}

function displayResults(restaurants) {
    let html = '<div class="results-grid">';
    restaurants.forEach(r => {
        html += `
        <div class="restaurant-card" onclick="handleRestaurantClick(${r.id})">
            <h3>${r.name}</h3>
            <p><strong>Cuisine:</strong> ${r.cuisine}</p>
            <p><strong>Price:</strong> ${r.price_range} (Avg. $${r.avg_price_per_person}/person)</p>
            <p><strong>Rating:</strong> ${r.rating} ⭐ (${r.review_count} reviews)</p>
            <p><strong>Location:</strong> ${r.city}</p>
            <p><strong>Hours:</strong> ${r.popular_hours}</p>
        </div>`;
    });
    html += '</div>';
    document.getElementById('results').innerHTML = html;
}

async function loadHomeRecommendations() {
    const clicks = JSON.parse(localStorage.getItem('restaurant_clicks') || []);
    if (clicks.length > 0) {
        try {
            const response = await fetch(`${API_BASE}/similar/${clicks[clicks.length-1]}`);
            if (!response.ok) throw new Error('Failed to get recommendations');
            const results = await response.json();
            displayHomeRecommendations(results);
        } catch (error) {
            document.getElementById('recommendations').innerHTML = `
                <div class="error">
                    Failed to load recommendations: ${error.message}
                </div>`;
        }
    } else {
        document.getElementById('recommendations').innerHTML = `
            <div class="info">
                No recommendations yet. Start searching and clicking restaurants!
            </div>`;
    }
}

function displayHomeRecommendations(restaurants) {
    let html = '<h2>Based on Your Recent Clicks</h2><div class="results-grid">';
    restaurants.forEach(r => {
        html += `
        <div class="restaurant-card" onclick="handleRestaurantClick(${r.id})">
            <h3>${r.name}</h3>
            <p><strong>Cuisine:</strong> ${r.cuisine}</p>
            <p><strong>Rating:</strong> ${r.rating} ⭐</p>
            <p><strong>Price:</strong> ${r.price_range}</p>
        </div>`;
    });
    html += '</div>';
    document.getElementById('recommendations').innerHTML = html;
}

function handleRestaurantClick(id) {
    fetch(`${API_BASE}/track-click`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: id })
    });
    
    let clicks = JSON.parse(localStorage.getItem('restaurant_clicks') || '[]');
    clicks = [...new Set([...clicks, id])].slice(-5);
    localStorage.setItem('restaurant_clicks', JSON.stringify(clicks));
    
    window.location.href = `restaurant.html?id=${id}`;
}

async function loadRestaurantDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');
    
    if (!restaurantId) {
        document.getElementById('restaurant-details').innerHTML = `
            <div class="error">No restaurant selected</div>`;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/restaurant/${restaurantId}`);
        if (!response.ok) throw new Error('Restaurant not found');
        const restaurant = await response.json();
        
        const html = `
            <div class="restaurant-detail-card">
                <h1>${restaurant.name}</h1>
                <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
                <p><strong>Price Range:</strong> ${restaurant.price_range}</p>
                <p><strong>Average Price:</strong> $${restaurant.avg_price_per_person}/person</p>
                <p><strong>Rating:</strong> ${restaurant.rating} ⭐ (${restaurant.review_count} reviews)</p>
                <p><strong>Address:</strong> ${restaurant.address}, ${restaurant.city}</p>
                <p><strong>Hours:</strong> ${restaurant.popular_hours}</p>
                ${restaurant.website ? `<p><a href="${restaurant.website}" target="_blank">Website</a></p>` : ''}
            </div>`;
            
        document.getElementById('restaurant-details').innerHTML = html;
    } catch (error) {
        document.getElementById('restaurant-details').innerHTML = `
            <div class="error">Error loading details: ${error.message}</div>`;
    }
}