import { LocationProvider } from './context/LocationContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Sign from "./pages/Signup/sign";

import Dashboard from "./pages/Dashboards/Dashboard/Dashboard";
import AdminDashboard from "./pages/Dashboards/AdminDashboard/AdminDashboard";
import GovDashboard from "./pages/Dashboards/GovDashboard/GovDashboard";
import RiskMapPage from "./pages/Dashboards/RiskMap/RiskMapPage";
import Prediction from "./pages/Dashboards/Prediction/Prediction";
import Locations from "./pages/Dashboards/Locations/Locations";
import WeatherData from "./pages/Dashboards/WeatherData/WeatherData";
import HistoricalAnalysis from "./pages/Dashboards/HistoricalAnalysis/HistoricalAnalysis";
import Alerts from "./pages/Dashboards/Alerts/Alerts";
import Reports from "./pages/Dashboards/Reports/Reports";
import Settings from "./pages/Dashboards/Settings/Settings";
import Profile from "./pages/Dashboards/Profile/Profile";

/* =========================================================
   PROTECTED ROUTE
========================================================= */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard if they try to access an unauthorized route
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'gov') return <Navigate to="/gov" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleNavigate = (pageName) => {
    const page = String(pageName).toLowerCase();

    // Handle settings sub-navigation (e.g. "settings-profile", "settings-security")
    if (page.startsWith("settings-")) {
      const tab = page.replace("settings-", "");
      navigate(`/settings?tab=${tab}`);
      return;
    }

    const routes = {
      dashboard: "/dashboard",
      admin: "/admin",
      gov: "/gov",
      riskmap: "/riskmap",
      prediction: "/prediction",
      locations: "/locations",
      weather: "/weather",
      historical: "/historical",
      alerts: "/alerts",
      reports: "/reports",
      settings: "/settings",
      profile: "/profile",
    };

    if (routes[page]) navigate(routes[page]);
  };

  const handleLoginSuccess = () => {
    if (user?.role === 'admin') navigate("/admin", { replace: true });
    else if (user?.role === 'gov') navigate("/gov", { replace: true });
    else navigate("/dashboard", { replace: true });
  };

  return (
    <Routes>
      <Route path="/" element={<Landing onLogin={() => navigate("/login")} onGetStarted={() => navigate("/login")} />} />
      <Route path="/login" element={<Login onSignup={() => navigate("/signup")} onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/signup" element={<Sign onLogin={() => navigate("/login")} onDashboard={handleLoginSuccess} />} />

      {/* ADMIN PANEL */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard onNavigate={handleNavigate} /></ProtectedRoute>} />

      {/* GOV PANEL */}
      <Route path="/gov" element={<ProtectedRoute allowedRoles={['gov', 'admin']}><GovDashboard onNavigate={handleNavigate} /></ProtectedRoute>} />

      {/* USER DASHBOARDS (accessible by all users) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard onNavigate={handleNavigate} /></ProtectedRoute>} />
      <Route path="/riskmap" element={<ProtectedRoute><RiskMapPage onNavigate={handleNavigate} onHome={() => navigate("/dashboard")} /></ProtectedRoute>} />
      <Route path="/prediction" element={<ProtectedRoute><Prediction onNavigate={handleNavigate} onHome={() => navigate("/dashboard")} /></ProtectedRoute>} />
      <Route path="/locations" element={<ProtectedRoute><Locations onNavigate={handleNavigate} onHome={() => navigate("/dashboard")} /></ProtectedRoute>} />
      <Route path="/weather" element={<ProtectedRoute><WeatherData onNavigate={handleNavigate} onHome={() => navigate("/dashboard")} /></ProtectedRoute>} />
      <Route path="/historical" element={<ProtectedRoute><HistoricalAnalysis onNavigate={handleNavigate} onHome={() => navigate("/dashboard")} /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Alerts onNavigate={handleNavigate} onHome={() => navigate("/dashboard")} /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports onNavigate={handleNavigate} onHome={() => navigate("/dashboard")} /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings onNavigate={handleNavigate} onHome={() => navigate("/dashboard")} /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile onNavigate={handleNavigate} onHome={() => navigate("/dashboard")} /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;