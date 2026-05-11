import { useEffect, useState } from "react";
import { getMe } from "../api/auth";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../api/announcements";
import {
  getMyClasses,
  getAllClasses,
  getClassMembers,
  getAssignableUsers,
  assignUserToClass,
  removeUserFromClass,
} from "../api/classes";
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

  const [myClasses, setMyClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClassMembers, setSelectedClassMembers] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingClassPeople, setLoadingClassPeople] = useState(false);

  const [assignForm, setAssignForm] = useState({
    userId: "",
    classId: "",
    classRole: "STUDENT",
  });

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

  const loadClassPeople = async () => {
    try {
      setLoadingClassPeople(true);
      setMessage("");

      if (isTeacher) {
        const classesResponse = await getAllClasses();
        const usersResponse = await getAssignableUsers();

        setClasses(classesResponse.data);
        setAllUsers(usersResponse.data);

        if (classesResponse.data.length > 0) {
          const firstClassId = classesResponse.data[0].id;

          setSelectedClassId(firstClassId);

          setAssignForm((prev) => ({
            ...prev,
            classId: firstClassId,
          }));

          const membersResponse = await getClassMembers(firstClassId);
          setSelectedClassMembers(membersResponse.data);
        } else {
          setSelectedClassId("");
          setSelectedClassMembers(null);
        }
      } else {
        const response = await getMyClasses();
        setMyClasses(response.data);
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to load class people");
    } finally {
      setLoadingClassPeople(false);
    }
  };

  useEffect(() => {
    if (token && activeItem === "Announcements") {
      loadAnnouncements();
    }

    if (token && activeItem === "Class/People") {
      loadClassPeople();
    }
  }, [token, activeItem, isTeacher]);

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

  const handleClassSelectChange = async (e) => {
    const classId = e.target.value;

    setSelectedClassId(classId);
    setAssignForm((prev) => ({
      ...prev,
      classId: classId,
    }));

    try {
      setLoadingClassPeople(true);
      setMessage("");

      const response = await getClassMembers(classId);
      setSelectedClassMembers(response.data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to load class members");
    } finally {
      setLoadingClassPeople(false);
    }
  };

  const handleAssignFormChange = (e) => {
    setAssignForm({
      ...assignForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    try {
      await assignUserToClass({
        userId: Number(assignForm.userId),
        classId: Number(assignForm.classId),
        classRole: assignForm.classRole,
      });

      setMessage("User assigned to class successfully");

      const response = await getClassMembers(assignForm.classId);
      setSelectedClassMembers(response.data);

      setAssignForm((prev) => ({
        ...prev,
        userId: "",
        classRole: "STUDENT",
      }));
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to assign user");
    }
  };

  const handleRemoveFromClass = async (classId, userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this user from the class?"
    );

    if (!confirmed) return;

    try {
      await removeUserFromClass(classId, userId);
      setMessage("User removed from class");

      const response = await getClassMembers(classId);
      setSelectedClassMembers(response.data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to remove user");
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

        {message &&
          (activeItem === "Announcements" || activeItem === "Class/People") && (
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

              {loadingClassPeople ? (
                <p>Loading class people...</p>
              ) : isTeacher ? (
                <>
                  <p>
                    Select a class, view its members, and assign students or
                    teachers.
                  </p>

                  <div className="class-management-section">
                    <label>Select class</label>
                    <select
                      value={selectedClassId}
                      onChange={handleClassSelectChange}
                    >
                      {classes.length === 0 ? (
                        <option value="">No classes found</option>
                      ) : (
                        classes.map((classItem) => (
                          <option key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <form
                    className="class-assign-form"
                    onSubmit={handleAssignSubmit}
                  >
                    <h4>Assign user to class</h4>

                    <select
                      name="userId"
                      value={assignForm.userId}
                      onChange={handleAssignFormChange}
                      required
                    >
                      <option value="">Choose user</option>
                      {allUsers.map((userItem) => (
                        <option key={userItem.id} value={userItem.id}>
                          {userItem.fullName || userItem.email} -{" "}
                          {userItem.role}
                        </option>
                      ))}
                    </select>

                    <select
                      name="classId"
                      value={assignForm.classId}
                      onChange={handleAssignFormChange}
                      required
                    >
                      <option value="">Choose class</option>
                      {classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>

                    <select
                      name="classRole"
                      value={assignForm.classRole}
                      onChange={handleAssignFormChange}
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="TEACHER">TEACHER</option>
                    </select>

                    <button type="submit">Assign</button>
                  </form>

                  {selectedClassMembers && (
                    <div className="class-table-wrapper">
                      <h4>{selectedClassMembers.className}</h4>

                      {selectedClassMembers.members.length === 0 ? (
                        <p>No users assigned to this class yet.</p>
                      ) : (
                        <table className="class-people-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Section</th>
                              <th>Role</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {selectedClassMembers.members.map((member) => (
                              <tr key={member.userId}>
                                <td>{member.fullName || "No name"}</td>
                                <td>{member.email}</td>
                                <td>{selectedClassMembers.className}</td>
                                <td>{member.classRole}</td>
                                <td>
                                  <button
                                    className="remove-member-button"
                                    onClick={() =>
                                      handleRemoveFromClass(
                                        selectedClassMembers.classId,
                                        member.userId
                                      )
                                    }
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p>
                    Here you can see your classmates and teachers for your
                    class.
                  </p>

                  {myClasses.length === 0 ? (
                    <p>You are not assigned to a class yet.</p>
                  ) : (
                    myClasses.map((classItem) => (
                      <div
                        className="class-table-wrapper"
                        key={classItem.classId}
                      >
                        <h4>{classItem.className}</h4>

                        <table className="class-people-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Section</th>
                              <th>Role</th>
                            </tr>
                          </thead>

                          <tbody>
                            {classItem.members.map((member) => (
                              <tr key={member.userId}>
                                <td>{member.fullName || "No name"}</td>
                                <td>{member.email}</td>
                                <td>{classItem.className}</td>
                                <td>{member.classRole}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))
                  )}
                </>
              )}
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