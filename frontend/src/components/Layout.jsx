import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileSidebar from "./MobileSidebar";

const Layout = () => {
  // This state controls the mobile sidebar's visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-slate-900 text-slate-50 min-h-screen">
      {/* 1. The Mobile sidebar, which is controlled by the state */}
      <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* 2. The Static sidebar for desktop (hidden on mobile) */}
      <Sidebar />

      {/* 3. The Main content area, pushed to the right on desktop */}
      <div className="lg:pl-64">
        {/* The Header receives the function to change the state */}
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* The actual page content will be rendered here */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
