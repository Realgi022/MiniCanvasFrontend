import { useEffect, useState } from "react";
import { getMe } from "../api/auth";
import AiBotPage from "./AiBotPage";
import "./ProfilePage.css";


function ProfilePage({ token, onLogout }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Announcements");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMe(token);
        setUser(response.data);
      } catch (error) {
        console.error("GET /auth/me failed:", error);
        setMessage("Failed to fetch user data");
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("email");
    onLogout();
  };

  const menuItems = [
    "Announcements",
    "Class/People",
    "Assignments",
    "Grading",
    "AI Study Bot",
  ];

  const email = user?.email || localStorage.getItem("email");
  const roles =
    user?.roles || JSON.parse(localStorage.getItem("roles") || "[]");

  return (
    <div className="student-page">
      <aside className={`student-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <button
            className="hamburger-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`sidebar-menu-item ${activeItem === item ? "active" : ""
                }`}
              onClick={() => setActiveItem(item)}
            >
              {sidebarOpen ? item : ""}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            {sidebarOpen && (
              <>
                <p><strong>{email}</strong></p>
                <p>{Array.isArray(roles) ? roles.join(", ") : "No role"}</p>
              </>
            )}
          </div>

          <button className="sidebar-logout" onClick={handleLogout}>
            {sidebarOpen ? "Logout" : "↩"}
          </button>
        </div>
      </aside>

      <main className="student-main">
        <div className="student-topbar">
          <h2>{activeItem}</h2>
          <span>Student side</span>
        </div>

        {message && <p className="student-error">{message}</p>}

        <div className="student-content-box">
          {activeItem === "Announcements" && (
            <>
              <h3>Announcements</h3>
              <p>Important announcements from teachers and the school will appear here.</p>
            </>
          )}

          {activeItem === "Class/People" && (
            <>
              <h3>Class / People</h3>
              <p>Here you will be able to see classmates, teachers, and class-related information.</p>
            </>
          )}

          {activeItem === "Assignments" && (
            <>
              <h3>Assignments</h3>
              <p>Current and upcoming assignments will appear here.</p>
            </>
          )}

          {activeItem === "Grading" && (
            <>
              <h3>Grading</h3>
              <p>Your grades, feedback, and progress will be shown here.</p>
            </>
          )}

          {activeItem === "AI Study Bot" && <AiBotPage />}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;