import { useQuery } from '@tanstack/react-query';
import { getSalesmanPerformance, SalesmanPerformance } from '@/api/salesman.api';

export const useSalesmanPerformance = (params?: {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly';
}) => {
  return useQuery<{
    success: boolean;
    data: SalesmanPerformance;
  }>({
    queryKey: ['salesman-performance', params],
    queryFn: () => getSalesmanPerformance(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
};