import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ShoppingCart, Package, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { CustomerDashboard } from '@/components/customer/CustomerDashboard';
import { OrderHistory } from '@/components/customer/OrderHistory';
import { CustomerProductsPage } from '@/components/customer/CustomerProductsPage';
import { CustomerComplaintsPage } from '@/components/customer/CustomerComplaintsPage';

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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export { CustomerDashboard, OrderHistory, CustomerProductsPage, CustomerComplaintsPage };

export default CustomerPage;
