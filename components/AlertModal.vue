<script setup lang="ts" >
  const props = defineProps<{
    isOpen: boolean;
  }>();

  const isModalVisible = computed(() => props.isOpen);

  const emit = defineEmits(['onConfirm', 'onClose']);

</script>

<template>
  <Modal
    :is-modal-visible="isModalVisible"
    title="Profile Update"
    description="Are you sure you want to update your profile?"
    @on-close="$emit('onClose')"
  >
    <div class="flex justify-end items-center pt-6 space-x-2 w-full">
      <Button variant="outline" @click="emit('onClose')">Cancel</Button>
      <Button variant="destructive" @click="emit('onConfirm')">Continue</Button>
    </div>
  </Modal>
</template>