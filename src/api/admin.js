import API from "./client";

export const createUser = async (userData) => {
  const token = localStorage.getItem("token");

  return API.post("/admin/users", userData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};