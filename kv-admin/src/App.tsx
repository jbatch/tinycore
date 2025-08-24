import { useState, useEffect } from "react";
import "./App.css";
import AdminUI from "./AdminUI";
import LoginComponent from "./components/LoginComponent";

interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(authToken);
        setIsAuthenticated(true);
      } else {
        // Token is invalid
        localStorage.removeItem("auth_token");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("auth_token");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (authToken: string, userData: User) => {
    localStorage.setItem("auth_token", authToken);
    setToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginComponent onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminUI user={user} token={token} onLogout={handleLogout} />;
}

export default App;
