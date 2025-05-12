import React from "react";

export function DashboardNavbar({ user, handleLogout }) {
  return (
    <nav className="navbar min-h-[50px] bg-base-100 w-full px-5 fixed top-0 left-0 z-10 border-b border-batik-border">
      <div className="navbar-start"></div>
      <div className="navbar-center flex items-center">
        <div className="text-sm text-batik-text font-bold uppercase tracking-widest">
          Wetonscope
        </div>
      </div>
      <div className="navbar-end">
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
