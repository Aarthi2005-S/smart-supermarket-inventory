import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar />
        <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 sm:p-6 xl:p-8">
          <div className="page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
