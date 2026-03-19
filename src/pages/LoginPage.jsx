import { useState } from "react";
import { loginUser } from "../api/auth";
import "./LoginPage.css";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser({ email, password });
      const token = response.data.token;

      localStorage.setItem("token", token);
      setMessage("Login successful");
      onLogin(token);
    } catch (error) {
      console.error(error);
      setMessage("Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>MiniCanvas</h2>
          <p>Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {message && (
            <p
              className={
                message === "Login successful"
                  ? "message success-message"
                  : "message error-message"
              }
            >
              {message}
            </p>
          )}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;