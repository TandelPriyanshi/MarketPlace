import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MapPin, Store, LayoutDashboard, TrendingUp, Calendar, FileText } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { SalesmanDashboard } from '@/components/salesman/SalesmanDashboard';
import { SalesmanBeatsPage, SalesmanAttendancePage, SalesmanVisitsPage, SalesmanOrdersPage, SalesmanPerformancePage } from '@/components/salesman/SalesmanWrapperPages';

const sidebarItems = [
  { title: 'Dashboard', href: '/salesman/dashboard', icon: LayoutDashboard },
  { title: 'My Beats', href: '/salesman/beats', icon: MapPin },
  { title: 'Attendance', href: '/salesman/attendance', icon: Calendar },
  { title: 'Store Visits', href: '/salesman/visits', icon: Store },
  { title: 'Sales Orders', href: '/salesman/orders', icon: FileText },
  { title: 'Performance', href: '/salesman/performance', icon: TrendingUp },
];

const SalesmanPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar items={sidebarItems} isOpen={isSidebarOpen} />
      <main className="md:pl-64 pt-16">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export { SalesmanDashboard, SalesmanBeatsPage, SalesmanAttendancePage, SalesmanVisitsPage, SalesmanOrdersPage, SalesmanPerformancePage };

export default SalesmanPage;
