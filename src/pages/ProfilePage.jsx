import { useEffect, useState } from "react";
import { getMe } from "../api/auth";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../api/announcements";
import AiBotPage from "./AiBotPage";
import "./ProfilePage.css";

function ProfilePage({ token, onLogout }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Announcements");

  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
  });

  const [editingId, setEditingId] = useState(null);

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

  const loadAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const response = await getAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load announcements");
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    if (token && activeItem === "Announcements") {
      loadAnnouncements();
    }
  }, [token, activeItem]);

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

  const isTeacher = Array.isArray(roles) && roles.includes("TEACHER");

  const handleMenuClick = (item) => {
    setActiveItem(item);
    setMessage("");

    if (item !== "Announcements") {
      setEditingId(null);
      setAnnouncementForm({
        title: "",
        content: "",
      });
    }
  };

  const handleAnnouncementChange = (e) => {
    setAnnouncementForm({
      ...announcementForm,
      [e.target.name]: e.target.value,
    });
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: "",
      content: "",
    });
    setEditingId(null);
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateAnnouncement(editingId, announcementForm);
        setMessage("Announcement updated successfully");
      } else {
        await createAnnouncement(announcementForm);
        setMessage("Announcement created successfully");
      }

      resetAnnouncementForm();
      await loadAnnouncements();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to save announcement");
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setMessage("");
    setEditingId(announcement.id);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
    });
  };

  const handleDeleteAnnouncement = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmed) return;

    try {
      await deleteAnnouncement(id);
      setMessage("Announcement deleted successfully");
      await loadAnnouncements();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to delete announcement");
    }
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

        {message && activeItem === "Announcements" && (
          <p className="student-error">{message}</p>
        )}

        <div className="student-content-box">
          {activeItem === "Announcements" && (
            <>
              <h3>Announcements</h3>
              <p>
                Important announcements from teachers and the school will appear
                here.
              </p>

              {isTeacher && (
                <form
                  className="announcement-form"
                  onSubmit={handleAnnouncementSubmit}
                >
                  <h4>
                    {editingId ? "Edit announcement" : "Create announcement"}
                  </h4>

                  <input
                    type="text"
                    name="title"
                    placeholder="Announcement title"
                    value={announcementForm.title}
                    onChange={handleAnnouncementChange}
                  />

                  <textarea
                    name="content"
                    placeholder="Announcement content"
                    value={announcementForm.content}
                    onChange={handleAnnouncementChange}
                    rows="4"
                  />

                  <div className="announcement-form-buttons">
                    <button type="submit">
                      {editingId ? "Update" : "Create"}
                    </button>

                    {editingId && (
                      <button type="button" onClick={resetAnnouncementForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              {loadingAnnouncements ? (
                <p>Loading announcements...</p>
              ) : announcements.length === 0 ? (
                <p>No announcements yet.</p>
              ) : (
                <div className="announcement-list">
                  {announcements.map((announcement) => (
                    <div className="announcement-card" key={announcement.id}>
                      <h4>{announcement.title}</h4>
                      <p>{announcement.content}</p>

                      <small>
                        Posted by{" "}
                        {announcement.createdByName ||
                          announcement.createdByEmail}
                      </small>

                      {isTeacher && (
                        <div className="announcement-actions">
                          <button
                            onClick={() =>
                              handleEditAnnouncement(announcement)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-announcement-button"
                            onClick={() =>
                              handleDeleteAnnouncement(announcement.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeItem === "Class/People" && (
            <>
              <h3>Class / People</h3>
              <p>
                Here you will be able to see classmates, teachers, and
                class-related information.
              </p>
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