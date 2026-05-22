import { useEffect, useState } from "react";
import { getMe } from "../api/auth";
import AiBotPage from "./AiBotPage";
import AnnouncementsSection from "./AnnouncementsSection";
import ClassPeopleSection from "./ClassPeopleSection";
import AssignmentsSection from "./AssignmentsSection";
import GradingSection from "./GradingSection";
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

  const email = user?.email || localStorage.getItem("email");
  const roles =
    user?.roles || JSON.parse(localStorage.getItem("roles") || "[]");

  const isTeacher = Array.isArray(roles) && roles.includes("TEACHER");

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

  const handleMenuClick = (item) => {
    setActiveItem(item);
    setMessage("");
  };

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
              className={`sidebar-menu-item ${
                activeItem === item ? "active" : ""
              }`}
              onClick={() => handleMenuClick(item)}
            >
              {sidebarOpen ? item : ""}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            {sidebarOpen && (
              <>
                <p>
                  <strong>{email}</strong>
                </p>
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
          <span>{isTeacher ? "Teacher side" : "Student side"}</span>
        </div>

        {message && <p className="student-error">{message}</p>}

        <div className="student-content-box">
          {activeItem === "Announcements" && (
            <AnnouncementsSection isTeacher={isTeacher} />
          )}

          {activeItem === "Class/People" && (
            <ClassPeopleSection isTeacher={isTeacher} />
          )}

          {activeItem === "Assignments" && (
            <AssignmentsSection isTeacher={isTeacher} />
          )}

          {activeItem === "Grading" && (
            <GradingSection isTeacher={isTeacher} />
          )}

          {activeItem === "AI Study Bot" && <AiBotPage />}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;