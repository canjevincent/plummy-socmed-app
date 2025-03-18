<script setup lang="ts">
  type SettingsType = {
    firstName: string
    middleName: string
    lastName: string
    email: string
    // avatarUrl: String
  };

  const form = ref<SettingsType>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: ''
  });

  const onSubmit = () => {

  }

</script>

<template>
  <section class="container px-4 py-4 bg-white rounded-md border border-gray-100 shadow-sm">
    <form @submit.prevent="onSubmit" action="">
      <div class="flex flex-wrap gap-3">
        
        <div class="flex flex-col flex-1 gap-2">
          <Label for="firstName">First Name</Label>
          <Input
            v-model="form.firstName"
            id="firstName"
            type="text"
            required
          />
        </div>

        <div class="flex flex-col flex-1 gap-2">
          <Label for="middleName">Middle Name</Label>
          <Input
            v-model="form.middleName"
            id="middleName"
            type="text"
            required
          />
        </div>

        <div class="flex flex-col flex-1 gap-2">
          <Label for="lastName">Last Name</Label>
          <Input
            v-model="form.lastName"
            id="lastName"
            type="text"
            required
          />
        </div>

        <div class="flex flex-col gap-2 basis-full">
          <Label for="email">Email</Label>
          <Input
            v-model="form.email"
            id="email"
            type="email"
            required
          />
        </div>

        <div class="flex flex-col flex-1 gap-2">
          <Label for="profileImage">Profile Image</Label>
          <Input id="profileImage" type="file"/>
        </div>

        <div class="gap-2 basis-full">
          <Button type="submit" class="font-semibold">
            UPDATE
          </Button>
        </div>

      </div>
    </form>
  </section>
</template>