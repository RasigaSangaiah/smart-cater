import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { ChefHat, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = ({ title, links }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-paper px-5 py-6 md:flex">
        <Link to="/" className="flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paprika text-cream">
            <ChefHat size={18} />
          </span>
          <span className="font-display text-lg font-semibold text-ink">SmartCater</span>
        </Link>

        <p className="mt-8 px-2 text-xs font-medium uppercase tracking-wide text-stone-400">
          {title}
        </p>
        <nav className="mt-3 flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-paprika/10 text-paprika"
                    : "text-stone-600 hover:bg-stone-100 hover:text-ink"
                }`
              }
            >
              <link.icon size={17} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 px-2">
          <div className="rounded-xl bg-stone-100 p-3">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-xs text-stone-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-paprika"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-stone-200 bg-paper px-5 py-4 md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paprika text-cream">
              <ChefHat size={16} />
            </span>
            <span className="font-display text-base font-semibold">SmartCater</span>
          </Link>
          <button onClick={handleLogout} className="text-sm font-medium text-paprika">
            Logout
          </button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-stone-200 bg-paper px-3 py-2 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive ? "bg-paprika text-cream" : "bg-stone-100 text-stone-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
