import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarDays, Users, MapPin } from "lucide-react";
import { bookingService } from "../../services";
import { Loader, EmptyState, StatusBadge } from "../../components/common";

const STATUS_FLOW = {
  Pending: ["Accepted", "Rejected"],
  Accepted: ["Confirmed", "Cancelled"],
  Confirmed: ["In Preparation", "Cancelled"],
  "In Preparation": ["Completed"],
};

const FILTERS = ["All", "Pending", "Accepted", "Confirmed", "In Preparation", "Completed", "Cancelled", "Rejected"];

const CatererBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    bookingService
      .list()
      .then(({ data }) => setBookings(data.bookings))
      .finally(() => setLoading(false));
  };

  useEffect(fetchBookings, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await bookingService.updateStatus(id, status);
      toast.success(`Booking marked as ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === "All" ? bookings : bookings.filter((b) => b.bookingStatus === filter);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Booking Requests</h1>
      <p className="mt-1 text-stone-500">Accept, reject, and track every booking for your business.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              filter === f ? "bg-paprika text-cream" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState title="No bookings found" description="Try a different filter." />
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <div key={b._id} className="rounded-2xl border border-stone-200 bg-paper p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/bookings/${b._id}`} className="font-display text-lg font-semibold text-ink hover:text-paprika">
                        {b.bookingId}
                      </Link>
                      <StatusBadge status={b.bookingStatus} />
                      <StatusBadge status={b.paymentStatus} />
                    </div>
                    <p className="mt-1 text-sm text-stone-500">
                      {b.customer?.name} • {b.customer?.phone} • {b.eventType}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-stone-500">
                      <span className="flex items-center gap-1"><CalendarDays size={13} /> {new Date(b.eventDate).toLocaleDateString("en-IN")}</span>
                      <span className="flex items-center gap-1"><Users size={13} /> {b.guestCount} guests</span>
                      <span className="flex items-center gap-1"><MapPin size={13} /> {b.location}</span>
                    </div>
                  </div>
                  <p className="font-display text-xl font-semibold text-ink">₹{b.totalAmount.toLocaleString("en-IN")}</p>
                </div>

                {STATUS_FLOW[b.bookingStatus] && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                    {STATUS_FLOW[b.bookingStatus].map((next) => (
                      <button
                        key={next}
                        disabled={updatingId === b._id}
                        onClick={() => handleStatusChange(b._id, next)}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                          next === "Rejected" || next === "Cancelled"
                            ? "border border-paprika/30 text-paprika hover:bg-paprika/5"
                            : "bg-paprika text-cream hover:bg-paprika-dark"
                        }`}
                      >
                        Mark as {next}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatererBookingsPage;
