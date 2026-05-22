import { useEffect, useState } from "react";
import {
  getMyClasses,
  getAllClasses,
  getClassMembers,
  getAssignableUsers,
  assignUserToClass,
  removeUserFromClass,
} from "../api/classes";
import "./ClassPeopleSection.css";

function ClassPeopleSection({ isTeacher }) {
  const [message, setMessage] = useState("");

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
    loadClassPeople();
  }, [isTeacher]);

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
      setMessage("");

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
      setMessage("");

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
    <>
      <h3>Class / People</h3>

      {message && <p className="student-error">{message}</p>}

      {loadingClassPeople ? (
        <p>Loading class people...</p>
      ) : isTeacher ? (
        <>
          <p>Select a class, view its members, and assign students or teachers.</p>

          <div className="class-management-section">
            <label>Select class</label>

            <select value={selectedClassId} onChange={handleClassSelectChange}>
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

          <form className="class-assign-form" onSubmit={handleAssignSubmit}>
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
                  {userItem.fullName || userItem.email} - {userItem.role}
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
          <p>Here you can see your classmates and teachers for your class.</p>

          {myClasses.length === 0 ? (
            <p>You are not assigned to a class yet.</p>
          ) : (
            myClasses.map((classItem) => (
              <div className="class-table-wrapper" key={classItem.classId}>
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
  );
}

export default ClassPeopleSection;