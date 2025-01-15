import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaBuilding, FaUsers, FaFlask, FaCalendar, FaClock, FaEnvelope, FaPhone, FaEdit, FaTimes } from 'react-icons/fa';
import { SERVER_URL } from "../data/path";
import authenticatedAxios from '../config/axiosConfig';
import Spinner from '../components/Spinner';

export default function Profile() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || ''
    });
    const [selectedImage, setSelectedImage] = useState(null);

    const { data: entities, isLoading, error } = useQuery({
      queryKey: ['entities', user.team],
      queryFn: async () => {
        const response = await authenticatedAxios.get(`${SERVER_URL}/entities/teams/${user.team}/details/`);
        console.log(response.data);
        return response.data;
      },
      enabled: !!user?.team,
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (formData) => {
            console.log('Starting mutation...');
            const response = await authenticatedAxios.put(`${SERVER_URL}/users/update/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        },
        onMutate: () => {
            console.log('Mutation starting...');
        },
        onSuccess: (data) => {
            console.log('Mutation successful!');
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            setIsEditing(false);
            queryClient.invalidateQueries(['entities']);
            window.dispatchEvent(new Event('userUpdated'));
        },
        onError: (error) => {
            console.error('Mutation error:', error);
        }
    });

    console.log('Mutation state:', {
        isLoading: updateProfileMutation.isPending,
        status: updateProfileMutation.status
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted, preparing data...');
        const formData = new FormData();
        Object.keys(editForm).forEach(key => {
            formData.append(key, editForm[key]);
        });
        if (selectedImage) {
            formData.append('profile_picture', selectedImage);
        }
        console.log('Calling mutation...');
        updateProfileMutation.mutate(formData);
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    if (isLoading) return <Spinner />;

    if (error) return (
        <div className="text-red-500 text-center p-4">
            Error loading profile data
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            {entities && (
                <div className="space-y-6">
                    {/* Main Profile Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Hero Section with darker overlay */}
                        <div className="relative h-64">
                            <img 
                                src={entities.image_link} 
                                alt={entities.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
                        </div>

                        {/* Profile Content */}
                        <div className="p-8 -mt-20 relative">
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    {isEditing ? (
                                        <><FaTimes /> Cancel</>
                                    ) : (
                                        <><FaEdit /> Edit Profile</>
                                    )}
                                </button>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex flex-col items-center">
                                            <img 
                                                src={selectedImage ? URL.createObjectURL(selectedImage) : (user.profile_picture_link || entities.image_link)}
                                                alt="Profile"
                                                className="w-32 h-32 rounded-xl shadow-lg border-4 border-white object-cover"
                                            />
                                            <input
                                                type="file"
                                                accept="image/jpg,image/jpeg,image/png"
                                                onChange={handleImageChange}
                                                className="mt-2 text-sm"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.username}
                                                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Bio</label>
                                                <textarea
                                                    value={editForm.bio}
                                                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                                    rows={3}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                                    placeholder="Tell us about yourself..."
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all
                                                    ${updateProfileMutation.isPending 
                                                        ? 'bg-blue-400 cursor-not-allowed' 
                                                        : 'bg-blue-500 hover:bg-blue-600'} 
                                                    text-white`}
                                                disabled={updateProfileMutation.isPending}
                                            >
                                                {updateProfileMutation.isPending ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span>Saving...</span>
                                                    </>
                                                ) : (
                                                    'Save Changes'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <img 
                                        src={user.profile_picture_link || entities.image_link}
                                        alt={user.username || entities.name}
                                        className="w-32 h-32 rounded-xl shadow-lg border-4 border-white object-cover"
                                    />
                                    <div className="flex-1 mt-4 md:mt-0">
                                        <h1 className="text-3xl font-bold text-gray-800">{user.username || "Team Member"}</h1>
                                        <p className="text-lg text-blue-600 font-medium">{entities.name}</p>
                                        {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
                                        
                                        {/* Contact Info */}
                                        <div className="mt-4 space-y-2">
                                            {user.email && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <FaEnvelope className="text-blue-500" />
                                                    <span>{user.email}</span>
                                                </div>
                                            )}
                                            {user.phone && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <FaPhone className="text-blue-500" />
                                                    <span>{user.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <FaBuilding className="text-blue-500 text-2xl" />
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Organization</h3>
                                            <p className="text-gray-600">{entities.organization_details.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">{entities.organization_details.description}</p>
                                        </div>
                                    </div>
                                </div>


                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <FaFlask className="text-blue-500 text-2xl" />
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Department</h3>
                                            <p className="text-gray-600">{entities.department_details.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">{entities.department_details.description}</p>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <FaCalendar className="text-blue-500 text-2xl" />
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Member Since</h3>
                                            <p className="text-gray-600">
                                                {new Date(entities.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Team Activity</h2>
                        <div className="flex items-center gap-3 text-gray-600">
                            <FaClock className="text-blue-500" />
                            <span>Last active: {new Date(entities.updated_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
