import { useState } from 'react';
import { Truck, MapPin, LayoutDashboard } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { DeliveryDashboard } from '@/components/delivery/DeliveryDashboard';

const sidebarItems = [
  { title: 'Dashboard', href: '/delivery/dashboard', icon: LayoutDashboard },
  { title: 'My Routes', href: '/delivery/routes', icon: MapPin },
  { title: 'Deliveries', href: '/delivery/deliveries', icon: Truck },
];

const DeliveryPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar items={sidebarItems} isOpen={isSidebarOpen} />
      <main className="md:pl-64 pt-16">
        <div className="container mx-auto p-6">
          <DeliveryDashboard />
        </div>
      </main>
    </div>
  );
};

export default DeliveryPage;
