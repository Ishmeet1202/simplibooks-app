import { axiosPrivate } from "../services/api";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const useRefreshToken = () => {
  const { setAccessToken, setUser, setHasOrganization } = useAuth();

  const refresh = async () => {
    const response = await api.post("/auth/refresh");

    const token = response.data.data.accessToken;
    const user = response.data.data.user;

    setAccessToken(token);
    setUser(user);

    try {
      const orgRes = await axiosPrivate.get("/organizations/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const org = orgRes.data?.data;
      setHasOrganization(Boolean(org));
    } catch (err) {
      if (err?.response?.status === 404) {
        setHasOrganization(false);
      } else {
        console.error("Org fetch during refresh:", err);
        setHasOrganization(false);
      }
    }

    return token;
  };

  return refresh;
};

export default useRefreshToken;
