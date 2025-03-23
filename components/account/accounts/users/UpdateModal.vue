<script lang="ts" setup>
  import { useToast } from '~/components/ui/toast';

  const { toast } = useToast();

  // Refresh session
  const { fetch: refreshSession } = useUserSession();

  interface UserAuthProps {
    id: string
    firstName: string
    middleName: string
    lastName: string
    email: string
  }

  const props = defineProps<{
    isOpen: boolean
    title: string
    description: string
    user: UserAuthProps
  }>();

  type UserType = {
    firstName: string
    middleName: string
    lastName: string
    email: string
  };

  const form = ref<UserType>({
    firstName: props.user.firstName,
    middleName: props.user.middleName,
    lastName: props.user.lastName,
    email: props.user.email,
  });

  const isModalVisible = computed(() => props.isOpen);
  const submitted = ref(false);

  // Reactive error state
  const errors = ref<Record<string, string>>({});

  // Update Form
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: UserType) => {
      return await $fetch('/api/account/profile/settingsFormUpdate', {
        method: 'PATCH',
        body: payload,
      })
    },
    onSuccess: async () => {
      
      toast({
        // variant: 'destructive',
        title: 'Profile Update',
        description: 'Your profile has been updated successfully.',
      });

      // isModalVisible.value = false;
      submitted.value = false;

      // Refresh session
      await refreshSession();
      
    },
    onError: (error: any) => {
      // isModalVisible.value = false;

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
    updateProfile(form.value)

  }

  const emit = defineEmits(['onConfirm', 'onClose']);

</script>

<template>
  <Modal
    :is-modal-visible="isModalVisible"
    :title="title"
    :description="description"
    @on-close="emit('onClose')"
  >
    <form @submit.prevent="onSubmit" action="">
      <div class="flex flex-wrap gap-3">
        
        <div class="flex flex-col flex-1 gap-2">
          <Label for="firstName">First Name</Label>
          <Input
            v-model="form.firstName"
            id="firstName"
            type="text"
            :disabled="isUpdating"
            :class="{ 
              'border-red-300 focus:border-red-600': errors.firstName && submitted && !isUpdating,
              'border-green-300 focus:border-green-600': !errors.firstName && submitted && !isUpdating
            }"
          />

          <span v-if="errors.firstName" class="text-red-500">
            {{ errors.firstName }}
          </span>
        </div>

        <div class="flex flex-col flex-1 gap-2">
          <Label for="middleName">Middle Name</Label>
          <Input
            v-model="form.middleName"
            id="middleName"
            type="text"
            :disabled="isUpdating"
            :class="{ 
              'border-red-300 focus:border-red-600': errors.middleName && submitted && !isUpdating,
              'border-green-300 focus:border-green-600': !errors.middleName && submitted && !isUpdating
            }"
          />

          <span v-if="errors.middleName" class="text-red-500">
            {{ errors.middleName }}
          </span>
        </div>

        <div class="flex flex-col flex-1 gap-2">
          <Label for="lastName">Last Name</Label>
          <Input
            v-model="form.lastName"
            id="lastName"
            type="text"
            :disabled="isUpdating"
            :class="{ 
              'border-red-300 focus:border-red-600': errors.lastName && submitted && !isUpdating,
              'border-green-300 focus:border-green-600': !errors.lastName && submitted && !isUpdating
            }"
          />

          <span v-if="errors.lastName" class="text-red-500">
            {{ errors.lastName }}
          </span>
        </div>

        <div class="flex flex-col gap-2 basis-full">
          <Label for="email">Email</Label>
          <Input
            v-model="form.email"
            id="email"
            type="email"
            :disabled="isUpdating"
            :class="{ 
              'border-red-300 focus:border-red-600': errors.email && submitted && !isUpdating,
              'border-green-300 focus:border-green-600': !errors.email && submitted && !isUpdating
            }"
          />

          <span v-if="errors.email" class="text-red-500">
            {{ errors.email }}
          </span>
        </div>

        <div class="gap-2 space-x-2 basis-full">
          <Button type="button" @click="isModalVisible = !isModalVisible" :disabled="isUpdating">
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

          <Button variant="outline" @click="emit('onClose')" :disabled="isUpdating">
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