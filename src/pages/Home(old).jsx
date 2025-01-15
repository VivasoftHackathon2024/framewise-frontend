import React from "react";
import { Link, useNavigate } from "react-router-dom";
import authenticatedAxios   from "../config/axiosConfig";
import { SERVER_URL } from "../data/path";
import { toast } from 'react-toastify';
import { successToastConfig, errorToastConfig } from "../config/toastConfig";

export default function HomeOld() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await authenticatedAxios.post(`${SERVER_URL}/users/logout/`);

      toast.success("Logged out successfully", successToastConfig);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');

    } catch (error) {
      console.error('Logout error:', error.message);
      const errorMessage = error.response?.data?.message || "Failed to logout";
      toast.error(errorMessage, errorToastConfig);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      const response = await authenticatedAxios.post(`${SERVER_URL}/users/logout-all-devices/`);
      
      toast.success("Logged out from all devices successfully", successToastConfig);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error.message);
      const errorMessage = error.response?.data?.message || "Failed to logout";
      toast.error(errorMessage, errorToastConfig);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="text-3xl font-bold">Home Page</div>
      <div className="flex flex-col items-center justify-center gap-4 bg-gray-200 p-4 rounded-md">
      <div className="bg-gray-500 text-white px-4 py-2 rounded-md">Home</div>
      <Link to="/about" className="bg-blue-500 hover:bg-blue-700 hover:scale-105 transition-all duration-300 text-white px-4 py-2 rounded-md">About</Link>
      </div>
      <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 hover:scale-105 transition-all duration-300 text-white px-4 py-2 rounded-md mt-10">Logout</button>
      <button onClick={handleLogoutAllDevices} className="bg-red-500 hover:bg-red-700 hover:scale-105 transition-all duration-300 text-white px-4 py-2 rounded-md mt-10">Logout All Devices</button>
    </div>
  );
}
