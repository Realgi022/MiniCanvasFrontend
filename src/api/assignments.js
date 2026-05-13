import API from "./client";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const createAssignment = async (assignmentData) => {
  return API.post("/assignments", assignmentData, authHeaders());
};

export const updateAssignment = async (assignmentId, assignmentData) => {
  return API.put(`/assignments/${assignmentId}`, assignmentData, authHeaders());
};

export const deleteAssignment = async (assignmentId) => {
  return API.delete(`/assignments/${assignmentId}`, authHeaders());
};

export const getAssignmentsForClass = async (classId) => {
  return API.get(`/assignments/class/${classId}`, authHeaders());
};

export const getMyAssignments = async () => {
  return API.get("/assignments/my", authHeaders());
};

export const submitAssignment = async (assignmentId, file, comment) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("comment", comment || "");

  return API.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getSubmissionsForAssignment = async (assignmentId, studentName = "") => {
  return API.get(`/assignments/${assignmentId}/submissions`, {
    ...authHeaders(),
    params: {
      studentName,
    },
  });
};

export const getSubmissionPreviewBlob = async (submissionId) => {
  const token = localStorage.getItem("token");

  return API.get(`/assignments/submissions/${submissionId}/preview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });
};

export const getSubmissionDownloadBlob = async (submissionId) => {
  const token = localStorage.getItem("token");

  return API.get(`/assignments/submissions/${submissionId}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });
};