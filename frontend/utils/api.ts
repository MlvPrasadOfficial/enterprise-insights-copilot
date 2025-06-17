import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
});

// Function to get data cleaner results
export const getDataCleanerResults = async (sessionId = "default") => {
  try {
    console.log(`Fetching data cleaner results with session_id=${sessionId}...`);
    
    const start = performance.now();
    const response = await api.get(`/data-cleaner-results`, {
      params: { session_id: sessionId },
    });
    const end = performance.now();
    
    console.log(`Data cleaner results fetched in ${(end-start).toFixed(2)}ms. Response:`, {
      status: response.status,
      hasOperations: !!response.data?.operations,
      operationsCount: response.data?.operations?.length || 0,
      hasStats: !!response.data?.cleaning_stats,
      hasDetailedResults: !!response.data?.detailed_results
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching data cleaner results:", error);
    throw error;
  }
};
