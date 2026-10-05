import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Star, MapPin } from "lucide-react";
import { adminService } from "../../services";
import { Loader, EmptyState } from "../../components/common";

const FILTERS = [
  { label: "Pending approval", value: "false" },
  { label: "Approved", value: "true" },
  { label: "All", value: "" },
];

const AdminCaterersPage = () => {
  const [caterers, setCaterers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("false");

  const fetchCaterers = () => {
    setLoading(true);
    adminService
      .getCaterers(filter === "" ? {} : { approved: filter })
      .then(({ data }) => setCaterers(data.caterers))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCaterers, [filter]);

  const handleApprove = async (id, approved) => {
    try {
      await adminService.approveCaterer(id, approved);
      toast.success(approved ? "Caterer approved" : "Caterer rejected");
      fetchCaterers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update caterer");
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Manage Caterers</h1>
      <p className="mt-1 text-stone-500">Approve new caterer registrations before they go live.</p>

      <div className="mt-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              filter === f.value ? "bg-paprika text-cream" : "bg-stone-100 text-stone-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : caterers.length === 0 ? (
          <EmptyState title="Nothing here" description="No caterers match this filter." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {caterers.map((c) => (
              <div key={c._id} className="rounded-2xl border border-stone-200 bg-paper p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">{c.name}</p>
                    <p className="flex items-center gap-1.5 text-sm text-stone-500">
                      <MapPin size={13} /> {c.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-turmeric/15 px-2.5 py-1 text-xs font-semibold text-turmeric-dark">
                    <Star size={12} fill="currentColor" /> {c.rating?.toFixed(1) || "New"}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-stone-600">{c.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">₹{c.pricePerPlate}/plate</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.approved ? "bg-sage/15 text-sage" : "bg-turmeric/15 text-turmeric-dark"}`}>
                    {c.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div className="mt-4 flex gap-2 border-t border-stone-100 pt-4">
                  {!c.approved ? (
                    <button
                      onClick={() => handleApprove(c._id, true)}
                      className="flex-1 rounded-lg bg-paprika py-2 text-xs font-semibold text-cream hover:bg-paprika-dark"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(c._id, false)}
                      className="flex-1 rounded-lg border border-paprika/30 py-2 text-xs font-semibold text-paprika hover:bg-paprika/5"
                    >
                      Revoke Approval
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCaterersPage;
