import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './Auth.css';

function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/api/signUp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        username: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.detail);
    } else {
      setMessage(data.detail);
      navigate("/");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join us today</p>
        <form onSubmit={handleSignup}>
          <div className="auth-input-group">
            <label htmlFor="name" className="auth-label">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
              required
            />
          </div>
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
          <button type="submit" className="auth-button">Create Account</button>
        </form>
        {message && <div className="auth-message">{message}</div>}
        <div className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
