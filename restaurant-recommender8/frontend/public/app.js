const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5001' 
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

        if (!response.ok) throw new Error(`Enter a value between 1 and 5 for rating`);
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
            <p><span class="detail-label">Cuisine:</span> 
               <span class="detail-value">${r.cuisine} ${getCountryFlag(r.cuisine)}</span></p>
            <p><span class="detail-label">Price:</span> 
               <span class="detail-value">${r.price_range} (Avg. $${r.avg_price_per_person}/person)</span></p>
            <p><span class="detail-label">Rating:</span> 
               <span class="detail-value">${r.rating} ⭐ (${r.review_count} reviews)</span></p>
            <p><span class="detail-label">Location:</span> 
               <span class="detail-value">${r.city}</span></p>
            <p><span class="detail-label">Hours:</span> 
               <span class="detail-value">${r.popular_hours}</span></p>
        </div>`;
    });
    html += '</div>';
    document.getElementById('results').innerHTML = html;
}

async function loadHomeRecommendations() {
    const clicks = JSON.parse(localStorage.getItem('restaurant_clicks') || '[]');
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
    let html = `
        <h2>Recommended For You</h2>
        <div class="results-grid">
    `;
    
    restaurants.forEach(r => {
        html += `
            <div class="restaurant-card" onclick="handleRestaurantClick(${r.id})">
                <h3>${r.name}</h3>
                <p><span class="detail-label">Cuisine:</span> 
                   <span class="detail-value">${r.cuisine} ${getCountryFlag(r.cuisine)}</span></p>
                <p><span class="detail-label">Rating:</span> 
                   <span class="detail-value">${r.rating} ⭐</span></p>
                <p><span class="detail-label">Price:</span> 
                   <span class="detail-value">${r.price_range}</span></p>
            </div>
        `;
    });
    
    html += `</div>`;
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

function getCountryFlag(cuisine) {
    const flagMap = {
        'American': 'us',
        'Brazilian': 'br',
        'Caribbean': 'jm',
        'Chinese': 'cn',
        'French': 'fr',
        'German': 'de',
        'Greek': 'gr',
        'Indian': 'in',
        'Italian': 'it',
        'Japanese': 'jp',
        'Korean': 'kr',
        'Lebanese': 'lb',
        'Mediterranean': 'eu',
        'Mexican': 'mx',
        'Moroccan': 'ma',
        'Peruvian': 'pe',
        'Spanish': 'es',
        'Thai': 'th',
        'Turkish': 'tr',
        'Vietnamese': 'vn'
    };

    const code = flagMap[cuisine];
    return code ? `<img src="https://flagcdn.com/24x18/${code}.png" 
                      class="flag" 
                      alt="${cuisine} flag">` : '';
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
                <p><span class="detail-label">Cuisine:</span> 
                   <span class="detail-value">${restaurant.cuisine} ${getCountryFlag(restaurant.cuisine)}</span></p>
                <p><span class="detail-label">Price Range:</span> 
                   <span class="detail-value">${restaurant.price_range}</span></p>
                <p><span class="detail-label">Average Price:</span> 
                   <span class="detail-value">$${restaurant.avg_price_per_person}/person</span></p>
                <p><span class="detail-label">Rating:</span> 
                   <span class="detail-value">${restaurant.rating} ⭐ (${restaurant.review_count} reviews)</span></p>
                <p><span class="detail-label">Address:</span> 
                   <span class="detail-value">${restaurant.address}, ${restaurant.city}</span></p>
                <p><span class="detail-label">Hours:</span> 
                   <span class="detail-value">${restaurant.popular_hours}</span></p>
                ${restaurant.website ? `<p><a href="${restaurant.website}" target="_blank" class="website-link">Visit Website</a></p>` : ''}
            </div>`;
            
        document.getElementById('restaurant-details').innerHTML = html;
    } catch (error) {
        document.getElementById('restaurant-details').innerHTML = `
            <div class="error">Error loading details: ${error.message}</div>`;
    }
}