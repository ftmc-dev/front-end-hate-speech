import { useQuery } from "@tanstack/react-query";
import { DefaultService } from "@/services/api";

export const useStatistics = () => {
  return useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      const { data, error } = await DefaultService.getApiStats();

      if (error) {
        throw error;
      }

      return data;
    },
    select(data) {
      return {
        low: data.low ?? 0,
        high: data.high ?? 0,
        medium: data.medium ?? 0,
        pending: data.pending ?? 0,
        reviewed: data.reviewed ?? 0,
        total_users: data.total_users ?? 0,
        total_strikes: data.total_strikes ?? 0,
      };
    },
  });
};
