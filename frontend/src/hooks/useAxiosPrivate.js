import { axiosPrivate } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import useRefreshToken from "./useRefreshToken";
import { useEffect } from "react";

const useAxiosPrivate = () => {
    const { accessToken } = useAuth();
    const refresh = useRefreshToken();

    useEffect(() => {
        
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers["Authorization"]) {
                    config.headers["Authorization"] = `Bearer ${accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );
        
        
        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const previousRequest = error?.config;
                if ((error?.response?.status === 403 || error?.response?.status === 401) && !previousRequest?.send) {
                    previousRequest.send = true;
                    const newAccessToken = await refresh();
                    previousRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    return axiosPrivate(previousRequest);
                }
                return Promise.reject(error);
            }
        );

        () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }

    }, [accessToken, refresh]);

    return axiosPrivate;
}

export default useAxiosPrivate;