<script setup lang="ts">
  import { useToast } from '~/components/ui/toast';

  const { toast } = useToast();

  const props = defineProps<{
    isOpen: boolean
    title: string
    description: string
  }>();

  type RoleType = {
    title: string
  }

  const form = ref<RoleType>({
    title: "",
  });

  const isModalVisible = computed(() => props.isOpen);
  const submitted = ref(false);

  // Reactive error state
  const errors = ref<Record<string, string>>({});

  // Create Form
  const { mutate: createRole, isPending: isCreating } = useMutation({
    mutationFn: async (payload: RoleType) => {
      return await $fetch(`/api/account/accounts/roles`, {
        method: 'POST',
        body: payload,
      })
    },
    onSuccess: async (addedRole) => {
      
      toast({
        // variant: 'destructive',
        title: 'Account Created',
        description: 'New account has been successfuly created.',
      });

      submitted.value = false;
      emit('onClose')
      emit('onCreate', addedRole)
      
    },
    onError: (error: any) => {

      // Handle validation errors
      if (error.data?.data?.errors) {
        errors.value = error.data.data.errors;
      } else {
        // Handle generic errors
        console.error('New role error:', error);
        errors.value = { general: 'An unexpected error occurred. Please try again later.' };
      }
    }
  });

  //Triger Create Form
  const onSubmit = () => {
   // Set submitted to true
   submitted.value = true

    // Clear previous errors
   errors.value = {}; 

   // Trigger the mutation
   createRole(form.value)
  }

  const emit = defineEmits(['onClose', 'onCreate']);

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
            :disabled="isCreating"
            :class="{ 
              'border-red-300 focus:border-red-600': errors.title && submitted && !isCreating,
              'border-green-300 focus:border-green-600': !errors.title && submitted && !isCreating
            }"
          />

          <span v-if="errors.title" class="text-red-500">
            {{ errors.title }}
          </span>
        </div>

        <div class="gap-2 space-x-2 basis-full">
          <Button :disabled="isCreating">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isCreating" disabled>
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
            Create
          </Button>

          <Button type="button" variant="outline" @click="emit('onClose')" :disabled="isCreating">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isCreating" disabled>
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