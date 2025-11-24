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

      try {
        await axiosPrivate.get("/organizations/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasOrganization(true);
      } catch (orgError) {
        setHasOrganization(false);
      }

      return { success: true };
    } catch (error) {
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
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
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
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
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
    accessToken,
    setAccessToken, 
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
