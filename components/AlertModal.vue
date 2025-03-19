<script setup lang="ts" >
  const props = defineProps<{
    isOpen: boolean
    isUpdating: boolean
    title: string
    description: string
  }>();

  const isModalVisible = computed(() => props.isOpen);

  const emit = defineEmits(['onConfirm', 'onClose']);

</script>

<template>
  <Modal
    :is-modal-visible="isModalVisible"
    :title="title"
    :description="description"
    @on-close="emit('onClose')"
  >
    <div class="flex justify-end items-center pt-6 space-x-2 w-full">
      
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
      
      <Button variant="destructive" @click="emit('onConfirm')" :disabled="isUpdating">
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
        Confirm
      </Button>

    </div>
  </Modal>
</template>