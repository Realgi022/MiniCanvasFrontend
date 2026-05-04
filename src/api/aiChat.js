import API from "./client";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getAiChat = async () => {
  return API.get("/api/ai/chat", {
    headers: getAuthHeaders(),
  });
};

export const sendAiMessage = async (message) => {
  return API.post(
    "/api/ai/chat",
    { message },
    {
      headers: getAuthHeaders(),
    }
  );
};

export const clearAiChat = async () => {
  return API.delete("/api/ai/chat", {
    headers: getAuthHeaders(),
  });
};