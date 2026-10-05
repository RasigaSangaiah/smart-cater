import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Wallet, Star, ClipboardList, TrendingUp, ArrowRight } from "lucide-react";
import { catererService, bookingService } from "../../services";
import { Loader, StatusBadge, EmptyState } from "../../components/common";

const CatererDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([catererService.getMyDashboard(), bookingService.list({ status: "Pending" })])
      .then(([dash, bookings]) => {
        setStats(dash.data.stats);
        setRecent(bookings.data.bookings.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const cards = [
    { label: "Total bookings", value: stats.totalBookings, icon: ClipboardList },
    { label: "Upcoming events", value: stats.upcomingEvents, icon: CalendarClock },
    { label: "Pending requests", value: stats.pendingRequests, icon: ClipboardList },
    { label: "Completed", value: stats.completedBookings, icon: ClipboardList },
    { label: "Total revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: Wallet },
    { label: "This month", value: `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`, icon: TrendingUp },
    { label: "Average rating", value: `${stats.averageRating?.toFixed(1) || "New"} ★`, icon: Star },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Caterer Dashboard</h1>
      <p className="mt-1 text-stone-500">Track requests, revenue, and your upcoming events.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-stone-200 bg-paper p-4 shadow-card">
            <c.icon className="text-paprika" size={18} />
            <p className="mt-2 font-display text-2xl font-semibold text-ink">{c.value}</p>
            <p className="text-xs text-stone-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Pending requests</h2>
        <Link to="/caterer/bookings" className="flex items-center gap-1 text-sm font-medium text-paprika">
          Manage all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-4">
        {recent.length === 0 ? (
          <EmptyState title="No pending requests" description="New booking requests will appear here." />
        ) : (
          <div className="space-y-3">
            {recent.map((b) => (
              <Link
                key={b._id}
                to="/caterer/bookings"
                className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-paper p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{b.bookingId}</p>
                    <StatusBadge status={b.bookingStatus} />
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {b.customer?.name} • {b.eventType} • {b.guestCount} guests
                  </p>
                </div>
                <p className="font-display text-lg font-semibold text-ink">₹{b.totalAmount.toLocaleString("en-IN")}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatererDashboardPage;
