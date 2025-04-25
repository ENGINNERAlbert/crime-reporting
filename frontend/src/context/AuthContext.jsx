import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);  // Ensure user data is set correctly
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);  // If there's an error (like expired token), reset user
    }

    setLoading(false);  // End loading after fetching user
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);  // Reset user on logout
    window.location.href = "/login";  // Optional: redirect to login
  };

  useEffect(() => {
    fetchUser();  // Fetch user data on mount
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
