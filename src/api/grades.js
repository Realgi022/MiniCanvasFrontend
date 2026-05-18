import API from "./client";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMyGrades = async () => {
  return API.get("/grades/my", authHeaders());
};