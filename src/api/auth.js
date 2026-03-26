import API from "./client";

export const loginUser = async (credentials) => {
  return API.post("/auth/login", credentials);
};

export const registerUser = async (userData) => {
  return API.post("/auth/register", userData);
};

export const getMe = async (token) => {
  return API.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};