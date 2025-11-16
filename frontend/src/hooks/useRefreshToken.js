import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const useRefreshToken = () => {
  const { setAccessToken, setUser, setHasOrganization } = useAuth();

  const refresh = async () => {
    const response = await api.post("/auth/refresh");
    setAccessToken(response.data.data.accessToken);
    setUser(response.data.data.user);
    setHasOrganization(response.data.data.hasOrg);
    return response.data.data.accessToken;
  };

  return refresh;
};

export default useRefreshToken;
