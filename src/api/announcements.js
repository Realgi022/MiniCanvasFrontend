import API from "./client";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAnnouncements = async () => {
  return API.get("/announcements", authHeaders());
};

export const createAnnouncement = async (announcementData) => {
  return API.post("/announcements", announcementData, authHeaders());
};

export const updateAnnouncement = async (id, announcementData) => {
  return API.put(`/announcements/${id}`, announcementData, authHeaders());
};

export const deleteAnnouncement = async (id) => {
  return API.delete(`/announcements/${id}`, authHeaders());
};