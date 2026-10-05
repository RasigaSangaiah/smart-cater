import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Users, MapPin, ArrowRight } from "lucide-react";
import { bookingService } from "../../services";
import { Loader, EmptyState, StatusBadge } from "../../components/common";
import { useAuth } from "../../context/AuthContext";

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService
      .list()
      .then(({ data }) => setBookings(data.bookings))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter((b) =>
    ["Pending", "Accepted", "Confirmed", "In Preparation"].includes(b.bookingStatus)
  );
  const totalSpent = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Welcome, {user?.name?.split(" ")[0]}</h1>
      <p className="mt-1 text-stone-500">Here's a snapshot of your catering bookings.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total bookings", value: bookings.length },
          { label: "Upcoming events", value: upcoming.length },
          {
            label: "Completed",
            value: bookings.filter((b) => b.bookingStatus === "Completed").length,
          },
          { label: "Total spent", value: `₹${totalSpent.toLocaleString("en-IN")}` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-stone-200 bg-paper p-4 shadow-card">
            <p className="text-xs font-medium text-stone-500">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Upcoming events</h2>
        <Link to="/my-bookings" className="flex items-center gap-1 text-sm font-medium text-paprika">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-4">
        {loading ? (
          <Loader />
        ) : upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming events"
            description="Book a caterer to see your event here."
            action={
              <Link to="/caterers" className="text-sm font-medium text-paprika">
                Browse caterers
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((b) => (
              <Link
                key={b._id}
                to={`/bookings/${b._id}`}
                className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-paper p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{b.bookingId}</p>
                    <StatusBadge status={b.bookingStatus} />
                  </div>
                  <p className="mt-1 text-sm text-stone-500">{b.caterer?.name} • {b.eventType}</p>
                  <div className="mt-1 flex gap-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {new Date(b.eventDate).toLocaleDateString("en-IN")}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {b.guestCount}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {b.location}</span>
                  </div>
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

export default CustomerDashboardPage;
