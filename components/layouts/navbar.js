import React from "react";

export function Navbar({ title }) {
  return (
    <nav className="navbar min-h-[50px] bg-base-100 w-full px-5 fixed top-0 left-0 z-50 border-b border-batik-border">
      <div className="navbar-start"></div>
      <div className="navbar-center flex items-center">
        <div className="text-sm text-batik-text font-bold uppercase tracking-widest">
          {title}
        </div>
      </div>
      <div className="navbar-end"></div>
    </nav>
  );
}
