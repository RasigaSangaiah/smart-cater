import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChefHat, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}!`);
      const redirectTo =
        location.state?.from ||
        (user.role === "admin" ? "/admin" : user.role === "caterer" ? "/caterer/dashboard" : "/dashboard");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-stone-50 px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-paper p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paprika text-cream">
            <ChefHat size={20} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-stone-500">Log in to manage your bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-500">Email</span>
            <input
              type="email"
              required
              autoComplete="off"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/20"
              placeholder="Enter email"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-500">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 pr-11 text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/20"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-medium text-paprika">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-paprika py-3.5 text-sm font-semibold text-cream transition hover:bg-paprika-dark disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-paprika">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;