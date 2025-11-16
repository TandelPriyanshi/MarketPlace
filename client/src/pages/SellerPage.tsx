import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Package, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { SellerDashboard } from '@/components/seller/SellerDashboard';
import { ProductTable } from '@/components/seller/ProductTable';

export const sidebarItems = [
  { title: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
  { title: 'Products', href: '/seller/products', icon: Package },
  { title: 'Orders', href: '/seller/orders', icon: ShoppingCart },
];

const SellerPage = () => {
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

export { SellerDashboard, ProductTable };

export default SellerPage;
