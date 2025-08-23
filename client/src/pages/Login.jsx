import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("email not confirmed")) {
        setError("Please confirm your email before signing in.");
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email" name="email" placeholder="Email"
          onChange={handleChange} value={formData.email}
          className="w-full border p-2 rounded" required
        />
        <input
          type="password" name="password" placeholder="Password"
          onChange={handleChange} value={formData.password}
          className="w-full border p-2 rounded" required
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white p-2 rounded w-full"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Don’t have an account?{" "}
        <Link to="/register" className="text-blue-600 underline">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default Login;