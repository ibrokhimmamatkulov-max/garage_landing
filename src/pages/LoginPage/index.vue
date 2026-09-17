<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '@/widgets/AppHeader/index.vue';
import AuthModal from '@/features/auth-otp/ui/AuthModal/index.vue';

defineOptions({
  name: 'LoginPage',
});

/**
 * Отдельная страница входа нужна для прямых заходов на /login и для
 * редиректа с закрытого кабинета. Разметка не дублируется: тот же компонент
 * входа, что открывается поверх формы подачи.
 */
const route = useRoute();
const router = useRouter();

function onSuccess() {
  router.replace((route.query.next as string) || '/cabinet');
}

function onClose() {
  router.push({ name: 'home' });
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-canvas">
    <AppHeader />
    <main class="flex-1" />

    <AuthModal
      title="Вход для владельцев"
      subtitle="Чтобы размещать авто и получать заявки."
      confirm-label="Войти"
      @close="onClose"
      @success="onSuccess"
    />
  </div>
</template>
