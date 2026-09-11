const API_BASE = "/api";

/**
 * Check if the backend is healthy.
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch terrain + rainfall features for a lat/lng from the backend.
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<object>}
 */
export async function fetchFeatures(lat, lng) {
  const res = await fetch(
    `${API_BASE}/features?latitude=${lat}&longitude=${lng}`
  );
  if (!res.ok) throw new Error(`Features API error: ${res.status}`);
  return res.json();
}

/**
 * Run a flood prediction.
 * @param {object} payload - prediction request fields
 * @returns {Promise<object>} - { location, prediction, flood_probability, risk_level }
 */
export async function runPrediction(payload) {
  // Use the legacy /predict root endpoint which handles the 9-feature model
  const res = await fetch(`http://127.0.0.1:8000/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Prediction API error ${res.status}: ${err}`);
  }
  return res.json();
}

/**
 * Get model info.
 * @returns {Promise<object>}
 */
export async function fetchModelInfo() {
  const res = await fetch(`${API_BASE}/model-info`);
  if (!res.ok) throw new Error("Model info unavailable");
  return res.json();
}

/**
 * Register a new user.
 */
export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    let errMsg = "Registration failed";
    if (typeof data.detail === "Pass") {
      errMsg = data.detail;
    } else if (Array.isArray(data.detail)) {
      errMsg = data.detail.map(e => e.msg).join(", ");
    }
    throw new Error(errMsg);
  }
  return res.json();
}

/**
 * Login user.
 */
export async function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Login failed");
  }
  return res.json();
}
