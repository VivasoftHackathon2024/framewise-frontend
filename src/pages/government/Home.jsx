import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authenticatedAxios from "../../config/axiosConfig";
import { SERVER_URL } from "../../data/path";
import { toast } from 'react-toastify';
import { successToastConfig, errorToastConfig } from "../../config/toastConfig";
import { FiUpload, FiUsers, FiMessageCircle, FiLogOut, FiSettings, FiHome, FiUser } from 'react-icons/fi';
import { RiTeamLine, RiOrganizationChart } from 'react-icons/ri';
import { MdBusinessCenter } from 'react-icons/md';
import { AiOutlineHistory } from 'react-icons/ai';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // const { data: entities, isLoading, error } = useQuery({
  //   queryKey: ['entities', user.team],
  //   queryFn: async () => {
  //     const response = await authenticatedAxios.get(`${SERVER_URL}/entities/teams/${user.team}/details/`);
  //     console.log(response.data);
  //     return response.data;
  //   },
  //   enabled: !!user?.team,
  //   retry: false
  // });

  // if (isLoading) {
  //   // You can add a loading state here
  //   console.log('Loading entities...');
  // }

  // if (error) {
  //   // You can handle errors here
  //   console.error('Error loading entities:', error);
  // }

  const menuItems = [
    {
      title: "Upload Video",
      icon: <FiUpload className="text-2xl" />,
      description: "Upload and analyze new video footage",
      path: "/upload-video",
      color: "bg-blue-500"
    },
    {
      title: "Video Logs",
      icon: <AiOutlineHistory className="text-2xl" />,
      description: "View and chat with AI about video analysis",
      path: "/video-logs",
      color: "bg-green-500"
    },
    {
      title: "Organization",
      icon: <RiOrganizationChart className="text-2xl" />,
      description: "Manage organization structure",
      path: "/organization",
      color: "bg-purple-500"
    },
    {
      title: "Departments",
      icon: <MdBusinessCenter className="text-2xl" />,
      description: "View and manage departments",
      path: "/departments",
      color: "bg-yellow-500"
    },
    {
      title: "Teams",
      icon: <RiTeamLine className="text-2xl" />,
      description: "Team management and overview",
      path: "/teams",
      color: "bg-pink-500"
    },
    {
      title: "Users",
      icon: <FiUsers className="text-2xl" />,
      description: "User management and permissions",
      path: "/users",
      color: "bg-indigo-500"
    }
  ];

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome /> },
    { name: 'Upload', path: '/upload-video', icon: <FiUpload /> },
    { name: 'Video Logs', path: '/video-logs', icon: <AiOutlineHistory /> },
  ];

  const handleLogout = async () => {
    try {
      await authenticatedAxios.post(`${SERVER_URL}/users/logout/`);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  return (
    <div className="min-h-screen bg-gray-200">
   
      {/* Add margin to account for fixed header */}
      <div className="pt-20">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-gray-100 rounded-lg shadow-sm hover:shadow-md 
                             border border-gray-300 p-6 transition-all duration-300">
                  <div className={`inline-flex p-3 rounded-lg ${item.color} text-white mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
