import { Link } from "react-router-dom";
import { Star, MapPin, Utensils } from "lucide-react";

const foodTypeLabel = { veg: "Pure Veg", "non-veg": "Non-Veg", both: "Veg & Non-Veg" };

const CatererCard = ({ caterer }) => (
  <Link
    to={`/caterers/${caterer._id}`}
    className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-paper shadow-card transition hover:-translate-y-1 hover:shadow-lift"
  >
    <div className="relative h-48 overflow-hidden bg-stone-200">
      {caterer.images?.[0]?.url ? (
        <img
          src={caterer.images[0].url}
          alt={caterer.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-stone-200 text-stone-400">
          <Utensils size={32} />
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-3 py-1 text-xs font-semibold text-ink">
        {foodTypeLabel[caterer.foodType] || "Multi-cuisine"}
      </span>
    </div>

    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-ink">{caterer.name}</h3>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-turmeric/15 px-2 py-1 text-xs font-semibold text-turmeric-dark">
          <Star size={12} fill="currentColor" />
          {caterer.rating?.toFixed(1) || "New"}
        </div>
      </div>

      <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
        <MapPin size={14} /> {caterer.location}
      </p>

      <p className="mt-3 line-clamp-2 text-sm text-stone-600">{caterer.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(caterer.eventTypes || []).slice(0, 3).map((e) => (
          <span key={e} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
            {e}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <div>
          <span className="font-display text-xl font-semibold text-ink">₹{caterer.pricePerPlate}</span>
          <span className="text-sm text-stone-500"> /plate</span>
        </div>
        <span className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-ink transition group-hover:border-paprika group-hover:text-paprika">
          View Details
        </span>
      </div>
    </div>
  </Link>
);

export default CatererCard;
