import os

with open("frontend/index.html", "w") as f:
    f.write("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flash Flood Prediction System</title>
    <!-- Leaflet CSS & JS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="navbar">
        <div class="brand">
            <div class="brand-icon">🌧️</div>
            <div>
                <h1>Flash Flood Prediction</h1>
                <p>Real-Time Risk Monitoring for West Bengal</p>
            </div>
        </div>
        <div class="status" id="apiStatus">
            <span class="status-dot"></span>
            <span>API Offline</span>
        </div>
    </header>

    <main class="container">
        <!-- Dashboard Top row: Map and Current Conditions -->
        <div class="dashboard-top-row">
            <!-- Map Panel -->
            <div class="card map-card">
                <div class="card-header">
                    <div>
                        <h3>Location Selection</h3>
                        <p>Select a region or use current location</p>
                    </div>
                    <div class="map-actions">
                        <button type="button" id="useMyCurrentLocation" class="action-btn">📍 My Location</button>
                        <button type="button" id="demoKolkata" class="action-btn demo-btn">🏙️ Kolkata Demo</button>
                    </div>
                </div>
                <div id="map" class="map-container"></div>
                <div class="location-details">
                    <p><strong>Selected Location:</strong> <span id="loc_name">—</span></p>
                    <p><strong>Lat/Lng:</strong> <span id="loc_coords">—</span></p>
                    <p><strong>District:</strong> <span id="loc_district">—</span></p>
                    <p><strong>State:</strong> <span id="loc_state">—</span></p>
                </div>
                <div id="locationStatus" class="status-msg"></div>
            </div>

            <!-- Current Weather & Prediction -->
            <div class="card weather-card">
                <div class="card-header">
                    <div>
                        <h3>Current Conditions & Risk</h3>
                        <p>Data Source: <span id="dataSourceBadge" class="badge">Unknown</span></p>
                    </div>
                </div>
                
                <div class="weather-grid">
                    <div class="weather-item">
                        <span class="icon">🌡️</span>
                        <div class="val" id="val_temp">—</div>
                        <div class="lbl">Temp (°C)</div>
                    </div>
                    <div class="weather-item">
                        <span class="icon">💧</span>
                        <div class="val" id="val_hum">—</div>
                        <div class="lbl">Humidity (%)</div>
                    </div>
                    <div class="weather-item">
                        <span class="icon">💨</span>
                        <div class="val" id="val_wind">—</div>
                        <div class="lbl">Wind (km/h)</div>
                    </div>
                </div>

                <hr class="divider">
                
                <div class="terrain-info">
                    <p><strong>Elevation:</strong> <span id="val_elevation">—</span></p>
                    <p><strong>Slope:</strong> <span id="val_slope">—</span></p>
                </div>

                <hr class="divider">
                
                <button type="button" id="predictButton" class="predict-button" disabled>⚡ Predict Flood Risk</button>
                
                <div id="resultContainer" class="result-container hidden">
                    <div id="riskLevelBadge" class="risk-badge">MEDIUM</div>
                    <div class="risk-stats">
                        <p><strong>Probability:</strong> <span id="riskProbability">—</span>%</p>
                        <p><strong>Model Output:</strong> <span id="riskModelPrediction">—</span></p>
                    </div>
                    <p class="risk-explanation" id="riskExplanation">Waiting for prediction...</p>
                </div>
            </div>
        </div>

        <!-- Rainfall Panel -->
        <div class="card">
            <div class="card-header">
                <div>
                    <h3>Rainfall Data</h3>
                    <p>Accumulation and 7-day history</p>
                </div>
                <div class="rainfall-trend">
                    Trend: <span id="val_trend">—</span>
                </div>
            </div>
            
            <div class="rainfall-top">
                <div class="rainfall-grid">
                    <div class="rainfall-card"><strong>Current</strong><br><span id="val_rain_cur">—</span> mm/hr</div>
                    <div class="rainfall-card"><strong>1 Hour</strong><br><span id="val_rain_1h">—</span> mm</div>
                    <div class="rainfall-card"><strong>3 Hours</strong><br><span id="val_rain_3h">—</span> mm</div>
                    <div class="rainfall-card"><strong>6 Hours</strong><br><span id="val_rain_6h">—</span> mm</div>
                    <div class="rainfall-card"><strong>12 Hours</strong><br><span id="val_rain_12h">—</span> mm</div>
                    <div class="rainfall-card"><strong>24 Hours</strong><br><span id="val_rain_24h">—</span> mm</div>
                    <div class="rainfall-card"><strong>Change</strong><br><span id="val_rain_chg">—</span> mm/hr</div>
                </div>
                <div class="chart-container">
                    <canvas id="rainfallChart"></canvas>
                </div>
            </div>
        </div>
        
        <!-- Hidden Inputs for Model -->
        <form id="predictionForm" style="display:none;">
            <input type="number" id="rainfall_mm_hr" required>
            <input type="number" id="elevation_m" required>
            <input type="number" id="slope_degree" required>
            <input type="number" id="latitude">
            <input type="number" id="longitude">
            <input type="number" id="rain_1h" required>
            <input type="number" id="rain_3h" required>
            <input type="number" id="rain_6h" required>
            <input type="number" id="rain_12h" required>
            <input type="number" id="rain_24h" required>
            <input type="number" id="rainfall_change" required>
        </form>

        <!-- Prediction History -->
        <section class="history-section">
            <div class="history-header">
                <div>
                    <h3>Prediction History</h3>
                </div>
                <button type="button" id="clearHistoryButton" class="clear-history-button">Clear History</button>
            </div>
            <div id="predictionHistory" class="prediction-history"></div>
        </section>

    </main>
    <footer>
        <p>Flash Flood Prediction System · AI-based prototype</p>
    </footer>
    <script src="app.js"></script>
</body>
</html>
""")
