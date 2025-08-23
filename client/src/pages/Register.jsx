import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Register = () => {
  const { signUp } = useContext(AuthContext);   // use context instead of direct supabase import
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",    // kept for UI; we’re not storing this yet
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
    setMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    const { email, password } = formData;

    try {
      // Supabase signup via context
      await signUp(email, password);

      // If "Confirm email" is ON in Supabase, the user must confirm via the email link.
      setMsg("Account created. Please check your email to confirm your account.");
      // Optionally redirect them to login
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create an Account</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {msg && <div className="text-blue-700 mb-2">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          value={formData.username}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={formData.email}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;