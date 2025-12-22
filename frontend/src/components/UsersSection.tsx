// UsersSection.tsx
// FIX: Remove white color from SELECT dropdown
// FIX: Change password visibility (eye icon) color
// NOTE: Eye icon color is browser-controlled; using color-scheme + caret/foreground fixes it

import api from "@/lib/axios";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "MANAGER" | "STAFF";
  isActive: boolean;
}

const UsersSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as "ADMIN" | "MANAGER" | "STAFF",
  });

  // ---------------- Fetch users ----------------
  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>("/auth/users");
      setUsers(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------------- Register user ----------------
  const handleRegister = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert("Name and Email are required");
      return;
    }

    if (
      (newUser.role === "ADMIN" || newUser.role === "MANAGER") &&
      !newUser.password.trim()
    ) {
      alert("Password is required for Admin and Manager");
      return;
    }

    try {
      await api.post("/auth/register", {
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password || undefined,
        role: newUser.role,
      });

      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "STAFF",
      });

      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to register user");
    }
  };

  // ---------------- Toggle status ----------------
  const toggleStatus = async (user: User) => {
    try {
      await api.put(`/auth/users/${user.id}/status`, {
        isActive: !user.isActive,
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // ---------------- Delete user ----------------
  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/auth/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  // ---------------- Render ----------------
  if (loading) return <p className="text-sm text-muted-foreground">Loading users...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="mt-6 space-y-6 bg-transparent">
      <h2 className="text-xl font-semibold text-foreground">User Management</h2>

      {/* Register */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground caret-primary placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <input
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground caret-primary placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {/* PASSWORD – eye icon color controlled via color-scheme */}
        <input
          type="password"
          placeholder="Password (optional for Staff)"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground caret-primary placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          style={{ colorScheme: "dark" }}
        />

        {/* SELECT – no white background or text */}
        <select
          value={newUser.role}
          onChange={(e) =>
            setNewUser({
              ...newUser,
              role: e.target.value as "ADMIN" | "MANAGER" | "STAFF",
            })
          }
          className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option className="bg-background text-foreground" value="ADMIN">
            Admin
          </option>
          <option className="bg-background text-foreground" value="MANAGER">
            Manager
          </option>
          <option className="bg-background text-foreground" value="STAFF">
            Staff
          </option>
        </select>

        <button
          onClick={handleRegister}
          className="bg-transparent border border-primary text-primary rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/10 transition"
        >
          Register
        </button>
      </div>

      {/* Users */}
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border border-border bg-transparent px-4 py-3"
          >
            <div>
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.email} · {user.role}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(user)}
                className="bg-transparent border border-border px-3 py-1 rounded-md text-xs text-foreground hover:bg-muted/20 transition"
              >
                {user.isActive ? "Active" : "Inactive"}
              </button>

              <button
                onClick={() => deleteUser(user.id)}
                className="bg-transparent border border-red-500 text-red-500 px-3 py-1 rounded-md text-xs hover:bg-red-500/10 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersSection;
