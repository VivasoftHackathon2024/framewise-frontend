import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import ProtectedRoute from "../hooks/ProtectedRoute";
import UploadVideo from "../pages/UploadVideo";
import VideoLogs from "../pages/VideoLogs";

// Define which routes need protection
const protectedRoutes = [
  { path: "/home", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/", element: <Navigate to="/home" /> },
  { path: "/profile", element: <Profile /> },
  { path: "/upload-video", element: <UploadVideo /> },
  { path: "/video-logs", element: <VideoLogs /> },
];

// Define public routes
const publicRoutes = [
  { path: "/login", element: <Login /> },
];

export default function AppRoutes() {
  return (
      <Routes>
        {/* Map protected routes */}
        {protectedRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute>{element}</ProtectedRoute>}
          />
        ))}

        {/* Map public routes */}
        {publicRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
  );
}
