import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import useRefreshToken from "../hooks/useRefreshToken";
import { useAuth } from "../contexts/AuthContext";
import { Outlet } from "react-router-dom";

const PersistentLogin = () => {
  const refresh = useRefreshToken();
  const { accessToken, loading, setLoading } = useAuth();

  useEffect(() => {
    const verifyRefresh = async () => {
      try {
        await refresh();
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!accessToken) {
      (async () => await verifyRefresh())();
    } else {
      setLoading(false);
    }
  }, [refresh, accessToken, setLoading]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  return <Outlet />;
};

export default PersistentLogin;
