import { useQuery, useMutation } from "@tanstack/vue-query";
import { useToast } from "~/components/ui/toast";

const { toast } = useToast();

export const usePostSetDaily = (imageId: Ref<string | undefined>) => {

  const { mutate: setDaily, isPending: isSettingDaily } = useMutation({
    mutationFn: async (payload: any) => {
      return await $fetch(`/api/plummy/home/main/dailies/${imageId.value}/daily`, {
        method: 'PATCH',
        body: payload
      })
    },
    onSuccess: async () => {
      toast({
        title: 'Daily Set',
        description: 'Your daily has been set successfully.',
      })
    },
    onError: async(error:any) => {
      // Handle validation errors
      if (error.data?.data?.errors) {
        console.error('Validation errors:', error.data.data.errors);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: Object.values(error.data.data.errors)[0] as string || 'Failed to create like',
        });
      } else {
        // Handle generic errors
        console.error('Like creation error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again later.',
        });
      }
    }
  });

  return {
    setDaily,
    isSettingDaily
  }
  
}

export const usePostClearDaily = (imageId: Ref<string | undefined>) => {

  const { mutate: clearDaily, isPending: isClearingDaily } = useMutation({
    mutationFn: async (payload: any) => {
      return await $fetch(`/api/plummy/home/main/dailies/${imageId.value}/daily`, {
        method: 'PATCH',
        body: payload
      })
    },
    onSuccess: async () => {
      toast({
        title: 'Daily Cleared',
        description: 'Your daily has been cleared successfully.',
      })
    },
    onError: async(error:any) => {
      // Handle validation errors
      if (error.data?.data?.errors) {
        console.error('Validation errors:', error.data.data.errors);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: Object.values(error.data.data.errors)[0] as string || 'Failed to create like',
        });
      } else {
        // Handle generic errors
        console.error('Like creation error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again later.',
        });
      }
    }
  });

  return {
    clearDaily,
    isClearingDaily
  }
  
}