<script setup lang="ts">
  import { useToast } from '~/components/ui/toast';

  const { toast } = useToast();

  interface Props {
    isOpen: boolean;
    role: { id: string,
            title: string,
          };
  }

  const props = defineProps<Props>();

  const isModalVisible = computed(() => props.isOpen);

  const { mutate: deleteRole, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      return await $fetch(`/api/account/accounts/roles/${props.role.id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: async (deletedRole) => {
      toast({
        title: 'Role Delete',
        description: 'Role has been deleted successfully.',
      });

      emit('onClose');
      emit('onDelete', deletedRole);

      console.log("Check deleted role ", deletedRole)
    },
    onError: (error: any) => {
      console.error('Deletion error:', error);
    },
  });

  const onConfirm = () => {
    deleteRole();
  };

  const emit = defineEmits(['onClose', 'onDelete']);
</script>

<template>
  <Modal
    :is-modal-visible="isModalVisible"
    :title="`Role Deletion : ${role.title}`"
    description="Role will be deleted permanently."
    @on-close="emit('onClose')"
  >
    <div class="flex justify-end items-center pt-6 space-x-2 w-full">
      <Button variant="outline" @click="emit('onClose')" :disabled="isDeleting">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isDeleting" disabled>
          <circle cx="4" cy="12" r="3" fill="currentColor">
            <animate id="svgSpinners3DotsScale0" attributeName="r" begin="0;svgSpinners3DotsScale1.end-0.25s" dur="0.75s" values="3;.2;3"></animate>
          </circle>
          <circle cx="12" cy="12" r="3" fill="currentColor">
            <animate attributeName="r" begin="svgSpinners3DotsScale0.end-0.6s" dur="0.75s" values="3;.2;3"></animate>
          </circle>
          <circle cx="20" cy="12" r="3" fill="currentColor">
            <animate id="svgSpinners3DotsScale1" attributeName="r" begin="svgSpinners3DotsScale0.end-0.45s" dur="0.75s" values="3;.2;3"></animate>
          </circle>
        </svg>
        Cancel
      </Button>
      <Button variant="destructive" @click="onConfirm" :disabled="isDeleting">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isDeleting" disabled>
          <circle cx="4" cy="12" r="3" fill="currentColor">
            <animate id="svgSpinners3DotsScale0" attributeName="r" begin="0;svgSpinners3DotsScale1.end-0.25s" dur="0.75s" values="3;.2;3"></animate>
          </circle>
          <circle cx="12" cy="12" r="3" fill="currentColor">
            <animate attributeName="r" begin="svgSpinners3DotsScale0.end-0.6s" dur="0.75s" values="3;.2;3"></animate>
          </circle>
          <circle cx="20" cy="12" r="3" fill="currentColor">
            <animate id="svgSpinners3DotsScale1" attributeName="r" begin="svgSpinners3DotsScale0.end-0.45s" dur="0.75s" values="3;.2;3"></animate>
          </circle>
        </svg>
        Confirm
      </Button>
    </div>
  </Modal>
</template>