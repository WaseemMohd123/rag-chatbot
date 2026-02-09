"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // call your FastAPI backend here
      const res = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if(!res.ok){
        if(data.detail === "Email already registered"){
          alert("User with this email already exists!");
          router.push("/login")
          return;
        }else{
          throw new Error(data.detail || "Registration failed")
        }
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex flex-col">
      {/* 🔹 Navigation bar */}
      <div className="w-full flex justify-end p-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md transition"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
      </div>

      {/* 🔹 Main card */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-purple-500/30">
          <h2 className="text-3xl font-extrabold text-purple-400 text-center mb-6 tracking-wide">
            Create an Account
          </h2>

          {/* ✅ Success message with button */}
          {success ? (
            <div className="text-center">
              <p className="text-green-400 font-semibold mb-6 text-lg">
                🎉 Registered successfully!
              </p>
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black border border-purple-500 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black border border-purple-500 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black border border-purple-500 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black border border-purple-500 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50 shadow-lg"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
