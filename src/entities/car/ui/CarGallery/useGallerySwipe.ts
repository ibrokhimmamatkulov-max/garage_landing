import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { Ref, ComputedRef } from 'vue';

export function useGallerySwipe(
  totalImages: Ref<number> | ComputedRef<number>,
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
) {
  const touchStartX = ref(0);
  const touchDeltaX = ref(0);
  const isDragging = ref(false);

  const hasMultipleImages = computed(() => totalImages.value > 1);

  const slideTransformStyle = computed(() => {
    if (isDragging.value) {
      return { transform: `translateX(${touchDeltaX.value}px)`, transition: 'none' };
    }
    return { transform: 'translateX(0)', transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)' };
  });

  function onTouchStart(event: TouchEvent) {
    if (!hasMultipleImages.value) return;
    touchStartX.value = event.touches[0].clientX;
    isDragging.value = true;
    touchDeltaX.value = 0;
  }

  function onMouseDown(event: MouseEvent) {
    if (!hasMultipleImages.value) return;
    event.preventDefault();
    touchStartX.value = event.clientX;
    isDragging.value = true;
    touchDeltaX.value = 0;
  }

  const touchMoveHandler = (event: TouchEvent) => {
    if (!isDragging.value) return;
    const delta = event.touches[0].clientX - touchStartX.value;
    touchDeltaX.value = delta * 0.6; // dampen
  };

  const mouseMoveHandler = (event: MouseEvent) => {
    if (!isDragging.value) return;
    const delta = event.clientX - touchStartX.value;
    touchDeltaX.value = delta * 0.6;
  };

  function handleSwipeEnd() {
    if (!isDragging.value) return;
    isDragging.value = false;

    const threshold = 50;
    if (touchDeltaX.value < -threshold) {
      onSwipeLeft();
    } else if (touchDeltaX.value > threshold) {
      onSwipeRight();
    }

    touchDeltaX.value = 0;
  }

  const onTouchMove = (event: TouchEvent) => {
    touchMoveHandler(event);
  };

  const onTouchEnd = () => {
    handleSwipeEnd();
  };

  const onMouseMove = (event: MouseEvent) => {
    mouseMoveHandler(event);
  };

  const onMouseUp = () => {
    handleSwipeEnd();
  };

  onMounted(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  });

  return {
    isDragging,
    touchDeltaX,
    slideTransformStyle,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
  };
}
