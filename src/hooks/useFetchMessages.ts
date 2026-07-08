import { toast } from "sonner";
import { DefaultService } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useFetchMessages = () => {
  return useQuery({
    queryKey: ["strikes"],
    queryFn: async () => {
      const { data, error } = await DefaultService.getApiStrikes();

      if (error) {
        throw error;
      }

      return data;
    },
    select: (data) => data.strikes ?? [],
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteMessage"],
    mutationFn: async (id: number) => {
      const { data, error } = await DefaultService.deleteApiStrikesByStrikeId({
        path: { strike_id: id },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    async onSuccess() {
      toast.success("Message removed from queue");
      await queryClient.invalidateQueries({ queryKey: ["strikes"] });
    },
  });
};
