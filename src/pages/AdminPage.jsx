function AdminPage({ onLogout }) {
  const email = localStorage.getItem("email");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>Admin Page</h1>
      <p>Logged in as: {email}</p>
      <p>Roles: {roles.join(", ")}</p>

      <button
        onClick={onLogout}
        style={{
          marginTop: "20px",
          padding: "10px 18px",
          border: "none",
          borderRadius: "8px",
          background: "#dc2626",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default AdminPage;