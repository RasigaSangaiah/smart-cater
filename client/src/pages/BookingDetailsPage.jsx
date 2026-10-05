import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapPin,
  CalendarDays,
  Clock,
  Users,
  ArrowLeft,
  Download,
  XCircle,
  Star,
} from "lucide-react";
import { bookingService, paymentService, reviewService } from "../services";
import { Loader, StatusBadge } from "../components/common";
import { useAuth } from "../context/AuthContext";
import { loadRazorpayScript } from "../utils/razorpay";

const BookingDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBooking = async () => {
    try {
      const { data } = await bookingService.getById(id);
      setBooking(data.booking);
    } catch {
      toast.error("Could not load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePay = async (amount) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Could not load Razorpay checkout. Check your connection.");
      return;
    }

    setPaying(true);
    try {
      const { data } = await paymentService.createOrder({ bookingId: booking._id, amount });

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "SmartCater",
        description: `Payment for booking ${booking.bookingId}`,
        order_id: data.order.id,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: "#A6301D" },
        handler: async (response) => {
          try {
            await paymentService.verify({ ...response, paymentRecordId: data.paymentRecordId });
            toast.success("Payment successful!");
            fetchBooking();
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not initiate payment");
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingService.cancel(booking._id);
      toast.success("Booking cancelled");
      fetchBooking();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel booking");
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewService.create({ bookingId: booking._id, ...reviewForm });
      toast.success("Thanks for your review!");
      fetchBooking();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader label="Loading booking..." />;
  if (!booking) return null;

  const canCancel = user?.role === "customer" && !["Completed", "Cancelled", "Rejected"].includes(booking.bookingStatus);
  const canPay = user?.role === "customer" && booking.remainingAmount > 0 && !["Cancelled", "Rejected"].includes(booking.bookingStatus);
  const canReview = user?.role === "customer" && booking.bookingStatus === "Completed" && !booking.reviewed;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-ink">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Booking ID</p>
          <h1 className="font-display text-3xl font-semibold text-ink">{booking.bookingId}</h1>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={booking.bookingStatus} />
          <StatusBadge status={booking.paymentStatus} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-paper p-5">
          <h3 className="font-display text-base font-semibold text-ink">Event details</h3>
          <div className="mt-3 space-y-2 text-sm text-stone-600">
            <p className="flex items-center gap-2"><CalendarDays size={15} /> {new Date(booking.eventDate).toLocaleDateString("en-IN")}</p>
            <p className="flex items-center gap-2"><Clock size={15} /> {booking.eventTime}</p>
            <p className="flex items-center gap-2"><MapPin size={15} /> {booking.location}</p>
            <p className="flex items-center gap-2"><Users size={15} /> {booking.guestCount} guests</p>
            <p className="text-stone-500">Event type: <span className="text-ink">{booking.eventType}</span></p>
            {booking.specialRequirements && (
              <p className="text-stone-500">Notes: <span className="text-ink">{booking.specialRequirements}</span></p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-paper p-5">
          <h3 className="font-display text-base font-semibold text-ink">Caterer</h3>
          <div className="mt-3 space-y-2 text-sm text-stone-600">
            <p className="font-medium text-ink">{booking.caterer?.name}</p>
            <p className="flex items-center gap-2"><MapPin size={15} /> {booking.caterer?.location}</p>
            <p>{booking.caterer?.phone}</p>
            <p>{booking.caterer?.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-paper p-5">
        <h3 className="font-display text-base font-semibold text-ink">Selected menu</h3>
        <div className="mt-3 divide-y divide-stone-100">
          {booking.selectedMenu.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="text-ink">{item.itemName}</p>
                <p className="text-xs text-stone-500">{item.category}</p>
              </div>
              <p className="text-stone-600">₹{item.pricePerPerson}/person</p>
            </div>
          ))}
        </div>

        {booking.additionalServices?.length > 0 && (
          <>
            <h4 className="mt-5 text-sm font-semibold text-ink">Additional services</h4>
            <div className="mt-2 divide-y divide-stone-100">
              {booking.additionalServices.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <p className="text-ink">{s.name}</p>
                  <p className="text-stone-600">₹{s.price}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-paper p-5">
        <h3 className="font-display text-base font-semibold text-ink">Payment summary</h3>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-stone-600"><span>Price / person</span><span>₹{booking.pricePerPerson}</span></div>
          <div className="flex justify-between text-stone-600"><span>Food cost</span><span>₹{booking.foodCost.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between text-stone-600"><span>Service charges</span><span>₹{booking.serviceCharges.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between text-stone-600"><span>Taxes</span><span>₹{booking.taxes.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-semibold text-ink"><span>Total amount</span><span>₹{booking.totalAmount.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between text-stone-600"><span>Amount paid</span><span>₹{booking.amountPaid.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between font-medium text-paprika"><span>Remaining</span><span>₹{booking.remainingAmount.toLocaleString("en-IN")}</span></div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {canPay && (
            <button
              onClick={() => handlePay(booking.amountPaid === 0 ? booking.advanceAmount : booking.remainingAmount)}
              disabled={paying}
              className="rounded-xl bg-paprika px-6 py-3 text-sm font-semibold text-cream hover:bg-paprika-dark disabled:opacity-60"
            >
              {paying ? "Processing..." : booking.amountPaid === 0 ? `Pay Advance ₹${booking.advanceAmount}` : `Pay Remaining ₹${booking.remainingAmount}`}
            </button>
          )}
          
                    
            <a href={`/api/bookings/${booking._id}/invoice?token=${encodeURIComponent(localStorage.getItem("smartcater_token") || "")}`}
            className="flex items-center gap-2 rounded-xl border border-stone-300 px-6 py-3 text-sm font-medium text-ink hover:border-paprika hover:text-paprika"
          >
            <Download size={15} /> Download Invoice
          </a>
          {canCancel && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-xl border border-paprika/30 px-6 py-3 text-sm font-medium text-paprika hover:bg-paprika/5"
            >
              <XCircle size={15} /> Cancel Booking
            </button>
          )}
        </div>
      </div>

      {canReview && (
        <form onSubmit={handleReview} className="mt-6 rounded-2xl border border-stone-200 bg-paper p-5">
          <h3 className="font-display text-base font-semibold text-ink">Rate your experience</h3>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                className={n <= reviewForm.rating ? "text-turmeric" : "text-stone-300"}
              >
                <Star size={24} fill="currentColor" />
              </button>
            ))}
          </div>
          <textarea
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            placeholder="Tell others about your experience..."
            rows={3}
            className="mt-3 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-paprika"
          />
          <button
            type="submit"
            disabled={submittingReview}
            className="mt-3 rounded-xl bg-paprika px-6 py-2.5 text-sm font-semibold text-cream hover:bg-paprika-dark disabled:opacity-60"
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookingDetailsPage;
