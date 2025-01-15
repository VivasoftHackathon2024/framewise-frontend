import React from "react";
import AppRoutes from "./routes/AppRoutes";
import Navbar from './components/Home/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
