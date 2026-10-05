import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Users, PartyPopper, ArrowRight, Star, Quote } from "lucide-react";
import { catererService } from "../services";
import CatererCard from "../components/CatererCard";
import { Loader } from "../components/common";

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

const steps = [
  {
    title: "Search & compare",
    body: "Filter caterers by location, event type, budget and cuisine, then compare menus side by side.",
  },
  {
    title: "Customize your menu",
    body: "Pick dishes course by course and watch your total update instantly as you add guests or items.",
  },
  {
    title: "Book & pay securely",
    body: "Confirm your date, pay a 30% advance online, and get every detail emailed to you.",
  },
  {
    title: "Enjoy your event",
    body: "Your caterer takes it from there — track status right up to the big day, then leave a review.",
  },
];

const testimonials = [
  {
    name: "Deepika R.",
    event: "Wedding reception, 450 guests",
    quote:
      "We compared five caterers in an afternoon instead of five weekends of tasting visits. The price calculator made the budget conversation with my in-laws painless.",
  },
  {
    name: "Vignesh S.",
    event: "Corporate anniversary, 120 guests",
    quote:
      "Booking confirmation and the invoice landed in my inbox within minutes of the caterer accepting. No follow-up calls needed.",
  },
  {
    name: "Meena K.",
    event: "60th birthday, 80 guests",
    quote:
      "I could see exactly which starters were vegetarian and swap items without calling anyone. Genuinely easier than ordering food delivery.",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catererService
      .list({})
      .then(({ data }) => setPopular(data.caterers.slice(0, 6)))
      .catch(() => setPopular([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (eventType) params.set("eventType", eventType);
    if (guestCount) params.set("guests", guestCount);
    navigate(`/caterers?${params.toString()}`);
  };

  return (
    <div>
      {/* HERO — the one bold, signature moment on the page */}
      <section className="relative overflow-hidden bg-wine">
        {/* Layered "thali plate" motif — slow-rotating concentric rings, echoing a catering spread from above */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] opacity-70 sm:-right-20 sm:top-1/2 sm:-translate-y-1/2">
          <div className="absolute inset-0 animate-spin-slow rounded-full border border-saffron/20" />
          <div className="absolute inset-10 animate-spin-slower rounded-full border border-saffron/25" />
          <div className="absolute inset-24 rounded-full border border-dashed border-saffron/20" />
          <div className="absolute inset-[9rem] rounded-full bg-gradient-to-br from-saffron/25 to-transparent" />
        </div>
        <div className="pointer-events-none absolute -left-24 bottom-[-6rem] h-72 w-72 rounded-full bg-paprika/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-white/5 px-4 py-1.5 text-xs font-medium text-saffron-light backdrop-blur-sm">
              <PartyPopper size={14} className="text-saffron" />
              Trusted for weddings, receptions &amp; corporate events
            </span>

            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-cream sm:text-5xl lg:text-6xl">
              Find the perfect caterer <br className="hidden sm:block" />
              for your <span className="text-saffron">event</span>.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-300">
              Compare menus, build your plate course by course, and watch the total cost
              update live — then book and pay online, all in one place.
            </p>

            <div className="mt-10 flex flex-wrap gap-8 text-sm text-stone-400">
              <div>
                <p className="font-display text-2xl font-semibold text-cream">1,200+</p>
                <p>Events catered</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-cream">300+</p>
                <p>Verified caterers</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-cream">4.7★</p>
                <p>Average rating</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="animate-rise-in relative rounded-2xl border border-white/10 bg-cream p-6 shadow-glow sm:p-7"
            style={{ animationDelay: "120ms" }}
          >
            <h2 className="font-display text-lg font-semibold text-ink">
              Search caterers near you
            </h2>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <MapPin size={14} /> Location
                </span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Anna Nagar, Chennai"
                  className="w-full rounded-xl border border-stone-300 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-paprika focus:ring-2 focus:ring-paprika/20"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <PartyPopper size={14} /> Event type
                </span>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-paprika focus:ring-2 focus:ring-paprika/20"
                >
                  <option value="">Any event type</option>
                  {EVENT_TYPES.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                  <Users size={14} /> Guest count
                </span>
                <input
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder="e.g. 300"
                  className="w-full rounded-xl border border-stone-300 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-paprika focus:ring-2 focus:ring-paprika/20"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-paprika py-3.5 text-sm font-semibold text-cream transition duration-200 hover:-translate-y-0.5 hover:bg-paprika-dark hover:shadow-lift active:translate-y-0"
            >
              <Search size={16} /> Search Caterers
            </button>
          </form>
        </div>
      </section>

      {/* POPULAR CATERERS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink">Popular caterers</h2>
            <p className="mt-2 text-stone-600">Highly rated by hosts who booked in the last 90 days.</p>
          </div>
          
           
              <a      
          
            href="/caterers"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-paprika sm:flex"
          >
            View all <ArrowRight size={15} />
          </a>
        </div>

        {loading ? (
          <Loader label="Fetching popular caterers..." />
        ) : popular.length === 0 ? (
          <p className="mt-8 text-stone-500">
            No caterers listed yet — run the seed script or check back soon.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((c) => (
              <CatererCard key={c._id} caterer={c} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-stone-200 bg-stone-900 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-semibold text-cream">How it works</h2>
          <p className="mt-2 max-w-xl text-stone-400">
            From first search to the last dessert served — four steps, start to finish.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-semibold text-saffron">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-cream">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-400">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <h2 className="font-display text-3xl font-semibold text-ink">What hosts are saying</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-stone-200 bg-paper p-6 shadow-card">
              <Quote className="text-turmeric" size={22} />
              <p className="mt-4 text-sm leading-relaxed text-stone-700">{t.quote}</p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-stone-500">{t.event}</p>
                </div>
                <div className="flex text-turmeric">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-paprika px-8 py-12 sm:flex-row sm:items-center sm:px-12">
          <div>
            <h2 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
              Planning an event? Let's find your caterer.
            </h2>
            <p className="mt-2 max-w-md text-paprika-100/90 text-cream/85">
              It takes less than five minutes to compare menus and get a quote.
            </p>
          

                    </div>
          <a
            href="/caterers"
            className="shrink-0 rounded-full bg-cream px-7 py-3.5 text-sm font-semibold text-paprika transition hover:bg-white"
          >
            Browse Caterers
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;