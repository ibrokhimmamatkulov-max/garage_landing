<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { apiInstance } from '@/shared/api';
import AdminLayout from '@/widgets/AdminLayout/index.vue';
import TextField from '@/shared/ui/TextField/index.vue';

defineOptions({
  name: 'AdminOwnersPage',
});

interface OwnerRow {
  id: number;
  name: string;
  phone: string;
  listings: number;
  applications: number;
}

const rows = ref<OwnerRow[]>([]);
const search = ref('');
const loading = ref(false);

/**
 * Список арендодателей собирается из заявок: отдельная админская ручка
 * /api/owners есть на бэке, но в превью она не замокана, а видеть, кто
 * поставляет машины и сколько по ним обращений, нужно уже сейчас.
 */
onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await apiInstance.get('/rental-applications', { params: { per_page: 200 } });
    const apps = data.data?.data ?? [];

    const byOwner = new Map<number, OwnerRow>();
    for (const a of apps) {
      if (!a.owner) continue;
      const found = byOwner.get(a.owner.id);
      if (found) {
        found.applications += 1;
      } else {
        byOwner.set(a.owner.id, {
          id: a.owner.id,
          name: a.owner.name,
          phone: a.owner.phone,
          listings: 0,
          applications: 1,
        });
      }
    }

    // Считаем разные машины на владельца
    const listingsByOwner = new Map<number, Set<number>>();
    for (const a of apps) {
      if (!a.owner) continue;
      const set = listingsByOwner.get(a.owner.id) ?? new Set<number>();
      set.add(a.listing.id);
      listingsByOwner.set(a.owner.id, set);
    }
    for (const [id, set] of listingsByOwner) {
      const row = byOwner.get(id);
      if (row) row.listings = set.size;
    }

    rows.value = [...byOwner.values()].sort((a, b) => b.applications - a.applications);
  } finally {
    loading.value = false;
  }
});

function fmtPhone(phone: string) {
  const d = phone.replace(/\D/g, '');
  if (d.length !== 12) return `+${d}`;
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return rows.value;
  const digits = q.replace(/\D/g, '');
  return rows.value.filter(
    (r) => r.name.toLowerCase().includes(q) || (digits !== '' && r.phone.includes(digits)),
  );
});
</script>

<template>
  <AdminLayout title="Арендодатели" :subtitle="`${rows.length} с активными заявками`">
    <div class="mb-md max-w-[22rem]">
      <TextField v-model="search" placeholder="Имя или телефон" />
    </div>

    <div class="overflow-x-auto rounded-radius-lg border border-hairline bg-surface-paper">
      <table class="w-full min-w-[40rem] border-collapse">
        <thead>
          <tr class="border-b border-hairline text-left">
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Арендодатель</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Телефон</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Машин</th>
            <th class="px-base py-3 text-caption font-bold uppercase tracking-[0.06em] text-ink-soft">Заявок</th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="n in 4" :key="n" class="border-b border-hairline-soft">
            <td v-for="c in 4" :key="c" class="px-base py-3.5"><div class="skeleton h-4 w-full rounded" /></td>
          </tr>
        </tbody>

        <tbody v-else-if="!filtered.length">
          <tr>
            <td colspan="4" class="px-base py-3xl text-center text-body text-ink-muted">
              Ничего не нашлось.
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="r in filtered"
            :key="r.id"
            class="border-b border-hairline-soft transition-colors duration-fast last:border-0 hover:bg-surface-sunken"
          >
            <td class="px-base py-3.5 text-small font-semibold text-ink">{{ r.name }}</td>
            <td class="px-base py-3.5">
              <a
                :href="`tel:+${r.phone}`"
                class="tnum text-small text-ink-muted no-underline transition-colors duration-fast hover:text-brand-ink"
              >
                {{ fmtPhone(r.phone) }}
              </a>
            </td>
            <td class="tnum px-base py-3.5 text-small text-ink">{{ r.listings }}</td>
            <td class="tnum px-base py-3.5 text-small font-semibold text-ink">{{ r.applications }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminLayout>
</template>
