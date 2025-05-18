document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('button').addEventListener('click', getRecommendations);
});

async function getRecommendations() {
    const inputs = {
        cuisine: document.getElementById('cuisine').value,
        price_range: document.getElementById('price_range').value,
        rating: parseFloat(document.getElementById('rating').value) || 3.5
    };

    try {
        const response = await fetch('http://localhost:5000/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(inputs)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const results = await response.json();
        displayResults(results);
        
    } catch (error) {
        console.error('Error:', error);
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
        <div class="restaurant-card">
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