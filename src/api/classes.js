import API from "./client";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMyClasses = async () => {
  return API.get("/classes/my", authHeaders());
};

export const getAllClasses = async () => {
  return API.get("/classes", authHeaders());
};

export const getClassMembers = async (classId) => {
  return API.get(`/classes/${classId}/members`, authHeaders());
};

export const getAssignableUsers = async () => {
  return API.get("/classes/users", authHeaders());
};

export const assignUserToClass = async (assignData) => {
  return API.post("/classes/assign", assignData, authHeaders());
};

export const removeUserFromClass = async (classId, userId) => {
  return API.delete(`/classes/${classId}/members/${userId}`, authHeaders());
};