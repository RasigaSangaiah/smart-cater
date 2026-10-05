import { useEffect, useState } from "react";
import { adminService } from "../../services";
import { Loader, StatusBadge, EmptyState } from "../../components/common";

const STATUSES = ["All", "Pending", "Accepted", "Confirmed", "In Preparation", "Completed", "Cancelled", "Rejected"];

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setLoading(true);
    adminService
      .getBookings(filter === "All" ? {} : { status: filter })
      .then(({ data }) => setBookings(data.bookings))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">All Bookings</h1>
        <p className="mt-1 text-stone-500">Every booking across the platform.</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              filter === s ? "bg-paprika text-cream" : "bg-stone-100 text-stone-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-paper shadow-card">
        {loading ? (
          <Loader />
        ) : bookings.length === 0 ? (
          <EmptyState title="No bookings found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs font-medium uppercase tracking-wide text-stone-500">
                <th className="px-5 py-3">Booking ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Caterer</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-5 py-3 font-medium text-ink">{b.bookingId}</td>
                  <td className="px-5 py-3 text-stone-600">{b.customer?.name}</td>
                  <td className="px-5 py-3 text-stone-600">{b.caterer?.name}</td>
                  <td className="px-5 py-3 text-stone-600">{b.eventType}</td>
                  <td className="px-5 py-3 text-stone-600">{new Date(b.eventDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3 text-stone-600">₹{b.totalAmount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3"><StatusBadge status={b.bookingStatus} /></td>
                  <td className="px-5 py-3"><StatusBadge status={b.paymentStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;