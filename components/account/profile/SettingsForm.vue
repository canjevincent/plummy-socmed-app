<script setup lang="ts">
  import { useMutation } from '@tanstack/vue-query';
  import { useToast } from '~/components/ui/toast';
  
  const { toast } = useToast();

  // Refresh session
  const { fetch: refreshSession } = useUserSession();
  
  interface UserAuthProps {
    firstName: string
    middleName: string
    lastName: string
    email: string
    avatarUrl: string
  }
  
  const props = defineProps<{
    user: UserAuthProps  
  }>()

  type SettingsType = {
    firstName: string
    middleName: string
    lastName: string
    email: string
    avatarUrl: string 
  };

  const form = ref<SettingsType>({
    firstName: props.user.firstName,
    middleName: props.user.middleName,
    lastName: props.user.lastName,
    email: props.user.email,
    avatarUrl: props.user.avatarUrl
  });

  const isAlertModalVisible = ref(false);
  const submitted = ref(false);

  // Reactive error state
  const errors = ref<Record<string, string>>({});
  
  // Update Form
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: SettingsType) => {
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

      isAlertModalVisible.value = false;
      submitted.value = false;

      // Refresh session
      await refreshSession();
      
    },
    onError: (error: any) => {
      isAlertModalVisible.value = false;

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

  // Update Image
  const { mutate: updateImage, isPending: isImageUpdating } = useMutation({
    mutationFn: async (payload: { avatarUrl: string }) => {
      return await $fetch('/api/account/profile/settingsFormImageUpdate', {
        method: 'PATCH',
        body: payload,
      })
    },
    onSuccess: async () => {
      
      toast({
        // variant: 'destructive',
        title: 'Image Update',
        description: 'Your profile image has been updated successfully.',
      });

      // Refresh session
      await refreshSession();
      
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

  // Trigger Update Image
  const onChangeImage = async (url: string) => {
    console.log('Check update url', url);

    // Clear previous errors
    errors.value = {};

    // Trigger the mutation
    updateImage({avatarUrl:url})
  }

  // Trigger Remove Image
  const onRemoveImage = async (url: string) => {
    console.log('Check remove url', url);
    // Clear previous errors
    errors.value = {};

    // Trigger the mutation
    updateImage({avatarUrl:''})
  }

</script>

<template>
  <div class="container flex gap-3">
    <section class="px-4 py-4 bg-white border border-gray-100 rounded-md shadow-sm w-fit">
      <div class="flex flex-col flex-1 gap-2">
        <Label for="profileImage" v-if="user.avatarUrl">Profile Image</Label>
        <ImageUpload
          @on-change="(url) => onChangeImage(url)"
          @on-remove="(url) => onRemoveImage(url)"
          :value="user.avatarUrl"
          :isUpdating="isUpdating || isImageUpdating"
        >
        </ImageUpload>
        
        <span v-if="errors.avatarUrl" class="text-red-500">
          {{ errors.avatarUrl }}
        </span>
      </div>
    </section>

    <section class="w-full px-4 py-4 bg-white border border-gray-100 rounded-md shadow-sm">
      <form @submit.prevent="onSubmit" action="">
        <div class="flex flex-wrap gap-3">
          
          <div class="flex flex-col flex-1 gap-2">
            <Label for="firstName">First Name</Label>
            <Input
              v-model="form.firstName"
              id="firstName"
              type="text"
              :disabled="isUpdating || isImageUpdating"
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
              :disabled="isUpdating || isImageUpdating"
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
              :disabled="isUpdating || isImageUpdating"
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
              :disabled="isUpdating || isImageUpdating"
              :class="{ 
                'border-red-300 focus:border-red-600': errors.email && submitted && !isUpdating,
                'border-green-300 focus:border-green-600': !errors.email && submitted && !isUpdating
              }"
            />

            <span v-if="errors.email" class="text-red-500">
              {{ errors.email }}
            </span>
          </div>

          <div class="gap-2 basis-full">
            <Button type="button" @click="isAlertModalVisible = !isAlertModalVisible" :disabled="isUpdating || isImageUpdating">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isUpdating || isImageUpdating" disabled>
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
          </div>

        </div>
      </form>
    </section>
  </div>

  <AlertModal
    v-if="isAlertModalVisible"
    title="Profile Update"
    description="Are you sure you want to update your profile?"
    :is-open="isAlertModalVisible"
    :is-updating="isUpdating"
    @on-confirm="onSubmit"
    @on-close="isAlertModalVisible = !isAlertModalVisible">
  </AlertModal>
</template>