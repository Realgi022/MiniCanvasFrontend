import { useEffect, useState } from "react";
import { createUser, getAllUsers, updateUserRole } from "../api/admin";

function AdminPage({ onLogout }) {
  const email = localStorage.getItem("email");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "STUDENT",
  });

  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await getAllUsers();

      const usersWithSelectedRole = response.data.map((user) => ({
        ...user,
        selectedRole: user.role,
      }));

      setUsers(usersWithSelectedRole);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await createUser(form);
      setMessage(`User created: ${response.data.email}`);

      setForm({
        email: "",
        password: "",
        fullName: "",
        role: "STUDENT",
      });

      await loadUsers();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to create user");
    }
  };

  const handleRoleSelectChange = (id, value) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, selectedRole: value } : user
      )
    );
  };

  const handleUpdateRole = async (id, role) => {
    try {
      setUpdatingUserId(id);
      await updateUserRole(id, role);
      setMessage("User role updated successfully");
      await loadUsers();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to update role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>Admin Page</h1>
      <p>Logged in as: {email}</p>
      <p>Roles: {roles.join(", ")}</p>

      <button
        onClick={onLogout}
        style={{
          marginTop: "10px",
          marginBottom: "30px",
          padding: "10px 18px",
          border: "none",
          borderRadius: "8px",
          background: "#dc2626",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Logout
      </button>

      <h2>Create User</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "40px",
        }}
      >
        <input
          type="text"
          name="fullName"
          placeholder="Full name"
          value={form.fullName}
          onChange={handleChange}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="STUDENT">STUDENT</option>
          <option value="TEACHER">TEACHER</option>
        </select>

        <button
          type="submit"
          style={{
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#2563eb",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Create User
        </button>
      </form>

      {message && <p style={{ marginBottom: "20px" }}>{message}</p>}

      <h2>User List</h2>

      {loadingUsers ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              color: "black",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#e5e7eb" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Full Name</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Current Role</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Change Role</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderTop: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>{user.id}</td>
                  <td style={{ padding: "12px" }}>{user.fullName}</td>
                  <td style={{ padding: "12px" }}>{user.email}</td>
                  <td style={{ padding: "12px" }}>{user.role}</td>
                  <td style={{ padding: "12px" }}>
                    <select
                      value={user.selectedRole}
                      onChange={(e) =>
                        handleRoleSelectChange(user.id, e.target.value)
                      }
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                      }}
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="TEACHER">TEACHER</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() =>
                        handleUpdateRole(user.id, user.selectedRole)
                      }
                      disabled={updatingUserId === user.id}
                      style={{
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#16a34a",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                        opacity: updatingUserId === user.id ? 0.7 : 1,
                      }}
                    >
                      {updatingUserId === user.id ? "Updating..." : "Update"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;