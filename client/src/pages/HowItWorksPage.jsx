import { Link } from "react-router-dom";
import { Search, UtensilsCrossed, CreditCard, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & compare caterers",
    body: "Filter by location, event type, budget, and food preference. Compare ratings, menus, and pricing side by side before you commit to a tasting.",
  },
  {
    icon: UtensilsCrossed,
    title: "Build your menu",
    body: "Pick dishes course by course — welcome drinks, starters, mains, desserts and more. Add optional services like staff, decoration or transport. Your total updates live as you go.",
  },
  {
    icon: CreditCard,
    title: "Book & pay securely",
    body: "Submit your event details and menu. Once the caterer accepts, pay a 30% advance online via Razorpay and get an instant confirmation email with every detail attached.",
  },
  {
    icon: PartyPopper,
    title: "Enjoy the event",
    body: "Track your booking status right up to the big day. After your event, settle the remaining balance and leave a review to help other hosts choose well.",
  },
];

const HowItWorksPage = () => (
  <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
    <h1 className="font-display text-4xl font-semibold text-ink">How SmartCater works</h1>
    <p className="mt-3 text-lg text-stone-600">
      From the first search to the last plate served — here's the full journey.
    </p>

    <div className="mt-12 space-y-10">
      {steps.map((step, i) => (
        <div key={step.title} className="flex gap-5">
          <div className="flex flex-col items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paprika/10 text-paprika">
              <step.icon size={20} />
            </span>
            {i < steps.length - 1 && <span className="mt-2 h-full w-px flex-1 bg-stone-200" />}
          </div>
          <div className="pb-6">
            <p className="text-xs font-medium uppercase tracking-wide text-turmeric-dark">
              Step {i + 1}
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-stone-600">{step.body}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 rounded-2xl bg-paprika px-8 py-10 text-center">
      <h2 className="font-display text-2xl font-semibold text-cream">Ready to plan your event?</h2>
      <Link
        to="/caterers"
        className="mt-5 inline-block rounded-full bg-cream px-7 py-3 text-sm font-semibold text-paprika hover:bg-white"
      >
        Browse Caterers
      </Link>
    </div>
  </div>
);

export default HowItWorksPage;
