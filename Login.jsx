// src/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // DEMO: hardcoded test account
  // Replace this logic with a real API call to your server in production.
  const DEMO_ACCOUNT = {
    email: "test@mathvision.com",
    password: "123456",
  };

  const validateEmail = (e) => {
    // simple email regex
    return /\S+@\S+\.\S+/.test(e);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // basic validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // ---------- OPTION A: Demo client-side auth (quick test) ----------
    if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      // success -> redirect
      navigate("/MainWindow");
      return;
    }

    // ---------- OPTION B: Example server auth (recommended for real apps) ----------
    // If you have a backend, uncomment and adapt the following instead of the demo check:
    /*
    try {
      const res = await fetch("https://your-api.example.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      // Save token/session (e.g. localStorage) and redirect
      localStorage.setItem("token", data.token);
      navigate("/MainWindow");
    } catch (err) {
      setError(err.message || "Login failed");
    }
    return;
    */

    // If neither demo nor server returned success:
    setError("Email or password is incorrect. (Use test@mathvision.com / 123456 for demo)");
  };

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <h1 className="text-4xl font-bold text-blue-700 mb-2">Login</h1>
      <p className="text-gray-600 mb-6">Welcome back to MathVision!</p>

      <form
        onSubmit={handleLogin}
        className="flex flex-col space-y-4 w-80 bg-white p-6 rounded-xl shadow-lg"
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>

        <p className="text-sm text-gray-700 text-center mt-2">
          Don't have an account?{" "}
          <a href="/createaccount" className="text-blue-700 font-semibold hover:underline">
            Create one
          </a>
        </p>
      </form>
    </div>
  );
}
