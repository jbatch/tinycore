import "./App.css";
import { TinyCoreProvider, useAuth } from "@tinycore/client";
import AdminUI from "./AdminUI";
import LoginComponent from "./components/LoginComponent";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Extract the main app logic that uses hooks
function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  console.log("App render", {user, isAuthenticated})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginComponent onLogin={() => window.location.reload()} />;
  }

  return <AdminUI />;
}

function App() {
  return (
    <TinyCoreProvider config={{ baseUrl: API_BASE_URL }}>
      <AppContent />
    </TinyCoreProvider>
  );
}

export default App;
