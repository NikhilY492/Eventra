import Link from "next/link";
import { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";

// NOTE: You must replace this with your actual Django/DRF token endpoint
const API_TOKEN_URL = "http://localhost:8000/api/token/"; 

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // --- 🚨 START OF AUTHENTICATION LOGIC ---

    // 1. Send credentials to the backend token endpoint (e.g., JWT)
    try {
        // This is a placeholder call. You need to configure DRF Simple JWT on the backend.
        // If using standard Django Admin credentials:
        const response = await fetch(API_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: username, 
                password: password 
            }),
        });

        const data = await response.json();

        if (response.ok && data.access) {
            // 2. Store the token on success
            localStorage.setItem('authToken', data.access);
            alert("Login successful! Token acquired.");
            
            // 3. Redirect to dashboard
            router.push("/admin/dashboard");
        } else if (username === "admin" && password === "admin123") {
            // FALLBACK / DEMO LOGIC (for when backend auth is missing)
            localStorage.setItem('authToken', 'DEMO_TOKEN_12345');
            alert("Demo login successful! Bypassing backend.");
            router.push("/admin/dashboard");
        } else {
            // Handle specific backend errors
            setError(data.detail || "Invalid credentials.");
        }
        
    } catch (err) {
        console.error("Login failed:", err);
        setError("Network error or token endpoint is missing/incorrect.");
    } finally {
        setLoading(false);
    }
    // --- 🚨 END OF AUTHENTICATION LOGIC ---
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Back Button */}
      <div className="absolute top-6 left-6 text-sm text-gray-600">
        <Link href="/" className="flex items-center gap-1 hover:text-blue-600">
          ← Back to Home
        </Link>
      </div>

      {/* Page Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="text-gray-500 text-sm">Access admin panel</p>
      </div>

      {/* Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-lg font-semibold mt-2">Admin Access</h2>
          <p className="text-sm text-gray-500 text-center">
            Enter your credentials to access the admin panel
          </p>
        </div>
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4 text-sm">
                {error}
            </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 flex justify-center items-center gap-2 disabled:bg-gray-500"
            disabled={loading}
          >
            <Shield className="w-4 h-4" /> {loading ? "Logging In..." : "Login to Admin Panel"}
          </button>
        </form>

        {/* Demo Info */}
        <div className="bg-gray-100 p-3 mt-4 rounded-lg text-sm">
          <p className="font-medium">Demo Credentials</p>
          <p>
            Username: <span className="font-mono">admin</span>
          </p>
          <p>
            Password: <span className="font-mono">admin123</span>
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Only authorized college staff can access the admin panel.
          <br />
          Contact IT support if you need access.
        </p>
      </div>
    </div>
  );
}