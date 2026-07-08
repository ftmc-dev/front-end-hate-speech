import { toast } from "sonner";
import { DefaultService } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Status = "active" | "warned" | "suspended" | "banned";

export const useUserAccess = (id: string) => {
  const queryClient = useQueryClient();

  const request = useMutation({
    mutationKey: ["updateUserStatus"],
    mutationFn: async (status: Status) => {
      const { data, error } = await DefaultService.putApiUsersByUserIdStatus({
        body: { status },
        path: { user_id: id },
      });

      if (error) {
        throw error;
      }

      return data;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const banUser = async (username?: string) => {
    try {
      await request.mutateAsync("banned");
      toast.success(`Banned ${username}`);
    } catch (error) {
      console.log(error);
    }
  };

  const activateUser = async (username?: string) => {
    try {
      await request.mutateAsync("active");
      toast.success(`Unbanned ${username}`);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    banUser,
    activateUser,
  };
};
