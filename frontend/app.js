const API_URL = "http://127.0.0.1:8000";

// ==================================================
// API HEALTH CHECK
// ==================================================
async function checkApiHealth() {
    const statusElement = document.getElementById("apiStatus");
    if (!statusElement) return;

    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            statusElement.innerHTML = `<span class="status-dot" style="background: #159a61;"></span><span>API Online</span>`;
            statusElement.style.color = "#159a61";
        } else {
            throw new Error("API not okay");
        }
    } catch (e) {
        statusElement.innerHTML = `<span class="status-dot" style="background: #dc3f3f;"></span><span>API Offline</span>`;
        statusElement.style.color = "#dc3f3f";
        console.warn("API Offline:", e);
    }
}
checkApiHealth();


// ==================================================
// LEAFLET MAP INTEGRATION
// ==================================================
let map;
let marker;

function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    // Center roughly around the available DEM area (Uttarakhand)
    map = L.map('map').setView([30.5, 79.5], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', function (e) {
        setMapLocation(e.latlng.lat, e.latlng.lng);
    });
}

function setMapLocation(lat, lng) {
    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng]).addTo(map);
    }
    
    document.getElementById("map_latitude").value = lat.toFixed(8);
    document.getElementById("map_longitude").value = lng.toFixed(8);
}

document.addEventListener("DOMContentLoaded", initMap);

const useMapLocationBtn = document.getElementById("useMapLocation");
if (useMapLocationBtn) {
    useMapLocationBtn.addEventListener("click", async () => {
        const lat = Number(document.getElementById("map_latitude").value);
        const lng = Number(document.getElementById("map_longitude").value);
        const statusDiv = document.getElementById("locationStatus");
        
        if (!lat || !lng || isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            statusDiv.textContent = "Please enter valid latitude and longitude, or click on the map.";
            statusDiv.style.color = "#dc3f3f";
            return;
        }
        
        statusDiv.textContent = "Fetching terrain and rainfall data...";
        statusDiv.style.color = "#d48b16";
        useMapLocationBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/features?latitude=${lat}&longitude=${lng}`);
            if (!response.ok) throw new Error("API Error");
            const data = await response.json();
            
            if (data.error) {
                statusDiv.textContent = data.error;
                statusDiv.style.color = "#dc3f3f";
            } else {
                // Populate main form
                document.getElementById("latitude").value = data.latitude;
                document.getElementById("longitude").value = data.longitude;
                document.getElementById("elevation_m").value = data.elevation_m.toFixed(6);
                document.getElementById("slope_degree").value = data.slope_degree.toFixed(6);
                
                if (data.rainfall_mm_hr !== null) document.getElementById("rainfall_mm_hr").value = data.rainfall_mm_hr.toFixed(6);
                if (data.rain_1h !== null) document.getElementById("rain_1h").value = data.rain_1h.toFixed(6);
                if (data.rain_3h !== null) document.getElementById("rain_3h").value = data.rain_3h.toFixed(6);
                if (data.rain_6h !== null) document.getElementById("rain_6h").value = data.rain_6h.toFixed(6);
                if (data.rain_12h !== null) document.getElementById("rain_12h").value = data.rain_12h.toFixed(6);
                if (data.rain_24h !== null) document.getElementById("rain_24h").value = data.rain_24h.toFixed(6);
                if (data.rainfall_change !== null) document.getElementById("rainfall_change").value = data.rainfall_change.toFixed(6);
                
                statusDiv.textContent = "Location data loaded successfully!";
                statusDiv.style.color = "#159a61";
                
                // Also put a marker if manually typed
                if (marker) {
                    marker.setLatLng([lat, lng]);
                } else {
                    marker = L.marker([lat, lng]).addTo(map);
                }
                map.setView([lat, lng], 10);
            }
        } catch (error) {
            statusDiv.textContent = "Failed to fetch location data. Ensure backend is running.";
            statusDiv.style.color = "#dc3f3f";
        } finally {
            useMapLocationBtn.disabled = false;
        }
    });
}

const clearMapLocationBtn = document.getElementById("clearMapLocation");
if (clearMapLocationBtn) {
    clearMapLocationBtn.addEventListener("click", () => {
        document.getElementById("map_latitude").value = "";
        document.getElementById("map_longitude").value = "";
        document.getElementById("latitude").value = "";
        document.getElementById("longitude").value = "";
        document.getElementById("locationStatus").textContent = "";
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
    });
}


// ==================================================
// FORM SUBMISSION
// ==================================================

const predictionForm = document.getElementById("predictionForm");

if (predictionForm) {
    predictionForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const button = document.getElementById("predictButton");

        // GET INPUT VALUES
        const rainfall_mm_hr = Number(document.getElementById("rainfall_mm_hr").value);
        const elevation_m = Number(document.getElementById("elevation_m").value);
        const slope_degree = Number(document.getElementById("slope_degree").value);
        
        let latitude = document.getElementById("latitude").value;
        latitude = latitude ? Number(latitude) : null;
        
        let longitude = document.getElementById("longitude").value;
        longitude = longitude ? Number(longitude) : null;
        
        const rain_1h = Number(document.getElementById("rain_1h").value);
        const rain_3h = Number(document.getElementById("rain_3h").value);
        const rain_6h = Number(document.getElementById("rain_6h").value);
        const rain_12h = Number(document.getElementById("rain_12h").value);
        const rain_24h = Number(document.getElementById("rain_24h").value);
        const rainfall_change = Number(document.getElementById("rainfall_change").value);

        // VALIDATE VALUES
        const requiredValues = [
            rainfall_mm_hr, elevation_m, slope_degree,
            rain_1h, rain_3h, rain_6h, rain_12h, rain_24h, rainfall_change
        ];

        if (requiredValues.some(value => !Number.isFinite(value))) {
            showError("Please enter valid numeric values in all required fields.");
            return;
        }

        // UPDATE RAINFALL SUMMARY
        updateRainfallSummary({
            rainfall_mm_hr, rain_1h, rain_3h, rain_6h, rain_12h, rain_24h
        });

        // LOADING STATE
        button.disabled = true;
        button.innerHTML = `<span>⏳</span> Predicting...`;

        try {
            const requestBody = {
                rainfall_mm_hr, elevation_m, slope_degree,
                rain_1h, rain_3h, rain_6h, rain_12h, rain_24h, rainfall_change
            };
            if (latitude !== null && longitude !== null) {
                requestBody.latitude = latitude;
                requestBody.longitude = longitude;
            }

            const response = await fetch(`${API_URL}/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            displayResult(result, latitude, longitude);
            savePredictionToHistory(result, { latitude, longitude, rainfall_mm_hr });

        } catch (error) {
            console.error("Prediction error:", error);
            showError(error.message);
        } finally {
            button.disabled = false;
            button.innerHTML = `<span>⚡</span> Predict Flood Risk`;
        }
    });
}

function updateRainfallSummary(data) {
    const fields = {
        'summary-current': data.rainfall_mm_hr,
        'summary-1h': data.rain_1h,
        'summary-3h': data.rain_3h,
        'summary-6h': data.rain_6h,
        'summary-12h': data.rain_12h,
        'summary-24h': data.rain_24h
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = Number(value).toFixed(6);
        }
    });
}

function displayResult(result, latitude, longitude) {
    const container = document.getElementById("resultContainer");
    if (!container) return;

    const probability = Number(result.flood_probability) * 100;
    const isFlood = Number(result.prediction) === 1;
    const risk = String(result.risk_level || "LOW").toLowerCase();
    
    let locStr = "";
    if (result.location) {
        locStr = `<p style="font-size:12px; color:#8791a0; margin-top:5px;">📍 ${result.location.latitude.toFixed(6)}, ${result.location.longitude.toFixed(6)}</p>`;
    }

    container.innerHTML = `
        <div class="result-content">
            <div class="result-icon">${isFlood ? "⚠️" : "✅"}</div>
            <div class="risk-label">RISK LEVEL</div>
            <h2 class="result-risk ${risk}">${result.risk_level}</h2>
            <p class="result-label">${isFlood ? "Flood conditions detected" : "No significant flood conditions detected"}</p>
            <div class="probability-box">
                <strong class="probability-value">${probability.toFixed(2)}%</strong>
                <span class="probability-label">Flood Probability</span>
            </div>
            <div class="prediction-status">
                <span>Model Prediction</span>
                <strong>${isFlood ? "FLOOD" : "NO FLOOD"}</strong>
            </div>
            ${locStr}
        </div>
    `;
}

function showError(message) {
    const container = document.getElementById("resultContainer");
    if (!container) return;
    container.innerHTML = `
        <div class="result-placeholder">
            <div class="placeholder-icon">❌</div>
            <h3>Prediction Failed</h3>
            <p>Unable to complete the prediction.</p>
            <small>${message}</small>
        </div>
    `;
}

function savePredictionToHistory(result, inputData) {
    const history = JSON.parse(localStorage.getItem("floodPredictionHistory") || "[]");
    
    const latStr = inputData.latitude !== null ? Number(inputData.latitude).toFixed(6) : "N/A";
    const lngStr = inputData.longitude !== null ? Number(inputData.longitude).toFixed(6) : "N/A";

    const prediction = {
        time: new Date().toLocaleString(),
        latitude: latStr,
        longitude: lngStr,
        rainfall: inputData.rainfall_mm_hr,
        probability: result.flood_probability,
        risk: result.risk_level,
        prediction: result.prediction
    };

    history.unshift(prediction);
    const latestHistory = history.slice(0, 10);
    localStorage.setItem("floodPredictionHistory", JSON.stringify(latestHistory));
    displayPredictionHistory();
}

function displayPredictionHistory() {
    const container = document.getElementById("predictionHistory");
    if (!container) return;

    const history = JSON.parse(localStorage.getItem("floodPredictionHistory") || "[]");
    if (history.length === 0) {
        container.innerHTML = `
            <div class="history-empty">
                <div class="history-empty-icon">📊</div>
                <h3>No predictions yet</h3>
                <p>Your recent predictions will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = history.map(item => {
        const probability = (Number(item.probability) * 100).toFixed(2);
        const isFlood = Number(item.prediction) === 1;
        const risk = String(item.risk || "LOW").toLowerCase();
        
        let locText = item.latitude !== "N/A" ? `📍 ${item.latitude}, ${item.longitude}` : `📍 Location not provided`;

        return `
            <div class="history-item">
                <div class="history-main">
                    <div class="history-risk ${risk}">${isFlood ? "⚠️" : "✅"} ${item.risk}</div>
                    <div class="history-location">${locText}</div>
                    <div class="history-time">${item.time}</div>
                </div>
                <div class="history-details">
                    <div><span>Rainfall</span><strong>${Number(item.rainfall).toFixed(2)} mm/hr</strong></div>
                    <div><span>Probability</span><strong>${probability}%</strong></div>
                    <div><span>Result</span><strong>${isFlood ? "FLOOD" : "NO FLOOD"}</strong></div>
                </div>
            </div>
        `;
    }).join("");
}

displayPredictionHistory();