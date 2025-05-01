import React from "react";

export function DashboardNavbar({ user, handleLogout }) {
  return (
    <nav className="bg-batik w-full px-4 py-2 fixed top-0 left-0 z-10 border-b border-batik-border">
      <div className="flex items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-center w-full text-batik-black">
          Wetonscope
        </h1>
        <div className="text-center sm:text-right text-xs sm:text-sm">
          <span className="block sm:inline mr-0 sm:mr-4 mb-1 sm:mb-0 text-gray-600">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
