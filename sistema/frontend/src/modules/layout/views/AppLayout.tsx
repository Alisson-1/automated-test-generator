import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useLayout } from '../hooks/useLayout';
import { useApiStatus } from '@/modules/home/hooks/useApiStatus';

export function AppLayout() {
  const { navItems, sidebarOpen, openSidebar, closeSidebar } = useLayout();
  const { state: apiState } = useApiStatus();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        apiOnline={apiState === 'online'}
        onOpenSidebar={openSidebar}
      />

      <Sidebar
        navItems={navItems}
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <main className="pt-14 md:pl-52">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
