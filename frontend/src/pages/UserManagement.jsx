import axiosClient from "@/lib/axiosClient";
import { ChevronRight, Search, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Only SuperAdmin can view all users
    if (!token || userRole !== "SUPERADMIN") {
      navigate("/login");
      return;
    }

    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/api/users");
      setUsers(res.data.data || []);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load users";
      setError(message);
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-purple-500/30 text-purple-200";
      case "ADMIN":
        return "bg-blue-500/30 text-blue-200";
      case "MANAGER":
        return "bg-green-500/30 text-green-200";
      case "STAFF":
        return "bg-orange-500/30 text-orange-200";
      default:
        return "bg-gray-500/30 text-gray-200";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "SUPERADMIN":
        return "👑";
      case "ADMIN":
        return "⚙️";
      case "MANAGER":
        return "📦";
      case "STAFF":
        return "👷";
      default:
        return "👤";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-gray-300">View and manage all system users</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL" className="bg-slate-900">
                  All Roles
                </option>
                <option value="SUPERADMIN" className="bg-slate-900">
                  SuperAdmin
                </option>
                <option value="ADMIN" className="bg-slate-900">
                  Admin
                </option>
                <option value="MANAGER" className="bg-slate-900">
                  Manager
                </option>
                <option value="STAFF" className="bg-slate-900">
                  Staff
                </option>
              </select>
            </div>

            {/* Action Button */}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => navigate("/auth/register-user")}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <span>Register New User</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-300">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-300 mb-4">No users found</p>
              <button
                onClick={() => navigate("/auth/register-user")}
                className="text-purple-400 hover:text-purple-300 font-semibold underline"
              >
                Register the first user
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Created By</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getRoleIcon(user.role)}</span>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300 text-sm">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 text-sm">
                          {user.createdBy ? `User #${user.createdBy}` : "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                            user.isActive
                              ? "bg-green-500/30 text-green-200"
                              : "bg-red-500/30 text-red-200"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-red-400 hover:text-red-300 disabled:text-gray-600 transition"
                          disabled={user.role === "SUPERADMIN"}
                          title={user.role === "SUPERADMIN" ? "Cannot delete SuperAdmin" : "Delete user"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Stats */}
          {filteredUsers.length > 0 && (
            <div className="border-t border-white/10 px-6 py-4 bg-white/5">
              <p className="text-sm text-gray-400">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white font-semibold rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
