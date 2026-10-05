import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService } from "../../services";
import { Loader } from "../../components/common";

const ROLE_FILTERS = ["All", "customer", "caterer", "admin"];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchUsers = () => {
    setLoading(true);
    adminService
      .getUsers(filter === "All" ? {} : { role: filter })
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, [filter]);

  const handleToggleBlock = async (id) => {
    try {
      await adminService.toggleBlockUser(id);
      toast.success("User status updated");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update user");
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Manage Users</h1>
      <p className="mt-1 text-stone-500">View and moderate all customer and caterer accounts.</p>

      <div className="mt-5 flex gap-2">
        {ROLE_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition ${
              filter === r ? "bg-paprika text-cream" : "bg-stone-100 text-stone-600"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-paper shadow-card">
        {loading ? (
          <Loader />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs font-medium uppercase tracking-wide text-stone-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-5 py-3 text-stone-600">{u.email}</td>
                  <td className="px-5 py-3 text-stone-600">{u.phone}</td>
                  <td className="px-5 py-3 capitalize text-stone-600">{u.role}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.isBlocked ? "bg-paprika/15 text-paprika" : "bg-sage/15 text-sage"}`}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.role !== "admin" && (
                      <button
                        onClick={() => handleToggleBlock(u._id)}
                        className="text-xs font-medium text-paprika hover:underline"
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
