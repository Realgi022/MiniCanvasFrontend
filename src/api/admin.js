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

export const getAllUsers = async () => {
  const token = localStorage.getItem("token");

  return API.get("/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateUserRole = async (id, role) => {
  const token = localStorage.getItem("token");

  return API.put(
    `/admin/users/${id}/role`,
    { role },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};