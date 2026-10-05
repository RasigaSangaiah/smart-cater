import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ChefHat, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-paprika" : "text-stone-600 hover:text-ink"
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === "admin" ? "/admin" : user?.role === "caterer" ? "/caterer/dashboard" : "/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        

          <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-wine text-saffron">
            <ChefHat size={18} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            SmartCater
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/caterers" className={navLinkClass}>
            Find Caterers
          </NavLink>
          <NavLink to="/how-it-works" className={navLinkClass}>
            How it Works
          </NavLink>
          {user && (
            <NavLink to="/my-bookings" className={navLinkClass}>
              My Bookings
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-ink transition hover:border-paprika hover:text-paprika"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition hover:bg-stone-800"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-ink hover:text-paprika"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-paprika px-5 py-2 text-sm font-medium text-cream transition hover:bg-paprika-dark"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200 bg-cream px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-3">
            <NavLink to="/" onClick={() => setOpen(false)} className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/caterers" onClick={() => setOpen(false)} className={navLinkClass}>
              Find Caterers
            </NavLink>
            <NavLink to="/how-it-works" onClick={() => setOpen(false)} className={navLinkClass}>
              How it Works
            </NavLink>
            {user ? (
              <>
                <NavLink to="/my-bookings" onClick={() => setOpen(false)} className={navLinkClass}>
                  My Bookings
                </NavLink>
                <Link to={dashboardPath} onClick={() => setOpen(false)} className={navLinkClass({isActive:false})}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-left text-sm font-medium text-paprika">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className={navLinkClass({isActive:false})}>
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="w-fit rounded-full bg-paprika px-5 py-2 text-sm font-medium text-cream"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
