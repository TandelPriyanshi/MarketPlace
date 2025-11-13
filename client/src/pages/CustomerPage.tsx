import { useState } from 'react';
import { ShoppingCart, Package, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { CustomerDashboard } from '@/components/customer/CustomerDashboard';

const sidebarItems = [
  { title: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
  { title: 'Browse Products', href: '/customer/products', icon: ShoppingCart },
  { title: 'My Orders', href: '/customer/orders', icon: Package },
  { title: 'Complaints', href: '/customer/complaints', icon: MessageSquare },
];

const CustomerPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar items={sidebarItems} isOpen={isSidebarOpen} />
      <main className="md:pl-64 pt-16">
        <div className="container mx-auto p-6">
          <CustomerDashboard />
        </div>
      </main>
    </div>
  );
};

export default CustomerPage;
