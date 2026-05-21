import { useEffect, useState } from "react";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../api/announcements";
import "./AnnouncementsSection.css";

function AnnouncementsSection({ isTeacher }) {
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      setMessage("");

      const response = await getAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load announcements");
    } finally {
      setLoadingAnnouncements(false);
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
      setMessage("");

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
      setMessage("");

      await deleteAnnouncement(id);
      setMessage("Announcement deleted successfully");

      await loadAnnouncements();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to delete announcement");
    }
  };

  return (
    <>
      <h3>Announcements</h3>

      <p>
        Important announcements from teachers and the school will appear here.
      </p>

      {message && <p className="student-error">{message}</p>}

      {isTeacher && (
        <form className="announcement-form" onSubmit={handleAnnouncementSubmit}>
          <h4>{editingId ? "Edit announcement" : "Create announcement"}</h4>

          <input
            type="text"
            name="title"
            placeholder="Announcement title"
            value={announcementForm.title}
            onChange={handleAnnouncementChange}
            required
          />

          <textarea
            name="content"
            placeholder="Announcement content"
            value={announcementForm.content}
            onChange={handleAnnouncementChange}
            rows="4"
            required
          />

          <div className="announcement-form-buttons">
            <button type="submit">{editingId ? "Update" : "Create"}</button>

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
                {announcement.createdByName || announcement.createdByEmail}
              </small>

              {isTeacher && (
                <div className="announcement-actions">
                  <button onClick={() => handleEditAnnouncement(announcement)}>
                    Edit
                  </button>

                  <button
                    className="delete-announcement-button"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
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
  );
}

export default AnnouncementsSection;