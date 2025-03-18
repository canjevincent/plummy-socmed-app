<script setup lang="ts">
  const props = defineProps<{
    isModalVisible: boolean;
    title?: string;
    description?: string;
  }>();

  const emits = defineEmits(['onClose'])

  const isOpen = computed({
    get() {
      return props.isModalVisible
    },
    set() {
      emits('onClose')
    }
  })
</script>

<template>
  <Dialog :open="isOpen" @update:open="emits('onClose')">
    <DialogContent>

      <DialogHeader>
        <DialogTitle v-if="title">
          {{ title }}
        </DialogTitle>

        <DialogDescription v-if="description">
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div>
        <slot></slot>
      </div>

    </DialogContent>
  </Dialog>
</template>