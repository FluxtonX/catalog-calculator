import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

// Sidebar width — must match Sidebar.jsx style={{ width: "272px" }}
const SIDEBAR_WIDTH = 272;

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar  = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* ✅ main offset matches sidebar width exactly — no gap */}
      <main
        className="flex-1 w-full min-w-0 transition-all duration-300"
        style={{
          marginLeft: isSidebarOpen ? `${SIDEBAR_WIDTH}px` : "0px",
        }}
      >
        <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* ✅ Content padding matches Header padding (px-6) */}
        <div className=" py-6">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default MainLayout;