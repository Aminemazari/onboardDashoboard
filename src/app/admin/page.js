"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";

const ARABIC_ERROR = "اسم المستخدم أو كلمة المرور غير صحيحة";

export default function AdminLogin() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, isAuthenticated, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ username: "", password: "" });
  const [localError, setLocalError] = useState("");

  // If already authenticated, redirect
  if (typeof window !== "undefined" && isAuthenticated) {
    router.replace("/dashboard");
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    // Hardcoded credentials
    if (form.username === "" && form.password === "admin123") {
      // Token with 24h expiry
      const token = JSON.stringify({
        value: "admin-token",
        expires: Date.now() + 24 * 60 * 60 * 1000,
      });
      dispatch(loginSuccess({ token, username: "admin" }));
      router.replace("/dashboard");
    } else {
      dispatch(loginFailure(ARABIC_ERROR));
      setLocalError(ARABIC_ERROR);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
        style={{ fontFamily: 'Tajawal, Arial, sans-serif' }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-indigo-700 text-white py-2 rounded">
          تسجيل دخول المشرف
        </h2>
        <div className="mb-4">
          <label className="block mb-2 text-right">اسم المستخدم</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-right">كلمة المرور</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            autoComplete="current-password"
          />
        </div>
        {(localError || error) && (
          <div className="mb-4 text-red-600 text-center">{localError || error}</div>
        )}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-700 text-white py-2 rounded font-bold flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <span className="loader mr-2"></span>
          ) : null}
          دخول
        </button>
        <style jsx>{`
          .loader {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            animation: spin 1s linear infinite;
            display: inline-block;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </form>
    </div>
  );
}
