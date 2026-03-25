import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [roles, setRoles] = useState(
    JSON.parse(localStorage.getItem("roles") || "[]")
  );

  const handleLogin = (newToken, newRoles) => {
    setToken(newToken);
    setRoles(newRoles || []);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("email");

    setToken(null);
    setRoles([]);
  };

  const isAdmin = roles.includes("ADMIN");

  return (
    <div>
      {token ? (
        isAdmin ? (
          <AdminPage token={token} onLogout={handleLogout} />
        ) : (
          <ProfilePage token={token} onLogout={handleLogout} />
        )
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;