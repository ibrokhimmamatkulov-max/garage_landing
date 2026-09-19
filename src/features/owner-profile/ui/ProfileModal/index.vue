<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ownerApi, type Owner } from '@/entities/owner';
import FormField from '@/shared/ui/FormField/index.vue';
import NativeSelect from '@/shared/ui/NativeSelect/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'ProfileModal',
});

const props = defineProps<{
  owner: Owner;
}>();

const emit = defineEmits<{
  close: [];
  saved: [owner: Owner];
}>();

const form = reactive({
  firstName: props.owner.firstName ?? '',
  lastName: props.owner.lastName ?? '',
  middleName: props.owner.middleName ?? '',
  ownerType: props.owner.ownerType,
  companyName: props.owner.companyName ?? '',
  tin: props.owner.tin ?? '',
  email: props.owner.email ?? '',
});

const busy = ref(false);
const error = ref<string | null>(null);
const fieldErrors = ref<Record<string, string>>({});

const TYPES = [
  { id: 'individual', name: 'Частное лицо' },
  { id: 'company', name: 'Юридическое лицо' },
];

async function save() {
  if (busy.value) return;
  busy.value = true;
  error.value = null;
  fieldErrors.value = {};

  try {
    const owner = await ownerApi.updateProfile({
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName,
      ownerType: form.ownerType,
      companyName: form.companyName,
      tin: form.tin,
      email: form.email,
    });
    emit('saved', owner);
  } catch (e: any) {
    const errors = e?.response?.data?.errors;
    if (errors) {
      // Ошибки полей показываем у самих полей: общая строка внизу не
      // объясняет, в какое из семи полей смотреть.
      fieldErrors.value = Object.fromEntries(
        Object.entries(errors).map(([k, v]) => [k, (v as string[])[0]]),
      );
    }
    error.value = errors ? null : (e?.response?.data?.message ?? 'Не удалось сохранить.');
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-[200] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-lg"
    @click.self="emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
      class="max-h-[90vh] w-full max-w-[32rem] overflow-y-auto rounded-t-radius-2xl bg-surface-paper p-lg shadow-modal sm:rounded-radius-2xl sm:p-xl"
    >
      <h2 id="profile-title" class="text-title font-bold text-ink">Данные профиля</h2>
      <p class="mt-1 text-small text-ink-muted">
        Имя видят арендаторы в объявлении. Телефон и логин здесь не меняются.
      </p>

      <div class="mt-lg grid gap-md sm:grid-cols-2">
        <FormField label="Имя" required for="p-first" :error="fieldErrors.first_name">
          <TextField id="p-first" v-model="form.firstName" />
        </FormField>
        <FormField label="Фамилия" for="p-last" :error="fieldErrors.last_name">
          <TextField id="p-last" v-model="form.lastName" />
        </FormField>

        <FormField label="Отчество" for="p-middle" :error="fieldErrors.middle_name">
          <TextField id="p-middle" v-model="form.middleName" />
        </FormField>
        <FormField label="Тип" for="p-type" :error="fieldErrors.owner_type">
          <NativeSelect id="p-type" v-model="form.ownerType" :options="TYPES" />
        </FormField>

        <FormField
          v-if="form.ownerType === 'company'"
          label="Название компании"
          required
          for="p-company"
          :error="fieldErrors.company_name"
          class="sm:col-span-2"
        >
          <TextField id="p-company" v-model="form.companyName" />
        </FormField>

        <FormField v-if="form.ownerType === 'company'" label="ИНН" for="p-tin" :error="fieldErrors.tin">
          <TextField id="p-tin" v-model="form.tin" inputmode="numeric" />
        </FormField>
        <FormField label="Почта" for="p-email" :error="fieldErrors.email">
          <TextField id="p-email" v-model="form.email" type="email" placeholder="name@example.com" />
        </FormField>
      </div>

      <p v-if="error" class="mt-md text-caption text-state-error">{{ error }}</p>

      <div class="mt-lg flex justify-end gap-sm">
        <button
          class="rounded-radius-md px-4 py-2.5 text-small font-semibold text-ink-muted transition-colors duration-fast hover:bg-surface-sunken hover:text-ink"
          @click="emit('close')"
        >
          Отмена
        </button>
        <button
          :disabled="busy || !form.firstName.trim()"
          class="rounded-radius-md bg-brand px-5 py-2.5 text-small font-bold text-brand-on transition-colors duration-fast hover:bg-brand-press disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-soft"
          @click="save"
        >
          {{ busy ? 'Сохраняем…' : 'Сохранить' }}
        </button>
      </div>
    </div>
  </div>
</template>
