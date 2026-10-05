import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Users, MapPin } from "lucide-react";
import { bookingService } from "../services";
import { Loader, EmptyState, StatusBadge } from "../components/common";

const TABS = [
  { key: "upcoming", label: "Upcoming", statuses: ["Pending", "Accepted", "Confirmed", "In Preparation"] },
  { key: "completed", label: "Completed", statuses: ["Completed"] },
  { key: "cancelled", label: "Cancelled", statuses: ["Cancelled", "Rejected"] },
];

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    bookingService
      .list()
      .then(({ data }) => setBookings(data.bookings))
      .finally(() => setLoading(false));
  }, []);

  const activeTab = TABS.find((t) => t.key === tab);
  const filtered = bookings.filter((b) => activeTab.statuses.includes(b.bookingStatus));

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">My Bookings</h1>
      <p className="mt-1 text-stone-500">Track every event you've booked, from request to review.</p>

      <div className="mt-6 flex gap-2 border-b border-stone-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === t.key ? "border-paprika text-paprika" : "border-transparent text-stone-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No bookings here yet"
            description="Once you book a caterer, it'll show up in this list."
            action={
              <Link to="/caterers" className="text-sm font-medium text-paprika">
                Browse caterers
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <Link
                key={b._id}
                to={`/bookings/${b._id}`}
                className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-paper p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-semibold text-ink">{b.bookingId}</p>
                    <StatusBadge status={b.bookingStatus} />
                  </div>
                  <p className="mt-1 text-sm text-stone-500">{b.caterer?.name} • {b.eventType}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1"><CalendarDays size={13} /> {new Date(b.eventDate).toLocaleDateString("en-IN")}</span>
                    <span className="flex items-center gap-1"><Users size={13} /> {b.guestCount} guests</span>
                    <span className="flex items-center gap-1"><MapPin size={13} /> {b.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold text-ink">₹{b.totalAmount.toLocaleString("en-IN")}</p>
                    <StatusBadge status={b.paymentStatus} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
