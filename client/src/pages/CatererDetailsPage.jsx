import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Star,
  MapPin,
  Award,
  Utensils,
  Check,
  Plus,
  Minus,
  Users,
  CalendarDays,
  Clock,
  MessageSquareText,
} from "lucide-react";
import { catererService, bookingService } from "../services";
import { Loader } from "../components/common";
import { useAuth } from "../context/AuthContext";

const EVENT_TYPES = [
  "Wedding",
  "Reception",
  "Engagement",
  "Birthday",
  "Corporate Event",
  "College Function",
  "Anniversary",
  "Other",
];

const ADDITIONAL_SERVICES = [
  { name: "Waiter / Service Staff", price: 3000 },
  { name: "Tables & Chairs", price: 4000 },
  { name: "Plates & Serving Equipment", price: 2000 },
  { name: "Decoration", price: 8000 },
  { name: "Cooking Staff", price: 5000 },
  { name: "Transportation", price: 3500 },
];

const SERVICE_CHARGE_RATE = 0.05;
const TAX_RATE = 0.05;
const ADVANCE_RATE = 0.3;

const CatererDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("menu");
  const [submitting, setSubmitting] = useState(false);

  const [event, setEvent] = useState({
    eventType: "",
    eventDate: "",
    eventTime: "",
    location: "",
    guestCount: "",
    specialRequirements: "",
  });
  const [selectedItems, setSelectedItems] = useState([]); // menu item ids
  const [selectedServices, setSelectedServices] = useState([]); // service names

  useEffect(() => {
    setLoading(true);
    catererService
      .getById(id)
      .then(({ data }) => setData(data))
      .catch(() => toast.error("Could not load caterer"))
      .finally(() => setLoading(false));
  }, [id]);

  const menuByCategory = useMemo(() => {
    if (!data?.menu) return {};
    return data.menu.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [data]);

  const toggleItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((i) => i !== itemId) : [...prev, itemId]
    );
  };

  const toggleService = (name) => {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const pricing = useMemo(() => {
    const guests = Number(event.guestCount) || 0;
    const chosenItems = (data?.menu || []).filter((m) => selectedItems.includes(m._id));
    const pricePerPerson = chosenItems.reduce((sum, i) => sum + i.pricePerPerson, 0);
    const foodCost = pricePerPerson * guests;

    const chosenServices = ADDITIONAL_SERVICES.filter((s) => selectedServices.includes(s.name));
    const servicesCost = chosenServices.reduce((sum, s) => sum + s.price, 0);

    const serviceCharges = Math.round(foodCost * SERVICE_CHARGE_RATE) + servicesCost;
    const taxable = foodCost + serviceCharges;
    const taxes = Math.round(taxable * TAX_RATE);
    const totalAmount = foodCost + serviceCharges + taxes;
    const advanceAmount = Math.round(totalAmount * ADVANCE_RATE);
    const remainingAmount = totalAmount - advanceAmount;

    return { pricePerPerson, foodCost, serviceCharges, taxes, totalAmount, advanceAmount, remainingAmount, chosenItems, chosenServices };
  }, [event.guestCount, selectedItems, selectedServices, data]);

  const handleConfirmBooking = async () => {
    if (!user) {
      toast.error("Please log in to book this caterer");
      navigate("/login", { state: { from: `/caterers/${id}` } });
      return;
    }
    if (user.role !== "customer") {
      toast.error("Only customer accounts can make bookings");
      return;
    }
    if (!event.eventType || !event.eventDate || !event.eventTime || !event.location || !event.guestCount) {
      toast.error("Please fill in all event details");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one menu item");
      return;
    }

    setSubmitting(true);
    try {
      const { data: res } = await bookingService.create({
        catererId: id,
        ...event,
        guestCount: Number(event.guestCount),
        selectedMenuItemIds: selectedItems,
        additionalServices: pricing.chosenServices,
      });
      toast.success(`Booking ${res.booking.bookingId} created!`);
      navigate(`/bookings/${res.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading caterer details..." />;
  if (!data) return null;

  const { caterer, reviews } = data;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      {/* Header */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
            {caterer.images?.length ? (
              caterer.images.slice(0, 4).map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt=""
                  className={`h-56 w-full object-cover ${i === 0 ? "col-span-4 sm:col-span-2 sm:row-span-2 h-64 sm:h-72" : "hidden sm:block"}`}
                />
              ))
            ) : (
              <div className="col-span-4 flex h-64 items-center justify-center rounded-2xl bg-stone-200 text-stone-400">
                <Utensils size={40} />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">{caterer.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-stone-500">
                <MapPin size={15} /> {caterer.location}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 rounded-full bg-turmeric/15 px-3 py-1.5 text-sm font-semibold text-turmeric-dark">
                <Star size={14} fill="currentColor" /> {caterer.rating?.toFixed(1) || "New"}
                <span className="font-normal text-turmeric-dark/70">({caterer.numReviews || 0})</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-stone-500">
                <Award size={15} /> {caterer.experience}+ yrs experience
              </div>
            </div>
          </div>

          <p className="mt-4 leading-relaxed text-stone-600">{caterer.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {(caterer.eventTypes || []).map((e) => (
              <span key={e} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
                {e}
              </span>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-6 border-b border-stone-200">
            {["menu", "reviews"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-b-2 pb-3 text-sm font-medium capitalize transition ${
                  tab === t ? "border-paprika text-paprika" : "border-transparent text-stone-500"
                }`}
              >
                {t === "menu" ? "Menu" : `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>

          {tab === "menu" && (
            <div className="mt-6 space-y-8">
              {Object.keys(menuByCategory).length === 0 && (
                <p className="text-stone-500">This caterer hasn't added menu items yet.</p>
              )}
              {Object.entries(menuByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-display text-lg font-semibold text-ink">{category}</h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {items.map((item) => {
                      const active = selectedItems.includes(item._id);
                      return (
                        <button
                          key={item._id}
                          onClick={() => toggleItem(item._id)}
                          className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition ${
                            active
                              ? "border-paprika bg-paprika/5"
                              : "border-stone-200 bg-paper hover:border-stone-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-3 w-3 shrink-0 rounded-sm border-2 ${
                                  item.foodType === "veg"
                                    ? "border-sage bg-sage/20"
                                    : "border-paprika bg-paprika/20"
                                }`}
                              />
                              <p className="text-sm font-medium text-ink">{item.itemName}</p>
                            </div>
                            {item.description && (
                              <p className="mt-1 text-xs text-stone-500">{item.description}</p>
                            )}
                            <p className="mt-1.5 text-sm font-semibold text-paprika">
                              ₹{item.pricePerPerson}/person
                            </p>
                          </div>
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                              active ? "border-paprika bg-paprika text-cream" : "border-stone-300"
                            }`}
                          >
                            {active && <Check size={14} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "reviews" && (
            <div className="mt-6 space-y-4">
              {reviews.length === 0 ? (
                <p className="text-stone-500">No reviews yet.</p>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} className="rounded-xl border border-stone-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">{r.customer?.name}</p>
                      <div className="flex text-turmeric">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-stone-600">{r.comment}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sticky booking sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-stone-200 bg-paper p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-ink">Plan your event</h3>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  Event type
                </span>
                <select
                  value={event.eventType}
                  onChange={(e) => setEvent({ ...event, eventType: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                >
                  <option value="">Select event type</option>
                  {EVENT_TYPES.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                    <CalendarDays size={13} /> Date
                  </span>
                  <input
                    type="date"
                    min={today}
                    value={event.eventDate}
                    onChange={(e) => setEvent({ ...event, eventDate: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                    <Clock size={13} /> Time
                  </span>
                  <input
                    type="time"
                    value={event.eventTime}
                    onChange={(e) => setEvent({ ...event, eventTime: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-500">Event location</span>
                <input
                  value={event.location}
                  onChange={(e) => setEvent({ ...event, location: e.target.value })}
                  placeholder="Venue / address"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <Users size={13} /> Guest count
                </span>
                <input
                  type="number"
                  min="1"
                  value={event.guestCount}
                  onChange={(e) => setEvent({ ...event, guestCount: e.target.value })}
                  placeholder="e.g. 300"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <MessageSquareText size={13} /> Special requirements
                </span>
                <textarea
                  rows={2}
                  value={event.specialRequirements}
                  onChange={(e) => setEvent({ ...event, specialRequirements: e.target.value })}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                />
              </label>
            </div>

            <div className="mt-5 border-t border-stone-200 pt-4">
              <p className="text-xs font-medium text-stone-500">Additional services</p>
              <div className="mt-2 space-y-2">
                {ADDITIONAL_SERVICES.map((s) => (
                  <label key={s.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-stone-700">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s.name)}
                        onChange={() => toggleService(s.name)}
                        className="h-4 w-4 rounded border-stone-300 text-paprika focus:ring-paprika"
                      />
                      {s.name}
                    </span>
                    <span className="text-stone-500">₹{s.price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-1.5 border-t border-stone-200 pt-4 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Price / person</span>
                <span>₹{pricing.pricePerPerson}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Guests</span>
                <span>{event.guestCount || 0}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Food cost</span>
                <span>₹{pricing.foodCost.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Service charges</span>
                <span>₹{pricing.serviceCharges.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Taxes (5%)</span>
                <span>₹{pricing.taxes.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-semibold text-ink">
                <span>Total</span>
                <span>₹{pricing.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-500">
                <span>Advance (30%)</span>
                <span>₹{pricing.advanceAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-500">
                <span>Remaining</span>
                <span>₹{pricing.remainingAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="mt-5 w-full rounded-xl bg-paprika py-3.5 text-sm font-semibold text-cream transition hover:bg-paprika-dark disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Confirm Booking"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CatererDetailsPage;
