<script setup lang="ts">
defineOptions({
  name: 'AppModal',
});

defineEmits<{
  close: [];
}>();
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 flex items-center justify-center bg-bg-overlay z-[1000] p-4"
      @click.self="$emit('close')"
    >
      <div
        class="modal-content relative bg-bg-card rounded-radius-lg shadow-modal max-w-[480px] w-full p-8 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <button
          class="absolute top-4 right-4 text-[1.5rem] text-text-secondary leading-none transition-colors duration-fast w-8 h-8 flex items-center justify-center hover:text-text-primary cursor-pointer"
          aria-label="Закрыть"
          @click="$emit('close')"
        >
          ×
        </button>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Vue Transition classes (keep for <Transition name="modal"> support) */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-base, 250ms ease);
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform var(--transition-base, 250ms ease);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content {
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(10px);
}
</style>
