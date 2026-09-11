import os

with open("frontend/style.css", "w") as f:
    f.write("""
:root {
    --primary: #1e3a8a;
    --primary-light: #3b82f6;
    --secondary: #0f172a;
    --text: #334155;
    --bg: #f8fafc;
    --card-bg: #ffffff;
    --border: #e2e8f0;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body {
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
}

.navbar {
    background: var(--secondary);
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.brand {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.brand h1 { font-size: 1.2rem; }
.brand p { font-size: 0.8rem; opacity: 0.8; }

.status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: bold;
}
.status-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: var(--danger);
}

.container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.dashboard-top-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 1.5rem;
}

@media(max-width: 900px) {
    .dashboard-top-row {
        grid-template-columns: 1fr;
    }
}

.card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.map-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.demo-btn {
    background: var(--primary-light);
}

.map-container {
    height: 350px;
    width: 100%;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.location-details p {
    font-size: 0.95rem;
    margin-bottom: 0.3rem;
}

.weather-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    text-align: center;
    margin-bottom: 1rem;
}
.weather-item .icon { font-size: 1.5rem; }
.weather-item .val { font-size: 1.2rem; font-weight: bold; }
.weather-item .lbl { font-size: 0.8rem; color: #64748b; }

.divider {
    border: 0; border-top: 1px solid var(--border);
    margin: 1rem 0;
}

.predict-button {
    width: 100%;
    padding: 0.8rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: bold;
}
.predict-button:disabled {
    background: #94a3b8;
    cursor: not-allowed;
}

.result-container {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background: var(--bg);
    text-align: center;
}
.hidden { display: none; }

.risk-badge {
    display: inline-block;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1.2rem;
    color: white;
    margin-bottom: 0.5rem;
}
.risk-low { background: var(--success); }
.risk-medium { background: var(--warning); }
.risk-high { background: var(--danger); }

.rainfall-top {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.rainfall-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
}

.rainfall-card {
    background: var(--bg);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    border: 1px solid var(--border);
}

.chart-container {
    flex: 1;
    min-width: 300px;
    height: 250px;
}

.history-section {
    background: var(--card-bg);
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid var(--border);
}

.history-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.prediction-history table {
    width: 100%;
    border-collapse: collapse;
}

.prediction-history th, .prediction-history td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border);
}

footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
}

.badge {
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    background: #e2e8f0;
}
""")
