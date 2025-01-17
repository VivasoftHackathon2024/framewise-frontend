import authenticatedAxios from "../config/axiosConfig";
import { SERVER_URL } from "../data/path";

export const videoApi = {
  uploadVideo: async (formData) => {
    const response = await authenticatedAxios.post(
      `${SERVER_URL}/videos/`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  analyzeVideo: async (videoId) => {
    const response = await authenticatedAxios.post(
      `${SERVER_URL}/videos/${videoId}/analyze/`
    );
    return response.data;
  },

  generateSummary: async (videoId) => {
    const response = await authenticatedAxios.post(
      `${SERVER_URL}/videos/${videoId}/summarize_agent/`
    );
    return response.data;
  },

  getAgentAnalysis: async (videoId, agentType) => {
    const response = await authenticatedAxios.post(
      `${SERVER_URL}/videos/${videoId}/${agentType}_agent/`
    );
    return response.data;
  },

  initializeChat: async (videoId) => {
    const response = await authenticatedAxios.post(
      `${SERVER_URL}/videos/${videoId}/initialize_chat_agent/`
    );
    return response.data;
  },

  getUserVideos: async (userId) => {
    const response = await authenticatedAxios.get(
      `${SERVER_URL}/users/${userId}/videos/`
    );
    return response.data;
  },

  getUserStreams: async () => {
    const response = await authenticatedAxios.get(
      `${SERVER_URL}/videos/user_streams/`
    );
    return response.data;
  },
};
