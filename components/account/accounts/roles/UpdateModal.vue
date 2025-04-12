<script lang="ts" setup>
  import { useToast } from '~/components/ui/toast';

  const { toast } = useToast();

  interface TitleProps {
    id: string
    title: string
  }

  const props = defineProps<{
    isOpen: boolean
    title: string
    description: string
    role: TitleProps
  }>();

  type RoleType = {
    title: string
  };

  const form = ref<RoleType>({
    title: props.role.title,
  });

  const isModalVisible = computed(() => props.isOpen);
  const submitted = ref(false);

  // Reactive error state
  const errors = ref<Record<string, string>>({});

  // Update Form
  const { mutate: updateRole, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: RoleType) => {
      return await $fetch(`/api/account/accounts/roles/${props.role.id}`, {
        method: 'PATCH',
        body: payload,
      })
    },
    onSuccess: async (updatedUser) => {
      
      toast({
        // variant: 'destructive',
        title: 'Role Update',
        description: 'Role has been updated successfully.',
      });

      submitted.value = false;
      emit('onClose')
      emit('onUpdate', updatedUser)
      
    },
    onError: (error: any) => {

      // Handle validation errors
      if (error.data?.data?.errors) {
        errors.value = error.data.data.errors;
      } else {
        // Handle generic errors
        console.error('Registration error:', error);
        errors.value = { general: 'An unexpected error occurred. Please try again later.' };
      }
    }
  });

  // Trigger Update Form
  const onSubmit = () => {

    // Set submitted to true
    submitted.value = true;

    // Clear previous errors
    errors.value = {};

    // Trigger the mutation
    updateRole(form.value)

  }

  const emit = defineEmits(['onClose', 'onUpdate']);

</script>

<template>
  <Modal
    :is-modal-visible="isModalVisible"
    :title="title"
    :description="description"
    @on-close="emit('onClose')"
  >
    <form @submit.prevent="onSubmit" action="">
      <div class="flex flex-wrap gap-5">
        
        <div class="flex flex-col gap-2 basis-full">
          <Label for="title">Title</Label>
          <Input
            v-model="form.title"
            id="title"
            type="text"
            :disabled="isUpdating"
            :class="{ 
              'border-red-300 focus:border-red-600': errors.title && submitted && !isUpdating,
              'border-green-300 focus:border-green-600': !errors.title && submitted && !isUpdating
            }"
          />

          <span v-if="errors.title" class="text-red-500">
            {{ errors.title }}
          </span>
        </div>

        <div class="gap-2 space-x-2 basis-full">
          <Button :disabled="isUpdating">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isUpdating" disabled>
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
            Update
          </Button>

          <Button type="button" variant="outline" @click="emit('onClose')" :disabled="isUpdating">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isUpdating" disabled>
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
        </div>

      </div>
    </form>
  </Modal>
</template>