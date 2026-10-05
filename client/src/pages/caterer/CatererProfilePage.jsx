import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { catererService } from "../../services";
import { Loader } from "../../components/common";

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

const CatererProfilePage = () => {
  const [caterer, setCaterer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    catererService
      .getMyProfile()
      .then(({ data }) => {
        setCaterer(data.caterer);
        setForm({
          name: data.caterer.name,
          location: data.caterer.location,
          city: data.caterer.city,
          description: data.caterer.description,
          experience: data.caterer.experience,
          foodType: data.caterer.foodType,
          pricePerPlate: data.caterer.pricePerPlate,
          eventTypes: data.caterer.eventTypes || [],
        });
      })
      .catch(() => toast.error("Could not load profile"))
      .finally(() => setLoading(false));
  }, []);

  const toggleEventType = (type) => {
    setForm((f) => ({
      ...f,
      eventTypes: f.eventTypes.includes(type)
        ? f.eventTypes.filter((t) => t !== type)
        : [...f.eventTypes, type],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await catererService.update(caterer._id, form);
      setCaterer(data.caterer);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Business Profile</h1>
      <p className="mt-1 text-stone-500">
        {caterer.approved ? (
          <span className="text-sage">✓ Your profile is approved and visible to customers</span>
        ) : (
          <span className="text-turmeric-dark">Pending admin approval — complete your profile to speed this up</span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-stone-200 bg-paper p-6 shadow-card">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-500">Business name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-500">Location / Area</span>
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-500">City</span>
            <input
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-500">Description</span>
          <textarea
            rows={3}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
          />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-500">Experience (yrs)</span>
            <input
              type="number"
              min="0"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-500">Food type</span>
            <select
              value={form.foodType}
              onChange={(e) => setForm({ ...form, foodType: e.target.value })}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
            >
              <option value="veg">Pure Veg</option>
              <option value="non-veg">Non-Veg</option>
              <option value="both">Both</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-500">Price/plate (₹)</span>
            <input
              type="number"
              min="0"
              value={form.pricePerPlate}
              onChange={(e) => setForm({ ...form, pricePerPlate: Number(e.target.value) })}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
            />
          </label>
        </div>

        <div>
          <span className="mb-2 block text-xs font-medium text-stone-500">Event types you cater</span>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => toggleEventType(type)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  form.eventTypes.includes(type) ? "bg-paprika text-cream" : "bg-stone-100 text-stone-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-paprika py-3 text-sm font-semibold text-cream hover:bg-paprika-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default CatererProfilePage;
