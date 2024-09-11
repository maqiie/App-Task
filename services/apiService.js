import { Platform } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Determine the base URL depending on the platform
const baseURL = Platform.OS === "android"
  ? "http://10.0.2.2:3001" // Android emulator
  : "http://localhost:3001"; // Web and iOS simulators

// Create an Axios instance
const apiClient = axios.create({
  baseURL, // Use the platform-specific baseURL
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
  },
});

// Add a request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Retrieve the auth token from AsyncStorage
      const authToken = await AsyncStorage.getItem("authToken");
      if (authToken) {
        // Add the token to the request headers
        config.headers.Authorization = `Bearer ${authToken}`;
      }
    } catch (error) {
      console.error("Error fetching auth token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
