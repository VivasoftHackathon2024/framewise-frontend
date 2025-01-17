import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiUpload, FiLogOut, FiHome, FiUser, FiVideo } from 'react-icons/fi';
import { AiOutlineHistory } from 'react-icons/ai';
import { toast } from 'react-toastify';
import authenticatedAxios from "../../config/axiosConfig";
import { SERVER_URL } from "../../data/path";
import { successToastConfig, errorToastConfig } from "../../config/toastConfig";

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileDropdownOpen]);

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedUser = JSON.parse(localStorage.getItem('user')) || {};
            setUser(updatedUser);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdated', handleStorageChange);
        };
    }, []);

    if (isAuthPage) {
        return (
            <header className="bg-gray-100 shadow-sm fixed w-full top-0 z-50 border-b border-gray-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-blue-600">
                            FrameWise
                        </h1>
                        <nav className="flex items-center space-x-4">
                            {location.pathname === '/login' ? (
                                <Link
                                    to="/register"
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Create Account
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Sign In
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
        );
    }

    const getNavItems = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return [];
        
        switch (user.user_type) {
            case 'government':
                return [
                    { name: 'Dashboard', path: '/government/home', icon: <FiHome className="text-lg" /> },
                    { name: 'Upload', path: '/government/upload-video', icon: <FiUpload className="text-lg" /> },
                    { name: 'Video Logs', path: '/government/video-logs', icon: <AiOutlineHistory className="text-lg" /> },
                    { name: 'Stream', path: '/government/stream-analysis', icon: <FiVideo className="text-lg" /> },
                ];
            case 'company':
                return [
                    { name: 'Dashboard', path: '/company/home', icon: <FiHome className="text-lg" /> },
                    { name: 'Upload', path: '/company/upload-video', icon: <FiUpload className="text-lg" /> },
                    { name: 'Video Logs', path: '/company/video-logs', icon: <AiOutlineHistory className="text-lg" /> },
                    { name: 'Stream', path: '/company/stream-analysis', icon: <FiVideo className="text-lg" /> },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

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

    const getProfilePath = () => {
        const userType = user.user_type;
        switch (userType) {
            case 'government':
                return '/government/profile';
            case 'company':
                return '/company/profile';
            default:
                return '/login';
        }
    };

    return (
        <header className="bg-gray-100 shadow-sm fixed w-full top-0 z-50 border-b border-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-2xl font-bold text-blue-600">
                            FrameWise
                        </h1>
                        
                        <nav className="hidden md:flex items-center space-x-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium
                                            transition-colors duration-200
                                            ${location.pathname === item.path 
                                                ? 'text-blue-600 bg-blue-50' 
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="relative profile-dropdown">
                        <button
                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            className="flex items-center space-x-3 focus:outline-none group 
                                     bg-gray-200 hover:bg-gray-300 rounded-full px-4 py-2 
                                     transition-all duration-200"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative transform transition-transform duration-200">
                                    <img
                                        src={user.profile_picture_link || "https://via.placeholder.com/40"}
                                        alt="Profile"
                                        className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-300 
                                                 group-hover:ring-blue-300 transition-all duration-200"
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium text-gray-800">
                                        {user.username}
                                    </span>
                                </div>
                            </div>
                        </button>

                        {isProfileDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-gray-100 rounded-xl shadow-lg py-1 z-10
                                          border border-gray-300 transform transition-all duration-200 ease-out">
                                <div className="px-4 py-3 border-b border-gray-300">
                                    <p className="text-sm font-medium text-gray-800">{user.username}</p>
                                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        navigate(getProfilePath());
                                        setIsProfileDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 
                                              flex items-center transition-colors duration-150"
                                >
                                    <FiUser className="mr-3 text-gray-500" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsProfileDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 
                                              flex items-center transition-colors duration-150"
                                >
                                    <FiLogOut className="mr-3" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
} 