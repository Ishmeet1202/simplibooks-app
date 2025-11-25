import { createContext, useContext, useState } from "react";
import { axiosPrivate } from "../services/api";
import api from "../services/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [hasOrganization, setHasOrganization] = useState(false);

  // PersistentLogin controls this
  const [loading, setLoading] = useState(true); 

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.data.accessToken;
      const loggedInUser = res.data.data.user;

      setAccessToken(token);
      setUser(loggedInUser);

      axiosPrivate.defaults.headers.Authorization = `Bearer ${token}`;

      try {
        const orgRes = await axiosPrivate.get("/organizations/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasOrganization(Boolean(orgRes.data?.data));
      } catch {
        setHasOrganization(false);
      }

      return { success: true };
    } catch (error) {
      let message;
      if (!error?.response) message = "No server response";
      else if (error?.response?.status === 400) message = "Missing email or password";
      else if (error?.response?.status === 401) message = "Invalid credentials";
      else message = "Login failed";

      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post("/auth/", { name, email, password });

      const loginRes = await api.post("/auth/login", { email, password });

      const token = loginRes.data.data.accessToken;
      const loggedInUser = loginRes.data.data.user;

      setAccessToken(token);
      setUser(loggedInUser);

      axiosPrivate.defaults.headers.Authorization = `Bearer ${token}`;

      try {
        const orgRes = await axiosPrivate.get("/organizations/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasOrganization(Boolean(orgRes.data?.data));
      } catch {
        setHasOrganization(false);
      }

      return { success: true };
    } catch (error) {
      let message;
      if (!error?.response) message = "No server response";
      else if (error?.response?.status === 409) message = "User already exists";
      else message = "Registration failed";

      return { success: false, message };
    }
  };


  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      setAccessToken(null);
      setHasOrganization(false);
    }
  };

  const setOrganizationCreated = () => {
    setHasOrganization(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        hasOrganization,
        loading,
        setLoading,
        login,
        register,
        logout,

        setOrganizationCreated,
        setUser,
        setAccessToken,
        setHasOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
