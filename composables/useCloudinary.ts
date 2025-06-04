import { useQuery, useMutation } from "@tanstack/vue-query";
import { useToast } from "~/components/ui/toast";

const { toast } = useToast();

export const useDeleteCloudinaryImage = (imageUrl: Ref<string | undefined>) => {

  const { mutate: deleteCloudinaryImage, isPending:isDeletingCloudinaryImage } = useMutation({
    mutationFn: async (payload: any) => {
      return await $fetch(`/api/cloudinary/${imageUrl.value}`, {
        method: 'DELETE',
      })
    },
    onSuccess: async () => {
      toast({
        title: 'Cloudinary Image Removed',
        description: 'Your cloudinary image has been removed successfully.',
      })
    },
    onError: async(error:any) => {
      // Handle validation errors
      if (error.data?.data?.errors) {
        console.error('Validation errors:', error.data.data.errors);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: Object.values(error.data.data.errors)[0] as string || 'Failed to delete cloudinary image.',
        });
      } else {
        // Handle generic errors
        console.error('Cloudinary delete error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again later.',
        });
      }
    }
  });

  return {
    deleteCloudinaryImage,
    isDeletingCloudinaryImage
  }

}