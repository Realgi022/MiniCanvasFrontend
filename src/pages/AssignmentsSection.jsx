import { useEffect, useState } from "react";
import { getAllClasses } from "../api/classes";
import {
  createAssignment,
  getAssignmentsForClass,
  getMyAssignments,
  submitAssignment,
  getSubmissionsForAssignment,
  getSubmissionPreviewBlob,
  getSubmissionDownloadBlob,
} from "../api/assignments";

function AssignmentsSection({ isTeacher }) {
  const [message, setMessage] = useState("");

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueAt: "",
  });

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [studentNameFilter, setStudentNameFilter] = useState("");

  const [studentUploadForms, setStudentUploadForms] = useState({});

  useEffect(() => {
    if (isTeacher) {
      loadTeacherData();
    } else {
      loadStudentAssignments();
    }
  }, [isTeacher]);

  const loadTeacherData = async () => {
    try {
      setLoadingAssignments(true);

      const classesResponse = await getAllClasses();
      setClasses(classesResponse.data);

      if (classesResponse.data.length > 0) {
        const firstClassId = classesResponse.data[0].id;
        setSelectedClassId(firstClassId);

        const assignmentsResponse = await getAssignmentsForClass(firstClassId);
        setAssignments(assignmentsResponse.data);
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to load assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadAssignmentsForClass = async (classId) => {
    try {
      setLoadingAssignments(true);
      setSelectedAssignment(null);
      setSubmissions([]);

      const response = await getAssignmentsForClass(classId);
      setAssignments(response.data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to load class assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadStudentAssignments = async () => {
    try {
      setLoadingAssignments(true);

      const response = await getMyAssignments();
      setAssignments(response.data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to load your assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    await loadAssignmentsForClass(classId);
  };

  const handleAssignmentFormChange = (e) => {
    setAssignmentForm({
      ...assignmentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    try {
      await createAssignment({
        classId: Number(selectedClassId),
        title: assignmentForm.title,
        description: assignmentForm.description,
        dueAt: assignmentForm.dueAt ? assignmentForm.dueAt : null,
      });

      setMessage("Assignment created successfully");

      setAssignmentForm({
        title: "",
        description: "",
        dueAt: "",
      });

      await loadAssignmentsForClass(selectedClassId);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to create assignment");
    }
  };

  const handleSelectAssignment = async (assignment) => {
    setSelectedAssignment(assignment);
    await loadSubmissions(assignment.id, studentNameFilter);
  };

  const loadSubmissions = async (assignmentId, filterName = "") => {
    try {
      const response = await getSubmissionsForAssignment(assignmentId, filterName);
      setSubmissions(response.data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to load submissions");
    }
  };

  const handleSearchSubmissions = async (e) => {
    e.preventDefault();

    if (!selectedAssignment) return;

    await loadSubmissions(selectedAssignment.id, studentNameFilter);
  };

  const handleStudentFileChange = (assignmentId, file) => {
    setStudentUploadForms((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        file,
      },
    }));
  };

  const handleStudentCommentChange = (assignmentId, comment) => {
    setStudentUploadForms((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        comment,
      },
    }));
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const form = studentUploadForms[assignmentId];

    if (!form?.file) {
      setMessage("Please choose a file first");
      return;
    }

    try {
      await submitAssignment(assignmentId, form.file, form.comment);

      setMessage("Assignment submitted successfully");

      setStudentUploadForms((prev) => ({
        ...prev,
        [assignmentId]: {
          file: null,
          comment: "",
        },
      }));

      await loadStudentAssignments();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to submit assignment");
    }
  };

  const handlePreviewSubmission = async (submission) => {
    try {
      const response = await getSubmissionPreviewBlob(submission.id);
      const blobUrl = URL.createObjectURL(response.data);

      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error(error);
      setMessage("Failed to preview file");
    }
  };

  const handleDownloadSubmission = async (submission) => {
    try {
      const response = await getSubmissionDownloadBlob(submission.id);
      const blobUrl = URL.createObjectURL(response.data);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = submission.originalFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);
      setMessage("Failed to download file");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "No due date";

    return new Date(dateValue).toLocaleString();
  };

  return (
    <>
      <h3>Assignments</h3>

      {message && <p className="student-error">{message}</p>}

      {isTeacher ? (
        <>
          <p>Create assignments for classes and review student submissions.</p>

          <div className="assignment-teacher-grid">
            <div className="assignment-panel">
              <h4>Select class</h4>

              <select value={selectedClassId} onChange={handleClassChange}>
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

            <form className="assignment-panel" onSubmit={handleCreateAssignment}>
              <h4>Create assignment</h4>

              <input
                type="text"
                name="title"
                placeholder="Assignment title"
                value={assignmentForm.title}
                onChange={handleAssignmentFormChange}
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={assignmentForm.description}
                onChange={handleAssignmentFormChange}
                rows="4"
              />

              <input
                type="datetime-local"
                name="dueAt"
                value={assignmentForm.dueAt}
                onChange={handleAssignmentFormChange}
              />

              <button type="submit">Create assignment</button>
            </form>
          </div>

          <div className="assignment-list">
            <h4>Assignments</h4>

            {loadingAssignments ? (
              <p>Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p>No assignments found for this class.</p>
            ) : (
              assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`assignment-card ${
                    selectedAssignment?.id === assignment.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectAssignment(assignment)}
                >
                  <h4>{assignment.title}</h4>
                  <p>{assignment.description || "No description"}</p>
                  <small>Class: {assignment.className}</small>
                  <br />
                  <small>Due: {formatDate(assignment.dueAt)}</small>
                </div>
              ))
            )}
          </div>

          {selectedAssignment && (
            <div className="submission-section">
              <h4>Submissions for: {selectedAssignment.title}</h4>

              <form className="submission-filter-form" onSubmit={handleSearchSubmissions}>
                <input
                  type="text"
                  placeholder="Search student name"
                  value={studentNameFilter}
                  onChange={(e) => setStudentNameFilter(e.target.value)}
                />
                <button type="submit">Search</button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentNameFilter("");
                    loadSubmissions(selectedAssignment.id, "");
                  }}
                >
                  Clear
                </button>
              </form>

              {submissions.length === 0 ? (
                <p>No submissions yet.</p>
              ) : (
                <table className="assignment-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th>File</th>
                      <th>Submitted at</th>
                      <th>Comment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td>{submission.studentName || "No name"}</td>
                        <td>{submission.studentEmail}</td>
                        <td>{submission.originalFileName}</td>
                        <td>{formatDate(submission.submittedAt)}</td>
                        <td>{submission.comment || "-"}</td>
                        <td>
                          <div className="assignment-table-actions">
                            <button onClick={() => handlePreviewSubmission(submission)}>
                              Preview
                            </button>
                            <button onClick={() => handleDownloadSubmission(submission)}>
                              Download
                            </button>
                          </div>
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
          <p>View your class assignments and upload your work.</p>

          {loadingAssignments ? (
            <p>Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <p>No assignments found for your class.</p>
          ) : (
            <div className="assignment-list">
              {assignments.map((assignment) => (
                <div className="assignment-card" key={assignment.id}>
                  <div className="assignment-card-header">
                    <h4>{assignment.title}</h4>
                    <span
                      className={
                        assignment.submitted
                          ? "assignment-status submitted"
                          : "assignment-status not-submitted"
                      }
                    >
                      {assignment.submitted ? "Submitted" : "Not submitted"}
                    </span>
                  </div>

                  <p>{assignment.description || "No description"}</p>

                  <small>Class: {assignment.className}</small>
                  <br />
                  <small>Due: {formatDate(assignment.dueAt)}</small>

                  <div className="student-submit-box">
                    <input
                      type="file"
                      onChange={(e) =>
                        handleStudentFileChange(
                          assignment.id,
                          e.target.files[0]
                        )
                      }
                    />

                    <textarea
                      placeholder="Optional comment"
                      rows="3"
                      value={studentUploadForms[assignment.id]?.comment || ""}
                      onChange={(e) =>
                        handleStudentCommentChange(
                          assignment.id,
                          e.target.value
                        )
                      }
                    />

                    <button onClick={() => handleSubmitAssignment(assignment.id)}>
                      {assignment.submitted ? "Resubmit" : "Submit"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default AssignmentsSection;