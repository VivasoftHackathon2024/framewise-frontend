import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "../hooks/ProtectedRoute";

import GovernmentHome from "../pages/government/Home";
import GovernmentProfile from "../pages/government/Profile";
import GovernmentUploadVideo from "../pages/government/UploadVideo";
import GovernmentVideoLogs from "../pages/government/VideoLogs";

import CompanyHome from "../pages/company/Home";
import CompanyProfile from "../pages/company/Profile";
import CompanyUploadVideo from "../pages/company/UploadVideo";
import CompanyVideoLogs from "../pages/company/VideoLogs";

// Define routes for different user types
const governmentRoutes = [
  { path: "/government/home", element: <GovernmentHome /> },
  { path: "/government/profile", element: <GovernmentProfile /> },
  { path: "/government/upload-video", element: <GovernmentUploadVideo /> },
  { path: "/government/video-logs", element: <GovernmentVideoLogs /> },
];

const companyRoutes = [
  { path: "/company/home", element: <CompanyHome /> },
  { path: "/company/profile", element: <CompanyProfile /> },
  { path: "/company/upload-video", element: <CompanyUploadVideo /> },
  { path: "/company/video-logs", element: <CompanyVideoLogs /> },
];

// Root redirects based on user type
const getRootRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  switch (user.user_type) {
    case 'government':
      return '/government/home';
    case 'company':
      return '/company/home';
    default:
      return '/login';
  }
};

// Define public routes
const publicRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/", element: <Navigate to={getRootRedirect()} /> },
];

export default function AppRoutes() {
  return (
    <Routes>
      {/* Map government routes */}
      {governmentRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<ProtectedRoute userType="government">{element}</ProtectedRoute>}
        />
      ))}

      {/* Map company routes */}
      {companyRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<ProtectedRoute userType="company">{element}</ProtectedRoute>}
        />
      ))}

      {/* Map public routes */}
      {publicRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
}
