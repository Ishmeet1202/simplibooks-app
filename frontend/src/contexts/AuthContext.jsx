import { createContext, useContext, useState } from "react";
import api from "../services/api";
import { axiosPrivate } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasOrganization, setHasOrganization] = useState(false);

  const login = async (email, password) => {
    try {
      // Use the public API for login
      const response = await api.post("/auth/login", { email, password });

      const { accessToken: token, user: loggedInUser } = response.data.data;

      setAccessToken(token); // Store token in-memory
      setUser(loggedInUser);

      // --- THIS IS THE FIX ---
      // We must check for an organization *after* getting the token.
      // To solve the race condition, we manually attach the new token
      // to this one specific request.
      try {
        await axiosPrivate.get("/organizations/mine", {
          headers: { Authorization: `Bearer ${token}` }, // Manually inject the new token
        });
        // If the request succeeds (doesn't throw 404), they have an org
        setHasOrganization(true);
      } catch (orgError) {
        // If it throws an error (like 404 Not Found), they don't have an org
        setHasOrganization(false);
      }

      return { success: true };
    } catch (error) {
      // This block catches errors from the LOGIN request itself
      let message;
      if (!error?.response) {
        message = "No server response";
      } else if (error?.response?.status === 400) {
        message = "Missing email or password";
      } else if (error?.response?.status === 401) {
        message = "Invalid credentials";
      } else {
        message = "Login failed";
      }
      return {
        success: false,
        message: message,
      };
    } finally {
      setLoading(false); // Set loading to false when login attempt is finished
    }
  };

  const register = async (name, email, password) => {
    try {
      // Use public API for register
      await api.post("/auth/", { name, email, password });
      return { success: true };
    } catch (error) {
      let message;
      if (!error?.response) {
        message = "No server response";
      } else if (error?.response?.status === 409) {
        message = "User already existed with this email";
      } else {
        message = "Registration failed";
      }
      return {
        success: false,
        message: message,
      };
    }
  };

  const logout = async () => {
    try {
      // Use public API for logout
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all frontend state
      setUser(null);
      setAccessToken(null);
      setHasOrganization(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const setOrganizationCreated = () => {
    setHasOrganization(true);
  };

  const value = {
    user,
    setUser,
    accessToken, // Expose for useAxiosPrivate
    setAccessToken, // Expose for useRefreshToken
    loading,
    setLoading,
    hasOrganization,
    setHasOrganization,
    login,
    register,
    logout,
    updateUser,
    setOrganizationCreated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
