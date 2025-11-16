import { useQuery } from '@tanstack/react-query';
import { getSalesmanBeats, SalesmanBeat } from '@/api/salesman.api';

export const useSalesmanBeats = () => {
  return useQuery<{
    success: boolean;
    data: SalesmanBeat[];
  }>({
    queryKey: ['salesman-beats'],
    queryFn: getSalesmanBeats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
};