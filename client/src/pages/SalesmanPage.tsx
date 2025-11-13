import { useState } from 'react';
import { MapPin, Store, LayoutDashboard, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { SalesmanDashboard } from '@/components/salesman/SalesmanDashboard';

const sidebarItems = [
  { title: 'Dashboard', href: '/salesman/dashboard', icon: LayoutDashboard },
  { title: 'My Beats', href: '/salesman/beats', icon: MapPin },
  { title: 'Stores', href: '/salesman/stores', icon: Store },
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
          <SalesmanDashboard />
        </div>
      </main>
    </div>
  );
};

export default SalesmanPage;
