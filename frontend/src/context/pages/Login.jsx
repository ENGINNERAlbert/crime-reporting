import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";
import flagImage from "../../assets/flag.png"; // ✅ Correct relative path
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("/api/users/login/", {
        email,
        password,
      });

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      const userResponse = await axios.get("/api/users/me/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUser(userResponse.data);
      setLoginSuccess(true);
      setEmail("");
      setPassword("");

      setTimeout(() => {
        setLoginSuccess(false);
        const role = userResponse.data.role;
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "law_enforcement") {
          navigate("/reports");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (err) {
      setError("Login failed. Please check your email and password, then try again.");
    }
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url(${flagImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="login-form" style={{ background: "rgba(255, 255, 255, 0.85)", padding: "2rem", borderRadius: "8px" }}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        {loginSuccess && (
          <div className="login-success-popup">
            <p>Login successful!</p>
          </div>
        )}
        <form onSubmit={handleLogin} autoComplete="off">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
