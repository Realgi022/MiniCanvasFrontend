import { useEffect, useState } from "react";
import { getMe } from "../api/auth";

function ProfilePage({ token, onLogout }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMe(token);
        setUser(response.data);
      } catch (error) {
        console.error(error);
        setMessage("Failed to fetch user data");
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  return (
    <div>
      <h2>Profile</h2>

      {message && <p>{message}</p>}

      {user ? (
        <div>
          <p><strong>Email:</strong> {user.email}</p>
          <p>
            <strong>Roles:</strong>{" "}
            {Array.isArray(user.roles) ? user.roles.join(", ") : "No roles"}
          </p>
        </div>
      ) : (
        !message && <p>Loading...</p>
      )}

      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ProfilePage;