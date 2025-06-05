import { useQuery, useMutation } from "@tanstack/vue-query";
import { useToast } from "~/components/ui/toast";

const { toast } = useToast();

interface DailyResponse {
  dailyUrl: string | null;
  avatarUrl: string | null;
}

export const useUserFeaturedDaily = () => {
  const { data, isLoading, error, refetch } = useQuery<DailyResponse>({
    queryKey: ['user-daily-featured'],
    queryFn: async () => {
      const response = await $fetch<DailyResponse>('/api/plummy/home/main/dailyUserFeatured', {
        method:'GET'
      })
      return response || null;
    }
  });

  const featuredDaily = computed(() => data.value || null);

  return {
    featuredDaily,
    isLoading,
    error,
    refetch
  }
}

export const useMemberFeaturedDaily = () => {
  const { data, isLoading, error, refetch } = useQuery<DailyResponse>({
    queryKey: ['member-daily-featured'],
    queryFn: async () => {
      const response = await $fetch<DailyResponse>('/api/plummy/home/main/dailyMemberFeatured', {
        method:'GET'
      })
      return response || null;
    }
  });

  console.log("Check featured member: ", data);

  const featuredDaily = null;

  return {
    featuredDaily,
    isLoading,
    error,
    refetch
  }
}

export const usePostSetDaily = (imageId: Ref<string | undefined>, refetchFn?: () => Promise<any>) => {

  const { mutate: setDaily, isPending: isSettingDaily } = useMutation({
    mutationFn: async (payload: any) => {
      return await $fetch(`/api/plummy/home/main/dailies/${imageId.value}/setDaily`, {
        method: 'PATCH',
        body: payload
      })
    },
    onSuccess: async () => {
      toast({
        title: 'Daily Set',
        description: 'Your daily has been set successfully.',
      })
      
      // Call refetch function if provided
      if (refetchFn) {
        await refetchFn();
      }
    },
    onError: async(error:any) => {
      // Handle validation errors
      if (error.data?.data?.errors) {
        console.error('Validation errors:', error.data.data.errors);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: Object.values(error.data.data.errors)[0] as string || 'Failed to create daily.',
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

export const usePostClearDaily = (imageId: Ref<string | undefined>, refetchFn?: () => Promise<any>) => {

  const { mutate: clearDaily, isPending: isClearingDaily } = useMutation({
    mutationFn: async (payload: any) => {
      return await $fetch(`/api/plummy/home/main/dailies/${imageId.value}/clearDaily`, {
        method: 'PATCH',
        body: payload
      })
    },
    onSuccess: async () => {
      toast({
        title: 'Daily Cleared',
        description: 'Your daily has been cleared successfully.',
      })

      // Call refetch function if provided
      if (refetchFn) {
        await refetchFn();
      }
    },
    onError: async(error:any) => {
      // Handle validation errors
      if (error.data?.data?.errors) {
        console.error('Validation errors:', error.data.data.errors);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: Object.values(error.data.data.errors)[0] as string || 'Failed to clear daily.',
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

export const usePostRemoveDaily = (imageId: Ref<string | undefined>, refetchFn?: () => Promise<any>) => {

  const { mutate: removeDaily, isPending:isRemovingDaily } = useMutation({
    mutationFn: async (payload: any) => {
      return await $fetch(`/api/plummy/home/main/dailies/${imageId.value}/removeDaily`, {
        method: 'DELETE',
        body: payload
      })
    },
    onSuccess: async () => {
      toast({
        title: 'Daily Removed',
        description: 'Your daily has been removed successfully.',
      })

      // Call refetch function if provided
      if (refetchFn) {
        await refetchFn();
      }
    },
    onError: async(error:any) => {
      // Handle validation errors
      if (error.data?.data?.errors) {
        console.error('Validation errors:', error.data.data.errors);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: Object.values(error.data.data.errors)[0] as string || 'Failed to remove daily.',
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
    removeDaily,
    isRemovingDaily
  }

}