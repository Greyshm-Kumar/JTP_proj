// ====== CONSTANTS AND CONFIGURATION ======
// Set API base URL based on current environment
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'  // Development environment
  : '/api';                   // Production environment

// ====== DOM INITIALIZATION AND ROUTING ======
// Main initialization function that runs when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Route to appropriate page handler based on current URL
  if (window.location.pathname.endsWith('restaurant.html')) {
    loadRestaurantDetails();  // Restaurant detail page
  } else if (window.location.pathname.endsWith('recommend.html')) {
    // Setup recommendation button event listener
    document.querySelector('button').addEventListener('click', getRecommendations);
  } else {
    loadHomeRecommendations();  // Home page recommendations
  }
});

// ====== RECOMMENDATION SYSTEM ======
/**
 * Fetches restaurant recommendations based on user inputs
 * @async
 */
async function getRecommendations() {
  // Get user input values from form
  const inputs = {
    cuisine: document.getElementById('cuisine').value,
    price_range: document.getElementById('price_range').value,
    rating: parseFloat(document.getElementById('rating').value) || 3.5  // Default to 3.5 if invalid
  };

  try {
    // Send POST request to recommendation endpoint
    const response = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(inputs)  // Send user inputs as JSON
    });

    // Handle non-successful HTTP responses
    if (!response.ok) throw new Error(`Enter a value between 1 and 5 for rating`);
    
    // Process successful response
    const results = await response.json();
    displayResults(results);  // Display recommendation results
        
  } catch (error) {
    // Display error message in UI
    document.getElementById('results').innerHTML = `
      <div class="error">
        Error: ${error.message}
      </div>`;
  }
}

/**
 * Displays recommendation results in the UI
 * @param {Array} restaurants - Array of restaurant objects
 */
function displayResults(restaurants) {
  // Build HTML grid structure
  let html = '<div class="results-grid">';
  
  // Generate card for each restaurant
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
  // Inject generated HTML into DOM
  document.getElementById('results').innerHTML = html;
}

// ====== HOME PAGE RECOMMENDATIONS ======
/**
 * Loads personalized recommendations for home page
 * @async
 */
async function loadHomeRecommendations() {
  // Get click history from localStorage
  const clicks = JSON.parse(localStorage.getItem('restaurant_clicks') || '[]');
  
  if (clicks.length > 0) {
    try {
      // Fetch similar restaurants based on last clicked
      const response = await fetch(`${API_BASE}/similar/${clicks[clicks.length-1]}`);
      if (!response.ok) throw new Error('Failed to get recommendations');
      
      // Process and display results
      const results = await response.json();
      displayHomeRecommendations(results);
    } catch (error) {
      // Display error message
      document.getElementById('recommendations').innerHTML = `
        <div class="error">
          Failed to load recommendations: ${error.message}
        </div>`;
    }
  } else {
    // Show empty state message
    document.getElementById('recommendations').innerHTML = `
      <div class="info">
        No recommendations yet. Start searching and clicking restaurants!
      </div>`;
  }
}

/**
 * Displays home page recommendations
 * @param {Array} restaurants - Array of restaurant objects
 */
function displayHomeRecommendations(restaurants) {
  // Build HTML structure
  let html = `
    <h2>Recommended For You</h2>
    <div class="results-grid">
  `;
  
  // Generate card for each restaurant
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
  // Inject HTML into DOM
  document.getElementById('recommendations').innerHTML = html;
}

// ====== RESTAURANT CLICK HANDLING ======
/**
 * Handles restaurant card clicks
 * @param {number} id - Restaurant ID
 */
function handleRestaurantClick(id) {
  // Send click tracking data to server
  fetch(`${API_BASE}/track-click`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ id: id })
  });
  
  // Update local click history
  let clicks = JSON.parse(localStorage.getItem('restaurant_clicks') || '[]');
  // Add new ID and maintain last 5 unique clicks
  clicks = [...new Set([...clicks, id])].slice(-5);
  localStorage.setItem('restaurant_clicks', JSON.stringify(clicks));
  
  // Navigate to detail page
  window.location.href = `restaurant.html?id=${id}`;
}

// ====== COUNTRY FLAG HELPER ======
/**
 * Gets flag image for cuisine type
 * @param {string} cuisine - Cuisine name
 * @returns {string} HTML img tag or empty string
 */
function getCountryFlag(cuisine) {
  // Map cuisine types to country codes
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

  // Return flag image if mapping exists
  const code = flagMap[cuisine];
  return code ? `<img src="https://flagcdn.com/24x18/${code}.png" 
                class="flag" 
                alt="${cuisine} flag">` : '';
}

// ====== RESTAURANT DETAILS PAGE ======
/**
 * Loads restaurant details for detail page
 * @async
 */
async function loadRestaurantDetails() {
  // Get restaurant ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('id');
  
  // Handle missing ID case
  if (!restaurantId) {
    document.getElementById('restaurant-details').innerHTML = `
      <div class="error">No restaurant selected</div>`;
    return;
  }

  try {
    // Fetch restaurant details from API
    const response = await fetch(`${API_BASE}/restaurant/${restaurantId}`);
    if (!response.ok) throw new Error('Restaurant not found');
    
    // Process response
    const restaurant = await response.json();
    
    // Build detail card HTML
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
      
    // Inject HTML into DOM
    document.getElementById('restaurant-details').innerHTML = html;
  } catch (error) {
    // Display error message
    document.getElementById('restaurant-details').innerHTML = `
      <div class="error">Error loading details: ${error.message}</div>`;
  }
}