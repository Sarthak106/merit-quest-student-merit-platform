import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Particles from './ui/Particles';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-dark-950 relative">
      <Particles count={20} />
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
