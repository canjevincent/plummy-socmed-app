<script setup lang="ts">
  import { useMutation } from '@tanstack/vue-query';

  // Define the payload type
  type RegisterPayload = {
    password: string;
    confirmPassword: string;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
  };

  // Reactive form state
  const form = ref<RegisterPayload>({
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    middleName: '',
    lastName: '',
  });

  // Reactive error state
  const errors = ref<Record<string, string>>({});

  // Track if the form has been submitted
  const submitted = ref(false);

  // Mutation for registration
  const { mutate: registerUser, isPending: isRegistering } = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      return await $fetch('/api/guest/auth/register', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: async () => {
      // Redirect to login page on successful registration
      await navigateTo('/guest/auth/login');
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
    },
  });

  // Form submission handler
  const onSubmit = () => {
    // Set submitted to true
    submitted.value = true;

    // Clear previous errors
    errors.value = {};

    // Trigger the mutation
    registerUser(form.value);
  };

</script>
<template>
  <div class="flex flex-col gap-6">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl">
          Create an account
        </CardTitle>
        <CardDescription>
          Register with your Apple or Google account
        </CardDescription>
      </CardHeader>
      <CardContent>
          <div class="grid gap-6">

            <div class="flex flex-col gap-4">
              <Button variant="outline" class="w-full" :disabled="isRegistering">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" v-if="!isRegistering">
                  <path
                    d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                    fill="currentColor"
                  />
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isRegistering" disabled>
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
                Login with Apple
              </Button>
              <Button variant="outline" class="w-full" :disabled="isRegistering">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" v-if="!isRegistering">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isRegistering" disabled>
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
                Login with Google
              </Button>
            </div>
            
            <div class="relative text-sm text-center after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span class="relative z-10 px-2 bg-background text-muted-foreground">
                Or register with
              </span>
            </div>
            
            <form @submit.prevent="onSubmit" action="">

              <div class="grid gap-3">
                
                <div class="grid gap-2">
                  <Label html-for="firstname">First Name</Label>
                  <Input
                    v-model="form.firstName"
                    id="firstname"
                    type="text"
                    required
                    :disabled="isRegistering"
                    :class="{ 
                      'border-red-300 focus:border-red-600': errors.firstName && submitted && !isRegistering,
                      'border-green-300 focus:border-green-600': !errors.firstName && submitted && !isRegistering
                    }"
                  />

                  <span v-if="errors.firstName" class="text-sm text-red-500">
                    {{ errors.firstName }}
                  </span>
                </div>

                <div class="grid gap-2">
                  <Label html-for="middlename">Middle Name</Label>
                  <Input
                    v-model="form.middleName"
                    id="middlename"
                    type="text"
                    required
                    :disabled="isRegistering"
                    :class="{ 
                      'border-red-300 focus:border-red-600': errors.middleName && submitted && !isRegistering,
                      'border-green-300 focus:border-green-600': !errors.middleName && submitted && !isRegistering 
                    }"
                  />
                  <span v-if="errors.middleName" class="text-sm text-red-500">
                    {{ errors.middleName }}
                  </span>
                </div>

                <div class="grid gap-2">
                  <Label html-for="lastname">Last Name</Label>
                  <Input
                    v-model="form.lastName"
                    id="lastname"
                    type="text"
                    required
                    :disabled="isRegistering"
                    :class="{ 
                      'border-red-300 focus:border-red-600': errors.lastName && submitted && !isRegistering, 
                      'border-green-300 focus:border-green-600': !errors.lastName && submitted && !isRegistering 
                    }"
                  />
                  <span v-if="errors.lastName" class="text-sm text-red-500">
                    {{ errors.lastName }}
                  </span>
                </div>

                <div class="grid gap-2">
                  <Label html-for="email">Email</Label>
                  <Input
                    v-model="form.email"
                    id="email"
                    type="email"
                    required
                    :disabled="isRegistering"
                    :class="{ 
                      'border-red-300 focus:border-red-600': errors.email && submitted && !isRegistering, 
                      'border-green-300 focus:border-green-600': !errors.email && submitted && !isRegistering 
                    }"
                  />
                  <span v-if="errors.email" class="text-sm text-red-500">
                    {{ errors.email }}
                  </span>
                </div>

                <div class="grid gap-2">
                  <Label html-for="password">Password</Label>
                  <Input
                    v-model="form.password" 
                    id="password" 
                    type="password" 
                    required 
                    :disabled="isRegistering"
                    :class="{ 
                      'border-red-300 focus:border-red-600': errors.password && submitted && !isRegistering, 
                      'border-green-300 focus:border-green-600': !errors.password && submitted && !isRegistering  
                    }"
                  />
                  <span v-if="errors.password" class="text-sm text-red-500">
                    {{ errors.password }}
                  </span>
                </div>

                <div class="grid gap-2">
                  <Label html-for="confirmPassword">Confirm Password</Label>
                  <Input
                    v-model="form.confirmPassword" 
                    id="confirmPassword" 
                    type="password" 
                    required 
                    :disabled="isRegistering"
                    :class="{ 
                      'border-red-300 focus:border-red-600': errors.confirmPassword && submitted && !isRegistering, 
                      'border-green-300 focus:border-green-600': !errors.confirmPassword && submitted && !isRegistering  
                    }"
                  />
                  <span v-if="errors.confirmPassword" class="text-sm text-red-500">
                    {{ errors.confirmPassword }}
                  </span>
                </div>

                <Button type="submit" class="w-full" :disabled="isRegistering">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" v-if="isRegistering" disabled>
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
                  Register
                </Button>
                
              </div>

            </form>
            
            <div class="text-sm text-center">
              Already have an account?
              <NuxtLink to="/guest/auth/login" class="underline underline-offset-4">
                Sign in
              </NuxtLink>
            </div>

          </div>
      </CardContent>
    </Card>
    <div class="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
      By clicking continue, you agree to our <a href="#">Terms of Service</a>
      and <a href="#">Privacy Policy</a>.
    </div>
  </div>
</template>