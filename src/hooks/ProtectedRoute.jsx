import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useRef } from "react";
import { SERVER_URL } from "../data/path";
import axios from "axios";
import Spinner from "../components/Spinner";
import { useQuery } from "@tanstack/react-query";
import { errorToastConfig } from "../config/toastConfig";


const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const toastShownRef = useRef(false);

  const { isLoading, isError } = useQuery({
    queryKey: ['verify-token', token],
    queryFn: async () => {
      if (!token) throw new Error('No token');
      
      const response = await axios.post(`${SERVER_URL}/users/verify-token/`, {
        token
      });
      
      if (response.status !== 200) {
        throw new Error('Token invalid');
      }
      
      return response.data;
    },
    retry: false,
    onError: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("Session expired. Please login again.", errorToastConfig);
    },
    enabled: !!token
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (!token || isError) {
    if (!toastShownRef.current) {
      toast.error("Please login to continue", errorToastConfig);
      toastShownRef.current = true;
    }
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  toastShownRef.current = false;
  return children;
};

export default ProtectedRoute;
