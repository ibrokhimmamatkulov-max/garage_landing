<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOwnerStore, ownerApi } from '@/entities/owner';
import ListingStatusBadge from '@/entities/owner/ui/ListingStatusBadge.vue';
import AppHeader from '@/widgets/AppHeader/index.vue';
import AppFooter from '@/widgets/AppFooter/index.vue';
import NativeSelect from '@/shared/ui/NativeSelect/index.vue';

defineOptions({
  name: 'CabinetPage',
});

const router = useRouter();
const store = useOwnerStore();

type Tab = 'listings' | 'applications' | 'profile';
const tab = ref<Tab>('listings');
const statusFilter = ref<string>('');

const filteredListings = computed(() =>
  statusFilter.value
    ? store.listings.filter((l) => l.status === statusFilter.value)
    : store.listings,
);

onMounted(async () => {
  await Promise.all([store.loadMe(), store.loadListings(), store.loadStatuses()]);
  await store.loadApplications();
});

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function formatPeriod(from: string | null, to: string | null) {
  if (!from || !to) return 'даты не указаны';
  const f = new Date(from);
  const t = new Date(to);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${f.toLocaleDateString('ru-RU', opts)} — ${t.toLocaleDateString('ru-RU', opts)}`;
}

async function togglePublish(id: number, status: string) {
  if (status === 'published') await ownerApi.pauseListing(id);
  else if (status === 'paused') await ownerApi.publishListing(id);
  else if (status === 'rejected') await ownerApi.resubmitListing(id);
  await store.loadListings();
}

async function changeStatus(applicationId: number, statusId: string) {
  await store.changeApplicationStatus(applicationId, Number(statusId));
}

async function signOut() {
  await store.signOut();
  router.push({ name: 'home' });
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-canvas">
    <AppHeader />

    <main class="container flex-1 py-xl">
      <header class="flex flex-wrap items-start justify-between gap-md">
        <div>
          <h1 class="text-display-sm font-extrabold text-ink">Личный кабинет</h1>
          <p class="mt-1 text-body text-ink-muted">
            {{ store.owner?.displayName || 'Загружаем…' }}
          </p>
        </div>
        <router-link
          to="/listings/new"
          class="rounded-radius-md bg-brand px-5 py-3 text-small font-semibold text-brand-on no-underline transition-colors duration-fast hover:bg-brand-press"
        >
          + Разместить авто
        </router-link>
      </header>

      <!-- Предложение сменить пароль: он всё ещё тот, что пришёл в SMS -->
      <div
        v-if="store.owner?.hasGeneratedPassword"
        class="mt-lg flex flex-wrap items-center justify-between gap-md rounded-radius-md border border-hairline bg-surface-paper px-base py-md"
      >
        <p class="text-small text-ink-muted">
          Вы входите с паролем, который пришёл в SMS. Стоит заменить его на свой.
        </p>
        <button
          class="text-small font-semibold text-brand-ink transition-colors duration-fast hover:text-brand-deep"
          @click="tab = 'profile'"
        >
          Сменить пароль
        </button>
      </div>

      <!-- Вкладки -->
      <nav class="scroll-x mt-xl flex gap-1 border-b border-hairline" role="tablist">
        <button
          v-for="t in [
            { id: 'listings', label: 'Мои объявления', count: store.counts.all },
            { id: 'applications', label: 'Заявки', count: store.newApplicationsCount },
            { id: 'profile', label: 'Профиль', count: 0 },
          ]"
          :key="t.id"
          role="tab"
          :aria-selected="tab === t.id"
          class="-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-small font-semibold transition-colors duration-fast"
          :class="
            tab === t.id
              ? 'border-brand-ink text-ink'
              : 'border-transparent text-ink-soft hover:text-ink'
          "
          @click="tab = t.id as Tab"
        >
          {{ t.label }}
          <span
            v-if="t.count"
            class="tnum rounded-full px-1.5 py-0.5 text-caption font-bold"
            :class="t.id === 'applications' ? 'bg-brand text-brand-on' : 'bg-surface-sunken text-ink-muted'"
          >
            {{ t.count }}
          </span>
        </button>
      </nav>

      <!-- ================= Объявления ================= -->
      <section v-if="tab === 'listings'" class="pt-lg">
        <div class="scroll-x mb-lg flex gap-sm">
          <button
            v-for="f in [
              { id: '', label: 'Все', n: store.counts.all },
              { id: 'published', label: 'Опубликованы', n: store.counts.published },
              { id: 'pending', label: 'На проверке', n: store.counts.pending },
              { id: 'rejected', label: 'Отклонены', n: store.counts.rejected },
              { id: 'paused', label: 'Сняты', n: store.counts.paused },
            ]"
            :key="f.id || 'all'"
            class="shrink-0 rounded-full border px-3.5 py-2 text-small font-semibold transition-colors duration-fast"
            :class="
              statusFilter === f.id
                ? 'border-brand-ink bg-brand-tint text-brand-ink'
                : 'border-hairline bg-surface-paper text-ink hover:bg-surface-sunken'
            "
            @click="statusFilter = f.id"
          >
            {{ f.label }} <span class="tnum text-ink-soft">{{ f.n }}</span>
          </button>
        </div>

        <p v-if="!filteredListings.length" class="py-2xl text-center text-body text-ink-muted">
          Здесь пока пусто.
        </p>

        <ul v-else class="flex flex-col gap-md">
          <li
            v-for="l in filteredListings"
            :key="l.id"
            class="rounded-radius-lg border border-hairline bg-surface-paper p-base"
          >
            <div class="flex flex-wrap items-start justify-between gap-md">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-title-sm font-bold text-ink">
                    {{ l.brand }} {{ l.model }}
                    <span class="tnum font-semibold text-ink-soft">· {{ l.year }}</span>
                  </h3>
                  <ListingStatusBadge :status="l.status" size="sm" />
                  <span
                    v-if="l.vinVerified"
                    class="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 text-caption font-bold text-brand-ink"
                  >
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2.5 7.5l3 3 6-6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    VIN проверен
                  </span>
                </div>

                <p class="tnum mt-1.5 text-small text-ink-muted">
                  {{ l.carNumber }} · {{ l.city }} · {{ l.gearbox }} · {{ l.fuel }}
                </p>

                <p class="tnum mt-sm text-price font-extrabold text-ink">
                  {{ l.minPrice }}
                  <span class="text-body font-semibold text-ink-muted">сомони / сутки</span>
                </p>
              </div>

              <div class="flex flex-col items-end gap-2">
                <div class="tnum flex gap-lg text-caption text-ink-soft">
                  <span><b class="text-ink">{{ l.viewsCount }}</b> просмотров</span>
                  <span><b class="text-ink">{{ l.applicationsCount }}</b> заявок</span>
                </div>
                <div class="flex gap-sm">
                  <button
                    v-if="l.status !== 'pending'"
                    class="rounded-radius-md border border-hairline px-3.5 py-2 text-caption font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken"
                    @click="togglePublish(l.id, l.status)"
                  >
                    {{
                      l.status === 'published'
                        ? 'Снять'
                        : l.status === 'rejected'
                          ? 'Отправить снова'
                          : 'Опубликовать'
                    }}
                  </button>
                  <button
                    class="rounded-radius-md border border-hairline px-3.5 py-2 text-caption font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken"
                  >
                    Изменить
                  </button>
                </div>
              </div>
            </div>

            <!-- Причина отклонения — главное, что нужно увидеть владельцу -->
            <p
              v-if="l.status === 'rejected' && l.rejectionReason"
              class="mt-md rounded-radius-md border-l-2 border-state-error bg-state-error-tint px-3.5 py-2.5 text-small text-ink"
            >
              {{ l.rejectionReason }}
            </p>
            <p
              v-else-if="l.status === 'pending'"
              class="mt-md text-caption text-ink-soft"
            >
              Отправлено на проверку {{ formatDate(l.submittedAt) }}. Обычно занимает до суток.
            </p>
          </li>
        </ul>
      </section>

      <!-- ================= Заявки ================= -->
      <section v-else-if="tab === 'applications'" class="pt-lg">
        <p v-if="!store.applications.length" class="py-2xl text-center text-body text-ink-muted">
          Заявок пока нет. Они появятся, когда арендатор откликнется на объявление.
        </p>

        <ul v-else class="flex flex-col gap-md">
          <li
            v-for="a in store.applications"
            :key="a.id"
            class="rounded-radius-lg border bg-surface-paper p-base"
            :class="a.status?.code === 'new' ? 'border-brand-ink' : 'border-hairline'"
          >
            <div class="flex flex-wrap items-start justify-between gap-md">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-title-sm font-bold text-ink">{{ a.name }}</h3>
                  <span
                    v-if="a.status?.code === 'new'"
                    class="rounded-full bg-brand px-2 py-0.5 text-caption font-bold text-brand-on"
                  >
                    Новая
                  </span>
                </div>

                <!-- Телефон крупно: за ним владелец сюда и приходит -->
                <a
                  :href="`tel:+${a.phone}`"
                  class="tnum mt-1 block text-title font-bold text-ink no-underline transition-colors duration-fast hover:text-brand-ink"
                >
                  +{{ a.phone }}
                </a>

                <p class="mt-sm text-small text-ink-muted">
                  {{ a.listing ? `${a.listing.brand} ${a.listing.model} · ${a.listing.year}` : '—' }}
                </p>
                <p class="tnum mt-0.5 text-small text-ink-muted">
                  {{ formatPeriod(a.desiredStartDate, a.desiredEndDate) }}
                  <template v-if="a.calculatedTotal">
                    · ориентировочно {{ a.calculatedTotal }} сомони
                  </template>
                </p>
                <p v-if="a.comment" class="mt-sm text-small italic text-ink-muted">
                  «{{ a.comment }}»
                </p>
              </div>

              <div class="flex w-full flex-col items-end gap-2 sm:w-auto">
                <span class="text-caption text-ink-soft">{{ formatDate(a.createdAt) }}</span>
                <div class="w-full sm:w-52">
                  <NativeSelect
                    :model-value="a.status?.id ?? ''"
                    :options="store.statuses"
                    @update:model-value="changeStatus(a.id, $event)"
                  />
                </div>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <!-- ================= Профиль ================= -->
      <section v-else class="pt-lg">
        <div class="max-w-[34rem] rounded-radius-lg border border-hairline bg-surface-paper p-lg">
          <dl class="flex flex-col divide-y divide-hairline-soft">
            <div
              v-for="row in [
                { label: 'Имя', value: store.owner?.displayName },
                { label: 'Телефон', value: store.owner ? `+${store.owner.phone}` : '' },
                { label: 'Логин', value: store.owner?.login },
                { label: 'Тип', value: store.owner?.ownerType === 'company' ? 'Юридическое лицо' : 'Частное лицо' },
              ]"
              :key="row.label"
              class="flex items-center justify-between gap-md py-3 first:pt-0"
            >
              <dt class="text-small text-ink-muted">{{ row.label }}</dt>
              <dd class="tnum text-small font-semibold text-ink">{{ row.value || '—' }}</dd>
            </div>
          </dl>

          <div class="mt-lg flex flex-wrap gap-sm">
            <button
              class="rounded-radius-md border border-hairline px-4 py-2.5 text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken"
            >
              Изменить данные
            </button>
            <button
              class="rounded-radius-md border border-hairline px-4 py-2.5 text-small font-semibold text-ink transition-colors duration-fast hover:bg-surface-sunken"
            >
              Сменить пароль
            </button>
            <button
              class="rounded-radius-md px-4 py-2.5 text-small font-semibold text-state-error transition-colors duration-fast hover:bg-state-error-tint"
              @click="signOut"
            >
              Выйти
            </button>
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>
