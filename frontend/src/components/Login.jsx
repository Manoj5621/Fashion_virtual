import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import './Auth.css';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.detail);
    } else {
      setMessage(data.detail);
      login();
      navigate("/");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        <form onSubmit={handleLogin}>
          <div className="auth-input-group">
            <label htmlFor="username" className="auth-label">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              required
            />
          </div>
          <div className="auth-input-group">
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
          </div>
          <button type="submit" className="auth-button">Sign In</button>
        </form>
        {message && <div className="auth-message">{message}</div>}
        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
