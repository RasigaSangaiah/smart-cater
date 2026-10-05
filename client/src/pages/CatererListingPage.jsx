import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { catererService } from "../services";
import CatererCard from "../components/CatererCard";
import { Loader, EmptyState } from "../components/common";

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

const CatererListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [caterers, setCaterers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    eventType: searchParams.get("eventType") || "",
    foodType: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  const fetchCaterers = async (activeFilters) => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v !== "" && v !== undefined)
      );
      const { data } = await catererService.list(cleanParams);
      setCaterers(data.caterers);
    } catch {
      setCaterers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaterers(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (e) => {
    e?.preventDefault();
    setSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
    fetchCaterers(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const reset = { location: "", eventType: "", foodType: "", minPrice: "", maxPrice: "", minRating: "" };
    setFilters(reset);
    setSearchParams({});
    fetchCaterers(reset);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Find your caterer</h1>
          <p className="mt-1 text-stone-500">{caterers.length} caterers available</p>
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium text-ink hover:border-paprika hover:text-paprika"
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <form
            onSubmit={applyFilters}
            className="sticky top-24 space-y-5 rounded-2xl border border-stone-200 bg-paper p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">Filters</h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-medium text-paprika"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">Location</span>
              <input
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="City or area"
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">Event type</span>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
              >
                <option value="">Any</option>
                {EVENT_TYPES.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">Food type</span>
              <select
                value={filters.foodType}
                onChange={(e) => setFilters({ ...filters, foodType: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
              >
                <option value="">Any</option>
                <option value="veg">Pure Veg</option>
                <option value="non-veg">Non-Veg</option>
                <option value="both">Veg &amp; Non-Veg</option>
              </select>
            </label>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-stone-500">Price per plate (₹)</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="Min"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                />
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="Max"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                />
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">Minimum rating</span>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
              >
                <option value="">Any</option>
                <option value="4.5">4.5 &amp; up</option>
                <option value="4">4.0 &amp; up</option>
                <option value="3">3.0 &amp; up</option>
              </select>
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-paprika py-3 text-sm font-semibold text-cream hover:bg-paprika-dark"
            >
              Apply Filters
            </button>
          </form>
        </aside>

        <div>
          {loading ? (
            <Loader label="Finding caterers..." />
          ) : caterers.length === 0 ? (
            <EmptyState
              title="No caterers match your filters"
              description="Try widening your location or adjusting your budget range."
              action={
                <button onClick={clearFilters} className="text-sm font-medium text-paprika">
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {caterers.map((c) => (
                <CatererCard key={c._id} caterer={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatererListingPage;
