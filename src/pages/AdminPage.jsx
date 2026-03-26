import { useState } from "react";
import { createUser } from "../api/admin";

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

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
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to create user");
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
        }}
      >
        <input
          type="text"
          name="fullName"
          placeholder="Full name"
          value={form.fullName}
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
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

      {message && (
        <p style={{ marginTop: "16px" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default AdminPage;