import { useEffect, useState } from "react";
import { Users, UtensilsCrossed, ClipboardList, Wallet, TrendingUp, CheckCircle2 } from "lucide-react";
import { adminService } from "../../services";
import { Loader } from "../../components/common";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.getDashboard().then(({ data }) => setStats(data.stats));
  }, []);

  if (!stats) return <Loader />;

  const cards = [
    { label: "Total customers", value: stats.totalCustomers, icon: Users },
    { label: "Total caterers", value: stats.totalCaterers, icon: UtensilsCrossed },
    { label: "Total bookings", value: stats.totalBookings, icon: ClipboardList },
    { label: "Confirmed bookings", value: stats.confirmedBookings, icon: CheckCircle2 },
    { label: "Pending bookings", value: stats.pendingBookings, icon: ClipboardList },
    { label: "Completed bookings", value: stats.completedBookings, icon: CheckCircle2 },
    { label: "Total revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: Wallet },
    { label: "This month", value: `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`, icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Admin Dashboard</h1>
      <p className="mt-1 text-stone-500">Platform-wide overview of customers, caterers, and bookings.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-stone-200 bg-paper p-4 shadow-card">
            <c.icon className="text-paprika" size={18} />
            <p className="mt-2 font-display text-2xl font-semibold text-ink">{c.value}</p>
            <p className="text-xs text-stone-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-paper p-5 shadow-card">
          <h3 className="font-display text-base font-semibold text-ink">Most booked caterers</h3>
          <div className="mt-3 space-y-2">
            {stats.mostBookedCaterers?.length ? (
              stats.mostBookedCaterers.map((c) => (
                <div key={c._id} className="flex items-center justify-between text-sm">
                  <span className="text-stone-700">{c.name}</span>
                  <span className="text-turmeric-dark">{c.rating?.toFixed(1)} ★</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">No data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-paper p-5 shadow-card">
          <h3 className="font-display text-base font-semibold text-ink">Most popular menu items</h3>
          <div className="mt-3 space-y-2">
            {stats.mostPopularMenuItems?.length ? (
              stats.mostPopularMenuItems.map((item) => (
                <div key={item.itemName} className="flex items-center justify-between text-sm">
                  <span className="text-stone-700">{item.itemName}</span>
                  <span className="text-stone-500">{item.count} bookings</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
