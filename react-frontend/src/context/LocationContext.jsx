import React, { createContext, useState, useEffect, useCallback } from 'react';

export const LocationContext = createContext();

const API_URL = "http://127.0.0.1:8000/api";

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({
    name: "Kolkata",
    city: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    country: "India",
    latitude: 22.5726,
    longitude: 88.3639,
    source: "default"
  });

  const [weather, setWeather] = useState(null);
const DEFAULT_ALERTS = [
  {
    id: "ALT-2026-0007",
    location_name: "Tehri",
    district: "Tehri Garhwal",
    risk_level: "CRITICAL",
    type: "Flash Flood Warning",
    probability: 0.92,
    rainfall_24h: 156.4,
    timestamp: new Date().toISOString(),
    reason: "Heavy rainfall predicted in next 6 hours. Flash flood highly likely in low-lying areas and near river channels.",
    resolved: false,
  }
];

  const [terrain, setTerrain] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [apiOnline, setApiOnline] = useState(true);

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      setApiOnline(res.ok);
    } catch {
      setApiOnline(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/alerts`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAlerts(data);
        } else {
          setAlerts(DEFAULT_ALERTS);
        }
      }
    } catch (e) {
      console.error("Alerts fetch failed:", e);
      setAlerts(DEFAULT_ALERTS);
    }
  }, []);

  const fetchPredictionHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/predictions/history`);
      if (res.ok) setPredictionHistory(await res.json());
    } catch (e) { console.error("History fetch failed:", e); }
  }, []);

  const updateLocation = useCallback(async (lat, lng, source = "user") => {
    setLoading(true);
    setError(null);

    try {
      // 1. Reverse Geocode
      let locName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      let city = "Unknown", district = "Unknown", state = "Unknown", country = "Unknown";
      try {
        const locRes = await fetch(`${API_URL}/location?latitude=${lat}&longitude=${lng}`);
        if (locRes.ok) {
          const ld = await locRes.json();
          locName = ld.name || locName;
          city = ld.city || "Unknown";
          district = ld.district || "Unknown";
          state = ld.state || "Unknown";
          country = ld.country || "Unknown";
        }
      } catch (e) { console.error("Geocode failed:", e); }

      const updatedLoc = {
        name: locName, city, district, state, country,
        latitude: lat, longitude: lng, source
      };
      setLocation(updatedLoc);

      try {
        localStorage.setItem("app_user_location", JSON.stringify({ lat, lng, source }));
      } catch (e) {}

      // 2. Features (weather + terrain merged)
      let featData = {};
      try {
        const featRes = await fetch(`${API_URL}/features?latitude=${lat}&longitude=${lng}`);
        if (featRes.ok) featData = await featRes.json();
      } catch (e) { console.error("Features failed:", e); }

      const terrainObj = {
        available: featData.available === true,
        elevation_m: featData.elevation_m,
        slope_degree: featData.slope_degree,
        source: featData.source || "UNAVAILABLE"
      };
      setWeather(featData);
      setTerrain(terrainObj);

      // 3. History
      try {
        const histRes = await fetch(`${API_URL}/rainfall/history?latitude=${lat}&longitude=${lng}`);
        if (histRes.ok) {
          const hd = await histRes.json();
          setHistory(hd.history || []);
        }
      } catch (e) { console.error("History failed:", e); }

      // 4. ML Prediction (only if terrain is available)
      if (terrainObj.available) {
        try {
          const predRes = await fetch(`${API_URL}/predictions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: lat, longitude: lng,
              location_name: locName, district, state,
              elevation_m: terrainObj.elevation_m,
              slope_degree: terrainObj.slope_degree,
              rainfall_mm_hr: featData.rainfall_mm_hr || 0,
              rain_1h: featData.rain_1h || 0,
              rain_3h: featData.rain_3h || 0,
              rain_6h: featData.rain_6h || 0,
              rain_12h: featData.rain_12h || 0,
              rain_24h: featData.rain_24h || 0,
              rainfall_change: featData.rainfall_change || 0,
              prediction: 0, flood_probability: 0, risk_level: "PENDING",
              data_source: featData.data_source || "Unknown"
            })
          });
          if (predRes.ok) setPrediction(await predRes.json());
          else setPrediction(null);
        } catch (e) {
          console.error("Prediction failed:", e);
          setPrediction(null);
        }
      } else {
        setPrediction(null);
      }

      // 5. Refresh alerts and history from DB
      await fetchAlerts();
      await fetchPredictionHistory();

      setLastUpdate(new Date());
    } catch (e) {
      console.error("Dashboard update failed:", e);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchAlerts, fetchPredictionHistory]);

  const useCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await updateLocation(pos.coords.latitude, pos.coords.longitude, "gps");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        if (err.code === 1) {
          alert("Location permission was denied. Please allow location permission in your browser to load your real-time current location.");
        } else if (err.code === 3) {
          alert("Location request timed out. Please try again.");
        } else {
          alert("Unable to determine your current location. Please verify your device location settings.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  }, [updateLocation]);

  const refreshData = useCallback(() => {
    return updateLocation(location.latitude, location.longitude, location.source || "user");
  }, [location.latitude, location.longitude, location.source, updateLocation]);

  useEffect(() => {
    checkHealth();

    // Check if user previously saved a location
    const saved = localStorage.getItem("app_user_location");
    if (saved) {
      try {
        const { lat, lng, source } = JSON.parse(saved);
        if (lat && lng) {
          updateLocation(lat, lng, source || "user");
          return;
        }
      } catch (e) {}
    }

    // Try auto-detecting current user location on first load
    if (navigator.geolocation) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude, "gps").finally(() => {
            setIsDetectingLocation(false);
          });
        },
        (err) => {
          console.warn("Could not auto-detect location on startup, using Dehradun, Uttarakhand default:", err);
          setIsDetectingLocation(false);
          updateLocation(30.3165, 78.0322, "default");
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      updateLocation(30.3165, 78.0322, "default");
    }
  }, []);

  const activeAlertCount = alerts && alerts.length > 0 ? alerts.length : 1;

  const value = {
    location, weather, terrain, prediction, history, alerts,
    activeAlertCount,
    predictionHistory, loading, error, lastUpdate, apiOnline,
    isDetectingLocation, useCurrentLocation,
    updateLocation, refreshData, checkHealth
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
