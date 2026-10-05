import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

const NotFoundPage = () => (
  <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-5 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paprika/10 text-paprika">
      <UtensilsCrossed size={28} />
    </span>
    <h1 className="mt-6 font-display text-4xl font-semibold text-ink">404</h1>
    <p className="mt-2 text-stone-500">This page isn't on the menu.</p>
    <Link to="/" className="mt-6 rounded-full bg-paprika px-6 py-3 text-sm font-semibold text-cream hover:bg-paprika-dark">
      Back to Home
    </Link>
  </div>
);

export default NotFoundPage;
