import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    console.warn("🚫 No user — redirecting to /login");
    return <Navigate to="/login" />;
  }

  // ✅ Allow all users with acceptable statuses
  if (!["approved", "pending"].includes(user.status)) {
    console.warn(`🚫 User status '${user.status}' not allowed — redirecting to /unauthorized`);
    return <Navigate to="/unauthorized" />;
  }

  // ✅ Admins bypass role checks
  if (user.role === "admin" || requiredRoles.includes(user.role) || requiredRoles.length === 0) {
    return children;
  }

  console.warn(
    `🚫 Role mismatch. Allowed: ${requiredRoles.join(", ")}, Got: ${user.role}`
  );
  return <Navigate to="/unauthorized" />;
};

export default ProtectedRoute;
