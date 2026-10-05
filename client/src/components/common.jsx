import { Inbox, Loader2 } from "lucide-react";

export const statusStyles = {
  Pending: "bg-turmeric/15 text-turmeric-dark",
  Accepted: "bg-sage/15 text-sage",
  Rejected: "bg-paprika/15 text-paprika",
  Confirmed: "bg-sage/15 text-sage",
  "In Preparation": "bg-turmeric/15 text-turmeric-dark",
  Completed: "bg-stone-200 text-stone-700",
  Cancelled: "bg-paprika/15 text-paprika",
  Paid: "bg-sage/15 text-sage",
  "Partially Paid": "bg-turmeric/15 text-turmeric-dark",
};

export const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
      statusStyles[status] || "bg-stone-200 text-stone-700"
    }`}
  >
    {status}
  </span>
);

export const Loader = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-24 text-stone-500">
    <Loader2 className="animate-spin text-paprika" size={28} />
    <p className="text-sm">{label}</p>
  </div>
);

export const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50 py-16 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-200 text-stone-500">
      <Inbox size={22} />
    </span>
    <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
    {description && <p className="max-w-sm text-sm text-stone-500">{description}</p>}
    {action}
  </div>
);
