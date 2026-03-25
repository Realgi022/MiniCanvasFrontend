function AdminPage() {
  const email = localStorage.getItem("email");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>Admin Page</h1>
      <p>Logged in as: {email}</p>
      <p>Roles: {roles.join(", ")}</p>
    </div>
  );
}

export default AdminPage;