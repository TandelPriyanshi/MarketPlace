import { useState, useEffect } from 'react';
import { DeliveryRouteTable } from './DeliveryRouteTable';
import { getAssignedDeliveries, Delivery } from '@/api/delivery.api';
import { toast } from 'sonner';

export const DeliveryRoutesPage = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await getAssignedDeliveries();
      setDeliveries(response.data.deliveries);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <DeliveryRouteTable 
      deliveries={deliveries} 
      onDeliveryUpdate={fetchDeliveries}
    />
  );
};

export const DeliveryDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await getAssignedDeliveries();
      setDeliveries(response.data.deliveries);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <DeliveryRouteTable 
      deliveries={deliveries} 
      onDeliveryUpdate={fetchDeliveries}
    />
  );
};
