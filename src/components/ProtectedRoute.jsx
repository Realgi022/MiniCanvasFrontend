import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes("ADMIN")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;