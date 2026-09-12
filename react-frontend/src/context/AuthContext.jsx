import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_URL = "http://127.0.0.1:8000/api/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const fetchUserAndSettings = async (authToken) => {
    try {
      const [meRes, setRes] = await Promise.all([
        fetch(`${API_URL}/me`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
        fetch(`http://127.0.0.1:8000/api/settings`, { headers: { 'Authorization': `Bearer ${authToken}` } })
      ]);
      
      if (meRes.ok) {
        setUser(await meRes.json());
      } else {
        logout();
        return;
      }

      if (setRes.ok) {
        setSettings(await setRes.json());
      }
    } catch (e) {
      console.error("Auth me failed:", e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserAndSettings(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Login failed: ${text}`);
    }
    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('isLoggedIn', 'true');
    await fetchUserAndSettings(data.access_token);
    return data;
  };

  const register = async (name, email, password, role = 'user') => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Registration failed: ${text}`);
    }
    await login(email, password);
    const meRes = await fetch(`${API_URL}/me`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (meRes.ok) return await meRes.json();
    return { role: 'user' };
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setUser(null);
      setSettings(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, settings, setSettings, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
