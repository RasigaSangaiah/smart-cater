import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../services";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success("Reset instructions sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-stone-50 px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-paper p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paprika text-cream">
            <KeyRound size={20} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-stone-500">
            Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {sent ? (
          <div className="mt-6 rounded-xl bg-sage/10 p-4 text-center text-sm text-sage">
            If an account exists for {email}, you'll receive reset instructions shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/20"
                placeholder="you@example.com"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-paprika py-3.5 text-sm font-semibold text-cream transition hover:bg-paprika-dark disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-stone-500">
          <Link to="/login" className="font-medium text-paprika">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
