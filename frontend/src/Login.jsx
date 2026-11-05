import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Login failed. Check your credentials.");
        return;
      }

     await onLogin(data.user);
     navigate("/");
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <button
          className="login-brand"
          onClick={() => navigate("/")}
          type="button"
        >
          roamly<span>.</span>
        </button>

        <div className="login-visual-content">
          <span className="login-eyebrow">YOUR NEXT CHAPTER</span>
          <h1>
            The world
            <br />
            is waiting
            <br />
            <span>for you.</span>
          </h1>
          <p>
            Discover new places, plan unforgettable journeys,
            and let every trip tell a story.
          </p>
        </div>

        <p className="login-image-caption">
          FIND YOUR SOMEWHERE
        </p>
      </section>

      <section className="login-form-side">
        <button
          className="login-back"
          onClick={() => navigate("/")}
          type="button"
        >
          ← Back to home
        </button>

        <div className="login-form-container">
          <span className="login-eyebrow">WELCOME BACK</span>
          <h2>Let's get you going.</h2>
          <p className="login-subtitle">
            Sign in to continue planning your next adventure.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {error && <p className="login-error">{error}</p>}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing you in..." : "Sign in →"}
            </button>
          </form>

          <p className="login-footer">
            YOUR JOURNEY STARTS HERE <span>✳</span>
          </p>
        </div>
      </section>
    </main>
  );
}
