import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
console.log("Submitting login with data:", formData);
  try {
    console.log("Sending login request...");
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",  
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
console.log("Login response:", response.data);
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    navigate("/dashboard");
  } catch (err) {
    console.error("Login error:", err.response);
    setError(err.response?.data?.message || "Something went wrong. Try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Navbar />
      <div className="container mt-5" style={{ maxWidth: "400px" }}>
        <h2 className="mb-4 text-center">Login</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label">
              Username or Email
            </label>
            <input
              type="text"
              className="form-control"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
              placeholder="Enter username or email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-3">OR</div>

        <div className="d-flex justify-content-center gap-2 mt-3">
          <a
            href="http://localhost:5000/auth/google"
            className="btn btn-outline-danger flex-grow-1"
          >
            Google
          </a>
          <a
            href="http://localhost:5000/auth/facebook"
            className="btn btn-outline-primary flex-grow-1"
          >
            Facebook
          </a>
        </div>

        <div className="mt-3 text-center">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </>
  );
};

export default Login;
