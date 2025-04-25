import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin-dashboard" />;
    if (user.role === "law_enforcement") return <Navigate to="/reports" />;
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PublicRoute;
