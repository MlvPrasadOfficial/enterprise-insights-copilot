import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
});

// Function to get data cleaner results
export const getDataCleanerResults = async (sessionId = "default") => {
  try {
    const response = await api.get(`/data-cleaner-results`, {
      params: { session_id: sessionId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data cleaner results:", error);
    throw error;
  }
};
