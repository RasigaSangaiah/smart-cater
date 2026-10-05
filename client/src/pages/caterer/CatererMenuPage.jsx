import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { catererService, menuService } from "../../services";
import { Loader, EmptyState } from "../../components/common";

const CATEGORIES = [
  "Welcome Drinks",
  "Starters",
  "Main Course",
  "Rice",
  "Breads",
  "Side Dishes",
  "Desserts",
  "Ice Cream",
  "Beverages",
  "Special Items",
];

const emptyForm = {
  category: "Starters",
  itemName: "",
  description: "",
  pricePerPerson: "",
  foodType: "veg",
  isAvailable: true,
};

const CatererMenuPage = () => {
  const [catererId, setCatererId] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadMenu = async (id) => {
    const { data } = await menuService.getByCaterer(id);
    setMenu(data.menu);
  };

  useEffect(() => {
    catererService
      .getMyProfile()
      .then(async ({ data }) => {
        setCatererId(data.caterer._id);
        await loadMenu(data.caterer._id);
      })
      .catch(() => toast.error("Could not load your caterer profile"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      category: item.category,
      itemName: item.itemName,
      description: item.description || "",
      pricePerPerson: item.pricePerPerson,
      foodType: item.foodType,
      isAvailable: item.isAvailable,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await menuService.update(editingId, form);
        toast.success("Menu item updated");
      } else {
        await menuService.create({ ...form, caterer: catererId, pricePerPerson: Number(form.pricePerPerson) });
        toast.success("Menu item added");
      }
      await loadMenu(catererId);
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save menu item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this menu item?")) return;
    try {
      await menuService.remove(id);
      toast.success("Menu item removed");
      loadMenu(catererId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove item");
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await menuService.update(item._id, { isAvailable: !item.isAvailable });
      loadMenu(catererId);
    } catch {
      toast.error("Could not update availability");
    }
  };

  if (loading) return <Loader />;

  const grouped = menu.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Menu Management</h1>
          <p className="mt-1 text-stone-500">Add, edit, and manage availability of your dishes.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-paprika px-5 py-3 text-sm font-semibold text-cream hover:bg-paprika-dark"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {menu.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No menu items yet" description="Add your first dish to start receiving bookings." />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-display text-lg font-semibold text-ink">{category}</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div key={item._id} className="rounded-xl border border-stone-200 bg-paper p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 rounded-sm border-2 ${
                            item.foodType === "veg" ? "border-sage bg-sage/20" : "border-paprika bg-paprika/20"
                          }`}
                        />
                        <p className="text-sm font-medium text-ink">{item.itemName}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(item)} className="text-stone-400 hover:text-paprika">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="text-stone-400 hover:text-paprika">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {item.description && <p className="mt-1 text-xs text-stone-500">{item.description}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-paprika">₹{item.pricePerPerson}/person</p>
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.isAvailable ? "bg-sage/15 text-sage" : "bg-stone-200 text-stone-500"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-5">
          <div className="w-full max-w-md rounded-2xl bg-paper p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink">
                {editingId ? "Edit Menu Item" : "Add Menu Item"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-stone-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-500">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-500">Item name</span>
                <input
                  required
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-500">Description</span>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-paprika"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-stone-500">Price/person (₹)</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.pricePerPerson}
                    onChange={(e) => setForm({ ...form, pricePerPerson: e.target.value })}
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
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-paprika py-3 text-sm font-semibold text-cream hover:bg-paprika-dark disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatererMenuPage;
