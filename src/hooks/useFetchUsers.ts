import { useQuery } from "@tanstack/react-query";

import { DefaultService } from "@/services/api";

export const useFetchUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await DefaultService.getApiUsers();

      if (error) {
        throw error;
      }

      return data;
    },
    select(data) {
      const users = data.users;

      if (users) {
        return Object.keys(users).map((key) => ({
          ...users[key],
          id: key,
        }));
      }

      return [];
    },
  });
};
