import { useEffect, useState } from "react";
import { createUser, getAllUsers, updateUserRole } from "../api/admin";
import "./AdminPage.css";

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
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Page</h1>
          <p>Logged in as: {email}</p>
          <p>Roles: {roles.join(", ")}</p>
        </div>

        <button className="admin-logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>

      <section className="admin-section">
        <h2>Create User</h2>

        <form className="admin-create-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full name"
            value={form.fullName}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="STUDENT">STUDENT</option>
            <option value="TEACHER">TEACHER</option>
          </select>

          <button type="submit">Create User</button>
        </form>
      </section>

      {message && <p className="admin-message">{message}</p>}

      <section className="admin-section">
        <h2>User List</h2>

        {loadingUsers ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Change Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <select
                        value={user.selectedRole}
                        onChange={(e) =>
                          handleRoleSelectChange(user.id, e.target.value)
                        }
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="TEACHER">TEACHER</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="admin-update-role-button"
                        onClick={() =>
                          handleUpdateRole(user.id, user.selectedRole)
                        }
                        disabled={updatingUserId === user.id}
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
      </section>
    </div>
  );
}

export default AdminPage;