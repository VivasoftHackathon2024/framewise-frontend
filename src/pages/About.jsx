import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="text-3xl font-bold">About Page</div>
      <div className="flex flex-col items-center justify-center gap-4 bg-gray-200 p-4 rounded-md">
        <Link
          to="/home"
          className="bg-blue-500 hover:bg-blue-700 hover:scale-105 transition-all duration-300 text-white px-4 py-2 rounded-md"
        >
          Home
        </Link>
        <div className="bg-gray-500 text-white px-4 py-2 rounded-md">About</div>
      </div>
    </div>
  );
}
