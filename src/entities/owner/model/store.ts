import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Owner, OwnerApplication, OwnerListing, ApplicationStatus } from './types';
import * as api from '../api';

const TOKEN_KEY = 'garage.owner.token';

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    // Приватное окно или запрет на хранилище — работаем без запоминания входа
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* молча: отсутствие хранилища не должно ломать вход */
  }
}

export const useOwnerStore = defineStore('owner', () => {
  const token = ref<string | null>(readToken());
  const owner = ref<Owner | null>(null);

  const listings = ref<OwnerListing[]>([]);
  const applications = ref<OwnerApplication[]>([]);
  const statuses = ref<ApplicationStatus[]>([]);

  const isLoading = ref(false);
  const isAuthenticated = computed(() => Boolean(token.value));

  const newApplicationsCount = computed(
    () => applications.value.filter((a) => a.status?.code === 'new').length,
  );

  const counts = computed(() => ({
    all: listings.value.length,
    published: listings.value.filter((l) => l.status === 'published').length,
    pending: listings.value.filter((l) => l.status === 'pending').length,
    rejected: listings.value.filter((l) => l.status === 'rejected').length,
    paused: listings.value.filter((l) => l.status === 'paused').length,
  }));

  function setSession(newToken: string, newOwner: Owner) {
    token.value = newToken;
    owner.value = newOwner;
    writeToken(newToken);
  }

  /**
   * Обновление профиля после правки данных.
   *
   * setSession для этого не годится: он переписывает токен, а профиль
   * меняется в уже открытой сессии, и токен при этом прежний.
   */
  function setOwner(next: Owner) {
    owner.value = next;
  }

  function clearSession() {
    token.value = null;
    owner.value = null;
    listings.value = [];
    applications.value = [];
    writeToken(null);
  }

  async function loadMe() {
    if (!token.value) return;
    try {
      owner.value = await api.fetchMe();
    } catch {
      clearSession();
    }
  }

  async function loadListings(status?: string) {
    isLoading.value = true;
    try {
      listings.value = await api.fetchListings(status);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadApplications(params: { statusId?: number | null; listingId?: number | null } = {}) {
    isLoading.value = true;
    try {
      applications.value = await api.fetchApplications(params);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadStatuses() {
    if (statuses.value.length) return;
    statuses.value = await api.fetchApplicationStatuses();
  }

  async function changeApplicationStatus(id: number, statusId: number) {
    await api.updateApplicationStatus(id, statusId);
    const found = applications.value.find((a) => a.id === id);
    const status = statuses.value.find((s) => s.id === statusId);
    if (found && status) found.status = status;
  }

  async function signOut() {
    try {
      await api.logout();
    } catch {
      /* сервер мог уже погасить токен — выходим в любом случае */
    }
    clearSession();
  }

  return {
    token,
    owner,
    listings,
    applications,
    statuses,
    isLoading,
    isAuthenticated,
    newApplicationsCount,
    counts,
    setOwner,
    setSession,
    clearSession,
    loadMe,
    loadListings,
    loadApplications,
    loadStatuses,
    changeApplicationStatus,
    signOut,
  };
});
