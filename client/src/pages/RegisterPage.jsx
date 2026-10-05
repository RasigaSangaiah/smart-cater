import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChefHat, User, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      toast.success("Account created!");
      navigate(
        user.role === "caterer" ? "/caterer/dashboard" : user.role === "admin" ? "/admin" : "/dashboard"
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-stone-500">Book caterers or list your catering business</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition ${
              role === "customer" ? "bg-paper text-ink shadow-sm" : "text-stone-500"
            }`}
          >
            <User size={15} /> I'm hosting
          </button>
          <button
            type="button"
            onClick={() => setRole("caterer")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition ${
              role === "caterer" ? "bg-paper text-ink shadow-sm" : "text-stone-500"
            }`}
          >
            <UtensilsCrossed size={15} /> I'm a caterer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-500">Full name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/20"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-500">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/20"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-500">Phone</span>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/20"
              placeholder="10-digit mobile number"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/20"
                placeholder="••••••••"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">Confirm</span>
              <input
                type="password"
                required
                minLength={6}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/20"
                placeholder="••••••••"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-paprika py-3.5 text-sm font-semibold text-cream transition hover:bg-paprika-dark disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-paprika">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
