import os

with open("frontend/app.js", "w") as f:
    f.write("""
const API_URL = "http://127.0.0.1:8000/api";

let map;
let marker;
let chartInstance;

// Elements
const locNameEl = document.getElementById("loc_name");
const locCoordsEl = document.getElementById("loc_coords");
const locDistrictEl = document.getElementById("loc_district");
const locStateEl = document.getElementById("loc_state");

const predictBtn = document.getElementById("predictButton");
const statusDiv = document.getElementById("locationStatus");

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    checkApiHealth();
    loadHistory();
    
    document.getElementById("useMyCurrentLocation").addEventListener("click", useCurrentLocation);
    document.getElementById("demoKolkata").addEventListener("click", () => setLocation(22.5726, 88.3639));
    document.getElementById("predictButton").addEventListener("click", runPrediction);
    document.getElementById("clearHistoryButton").addEventListener("click", clearHistory);
});

async function checkApiHealth() {
    const statusElement = document.getElementById("apiStatus");
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            statusElement.innerHTML = `<span class="status-dot" style="background: var(--success);"></span><span style="color:var(--success);">API Online</span>`;
        } else throw new Error();
    } catch {
        statusElement.innerHTML = `<span class="status-dot" style="background: var(--danger);"></span><span style="color:var(--danger);">API Offline</span>`;
    }
}

function initMap() {
    map = L.map('map').setView([22.5, 88.3], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', function (e) {
        setLocation(e.latlng.lat, e.latlng.lng);
    });
}

function useCurrentLocation() {
    if (navigator.geolocation) {
        statusDiv.textContent = "Requesting location...";
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation(pos.coords.latitude, pos.coords.longitude),
            (err) => { statusDiv.textContent = "Geolocation denied/failed. Please select manually."; }
        );
    } else {
        statusDiv.textContent = "Geolocation not supported by browser.";
    }
}

async function setLocation(lat, lng) {
    // Update map marker
    if (marker) marker.setLatLng([lat, lng]);
    else marker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 10);
    
    locCoordsEl.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    document.getElementById("latitude").value = lat;
    document.getElementById("longitude").value = lng;
    
    predictBtn.disabled = true;
    statusDiv.textContent = "Fetching location data...";

    try {
        // Fetch location name
        const locRes = await fetch(`${API_URL}/location?latitude=${lat}&longitude=${lng}`);
        if(locRes.ok) {
            const locData = await locRes.json();
            locNameEl.textContent = locData.location_name || "Unknown";
            locDistrictEl.textContent = locData.district || "—";
            locStateEl.textContent = locData.state || "—";
        }

        // Fetch features (weather & terrain)
        const featRes = await fetch(`${API_URL}/features?latitude=${lat}&longitude=${lng}`);
        const featData = await featRes.json();
        
        if(featData.error) {
            statusDiv.textContent = featData.error;
            document.getElementById("val_elevation").textContent = "—";
            document.getElementById("val_slope").textContent = "—";
        } else {
            statusDiv.textContent = "Data loaded successfully.";
            document.getElementById("val_elevation").textContent = featData.elevation_m.toFixed(2) + " m";
            document.getElementById("val_slope").textContent = featData.slope_degree.toFixed(2) + "°";
            
            document.getElementById("elevation_m").value = featData.elevation_m;
            document.getElementById("slope_degree").value = featData.slope_degree;
        }

        // Always update weather if available
        if(!featData.error || featData.temperature !== undefined) {
            document.getElementById("val_temp").textContent = featData.temperature?.toFixed(1) || 0;
            document.getElementById("val_hum").textContent = featData.humidity?.toFixed(1) || 0;
            document.getElementById("val_wind").textContent = featData.wind_speed?.toFixed(1) || 0;
            document.getElementById("dataSourceBadge").textContent = featData.data_source || "Unknown";
            
            document.getElementById("val_rain_cur").textContent = featData.rainfall_mm_hr?.toFixed(2) || 0;
            document.getElementById("val_rain_1h").textContent = featData.rain_1h?.toFixed(2) || 0;
            document.getElementById("val_rain_3h").textContent = featData.rain_3h?.toFixed(2) || 0;
            document.getElementById("val_rain_6h").textContent = featData.rain_6h?.toFixed(2) || 0;
            document.getElementById("val_rain_12h").textContent = featData.rain_12h?.toFixed(2) || 0;
            document.getElementById("val_rain_24h").textContent = featData.rain_24h?.toFixed(2) || 0;
            
            const change = featData.rain_1h - (featData.rain_3h / 3.0);
            document.getElementById("val_rain_chg").textContent = change.toFixed(2);
            
            // Populate form
            document.getElementById("rainfall_mm_hr").value = featData.rainfall_mm_hr || 0;
            document.getElementById("rain_1h").value = featData.rain_1h || 0;
            document.getElementById("rain_3h").value = featData.rain_3h || 0;
            document.getElementById("rain_6h").value = featData.rain_6h || 0;
            document.getElementById("rain_12h").value = featData.rain_12h || 0;
            document.getElementById("rain_24h").value = featData.rain_24h || 0;
            document.getElementById("rainfall_change").value = change || 0;
            
            if(!featData.error) predictBtn.disabled = false;
        }
        
        // Fetch history
        const histRes = await fetch(`${API_URL}/rainfall/history?latitude=${lat}&longitude=${lng}`);
        if(histRes.ok) {
            const histData = await histRes.json();
            renderChart(histData.history);
        }

    } catch(e) {
        statusDiv.textContent = "Error fetching data.";
        console.error(e);
    }
}

function renderChart(history) {
    if(chartInstance) chartInstance.destroy();
    
    const ctx = document.getElementById('rainfallChart').getContext('2d');
    const labels = history.map(h => h.date.substring(5)); // MM-DD
    const data = history.map(h => h.rainfall);
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rainfall (mm)',
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Calc trend
    if(data.length >= 2) {
        const last = data[data.length-1];
        const prev = data[data.length-2];
        let trend = "Stable";
        if (last > prev * 1.2) trend = "Increasing ⬆️";
        else if (last < prev * 0.8) trend = "Decreasing ⬇️";
        document.getElementById("val_trend").textContent = trend;
    }
}

async function runPrediction() {
    predictBtn.disabled = true;
    predictBtn.textContent = "⏳ Predicting...";
    
    const body = {
        latitude: Number(document.getElementById("latitude").value),
        longitude: Number(document.getElementById("longitude").value),
        elevation_m: Number(document.getElementById("elevation_m").value),
        slope_degree: Number(document.getElementById("slope_degree").value),
        rainfall_mm_hr: Number(document.getElementById("rainfall_mm_hr").value),
        rain_1h: Number(document.getElementById("rain_1h").value),
        rain_3h: Number(document.getElementById("rain_3h").value),
        rain_6h: Number(document.getElementById("rain_6h").value),
        rain_12h: Number(document.getElementById("rain_12h").value),
        rain_24h: Number(document.getElementById("rain_24h").value),
        rainfall_change: Number(document.getElementById("rainfall_change").value),
    };

    try {
        const res = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        if(!res.ok) throw new Error("Prediction API Failed");
        const data = await res.json();
        
        showResult(data);
        saveHistory(data);
    } catch(e) {
        alert("Failed to predict: " + e.message);
    } finally {
        predictBtn.disabled = false;
        predictBtn.innerHTML = "⚡ Predict Flood Risk";
    }
}

function showResult(data) {
    const cont = document.getElementById("resultContainer");
    const badge = document.getElementById("riskLevelBadge");
    const prob = document.getElementById("riskProbability");
    const model = document.getElementById("riskModelPrediction");
    const exp = document.getElementById("riskExplanation");
    
    cont.classList.remove("hidden");
    badge.className = `risk-badge risk-${data.risk_level.toLowerCase()}`;
    badge.textContent = data.risk_level;
    
    prob.textContent = (data.flood_probability * 100).toFixed(2);
    model.textContent = data.prediction === 1 ? "FLOOD" : "NO FLOOD";
    
    if (data.risk_level === "HIGH") exp.textContent = "High flood risk due to intense rainfall accumulation and terrain conditions.";
    else if (data.risk_level === "MEDIUM") exp.textContent = "Moderate risk. Continue monitoring rainfall updates.";
    else exp.textContent = "Low risk. Current conditions do not indicate immediate flash flood threat.";
}

function saveHistory(data) {
    let hist = JSON.parse(localStorage.getItem("flood_history") || "[]");
    hist.unshift({
        time: new Date().toLocaleString(),
        loc: locNameEl.textContent,
        lat: data.location.latitude.toFixed(4),
        lng: data.location.longitude.toFixed(4),
        prob: (data.flood_probability * 100).toFixed(2) + "%",
        risk: data.risk_level
    });
    if(hist.length > 10) hist = hist.slice(0, 10);
    localStorage.setItem("flood_history", JSON.stringify(hist));
    loadHistory();
}

function loadHistory() {
    const hist = JSON.parse(localStorage.getItem("flood_history") || "[]");
    const cont = document.getElementById("predictionHistory");
    
    if(hist.length === 0) {
        cont.innerHTML = "<p>No predictions yet.</p>";
        return;
    }
    
    let html = `<table><tr><th>Time</th><th>Location</th><th>Probability</th><th>Risk</th></tr>`;
    hist.forEach(h => {
        html += `<tr><td>${h.time}</td><td>${h.loc}<br><small>${h.lat}, ${h.lng}</small></td><td>${h.prob}</td><td><b>${h.risk}</b></td></tr>`;
    });
    html += `</table>`;
    cont.innerHTML = html;
}

function clearHistory() {
    localStorage.removeItem("flood_history");
    loadHistory();
}
""")
