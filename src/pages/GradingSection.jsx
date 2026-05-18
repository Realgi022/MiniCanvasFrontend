import { useEffect, useState } from "react";
import { getAllClasses } from "../api/classes";
import {
  getAssignmentsForClass,
  getSubmissionsForAssignment,
  gradeSubmission,
} from "../api/assignments";
import { getMyGrades } from "../api/grades";

function GradingSection({ isTeacher }) {
  const [message, setMessage] = useState("");

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");

  const [submissions, setSubmissions] = useState([]);
  const [gradeForms, setGradeForms] = useState({});

  const [myGrades, setMyGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTeacher) {
      loadTeacherData();
    } else {
      loadStudentGrades();
    }
  }, [isTeacher]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);

      const classesResponse = await getAllClasses();
      setClasses(classesResponse.data);

      if (classesResponse.data.length > 0) {
        const firstClassId = classesResponse.data[0].id;
        setSelectedClassId(firstClassId);

        const assignmentsResponse = await getAssignmentsForClass(firstClassId);
        setAssignments(assignmentsResponse.data);

        if (assignmentsResponse.data.length > 0) {
          const firstAssignmentId = assignmentsResponse.data[0].id;
          setSelectedAssignmentId(firstAssignmentId);
          await loadSubmissions(firstAssignmentId);
        }
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to load grading data");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentGrades = async () => {
    try {
      setLoading(true);

      const response = await getMyGrades();
      setMyGrades(response.data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId) => {
    try {
      const response = await getSubmissionsForAssignment(assignmentId);
      setSubmissions(response.data);

      const initialForms = {};

      response.data.forEach((submission) => {
        initialForms[submission.id] = {
          grade: submission.grade ?? "",
          feedback: submission.feedback ?? "",
        };
      });

      setGradeForms(initialForms);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to load submissions");
    }
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;

    setSelectedClassId(classId);
    setSelectedAssignmentId("");
    setSubmissions([]);

    try {
      setLoading(true);

      const response = await getAssignmentsForClass(classId);
      setAssignments(response.data);

      if (response.data.length > 0) {
        const firstAssignmentId = response.data[0].id;
        setSelectedAssignmentId(firstAssignmentId);
        await loadSubmissions(firstAssignmentId);
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = async (e) => {
    const assignmentId = e.target.value;

    setSelectedAssignmentId(assignmentId);
    await loadSubmissions(assignmentId);
  };

  const handleGradeFormChange = (submissionId, field, value) => {
    setGradeForms((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = async (submissionId) => {
    const form = gradeForms[submissionId];

    if (!form?.grade && form?.grade !== 0) {
      setMessage("Grade is required");
      return;
    }

    try {
      await gradeSubmission(submissionId, {
        grade: Number(form.grade),
        feedback: form.feedback,
      });

      setMessage("Grade saved successfully");

      if (selectedAssignmentId) {
        await loadSubmissions(selectedAssignmentId);
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Failed to save grade");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleString();
  };

  return (
    <>
      <h3>Grading</h3>

      {message && <p className="student-error">{message}</p>}

      {loading ? (
        <p>Loading grading data...</p>
      ) : isTeacher ? (
        <>
          <p>Select a class and assignment, then grade student submissions.</p>

          <div className="grading-controls">
            <div className="grading-control-box">
              <label>Class</label>
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

            <div className="grading-control-box">
              <label>Assignment</label>
              <select
                value={selectedAssignmentId}
                onChange={handleAssignmentChange}
              >
                {assignments.length === 0 ? (
                  <option value="">No assignments found</option>
                ) : (
                  assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {submissions.length === 0 ? (
            <p>No submissions found for this assignment.</p>
          ) : (
            <div className="grading-table-wrapper">
              <table className="grading-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Submitted at</th>
                    <th>Grade</th>
                    <th>Feedback</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>{submission.studentName || "No name"}</td>
                      <td>{submission.studentEmail}</td>
                      <td>{formatDate(submission.submittedAt)}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={gradeForms[submission.id]?.grade ?? ""}
                          onChange={(e) =>
                            handleGradeFormChange(
                              submission.id,
                              "grade",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <textarea
                          rows="2"
                          value={gradeForms[submission.id]?.feedback ?? ""}
                          onChange={(e) =>
                            handleGradeFormChange(
                              submission.id,
                              "feedback",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        {submission.grade !== null && submission.grade !== undefined
                          ? "Graded"
                          : "Not graded"}
                      </td>
                      <td>
                        <button onClick={() => handleSaveGrade(submission.id)}>
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <p>Here you can see your grades and teacher feedback.</p>

          {myGrades.length === 0 ? (
            <p>No grades yet.</p>
          ) : (
            <div className="grading-table-wrapper">
              <table className="grading-table">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Class</th>
                    <th>Submitted at</th>
                    <th>Grade</th>
                    <th>Feedback</th>
                    <th>Graded at</th>
                    <th>Teacher</th>
                  </tr>
                </thead>

                <tbody>
                  {myGrades.map((grade) => (
                    <tr key={grade.submissionId}>
                      <td>{grade.assignmentTitle}</td>
                      <td>{grade.className}</td>
                      <td>{formatDate(grade.submittedAt)}</td>
                      <td>
                        {grade.grade !== null && grade.grade !== undefined
                          ? grade.grade
                          : "Not graded yet"}
                      </td>
                      <td>{grade.feedback || "-"}</td>
                      <td>{formatDate(grade.gradedAt)}</td>
                      <td>{grade.gradedByName || grade.gradedByEmail || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default GradingSection;