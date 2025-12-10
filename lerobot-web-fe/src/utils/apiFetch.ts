import { useConfigStore } from '../stores/config.store';
import { ToastType, useToastStore } from '../stores/toast.store';

type ToastOpts = {
  success?: string | false;
  error?: string | false;
  onGetSuccess?: boolean;
};

export type ApiInit = RequestInit & { toast?: ToastOpts };

function buildUrl(path: string, base: string) {
  const slash = path.startsWith('/') ? '' : '/';
  return `${base}${slash}${path}`;
}

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { apiUrl } = useConfigStore.getState();
  const { addToast } = useToastStore.getState();

  if (!apiUrl) {
    throw new Error('API URL not set. Please configure the system.');
  }

  const url = buildUrl(path, apiUrl);
  const method = (init.method ?? 'GET').toUpperCase();

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    if (!res.ok) {
      let serverMsg = `${res.status} ${res.statusText}`;
      try {
        const data = await res.clone().json();
        serverMsg = data?.message ?? data?.error ?? serverMsg;
      } catch {}
      throw new Error(serverMsg);
    }

    const wantsSuccess = init.toast?.success !== false && ((init.toast?.onGetSuccess ?? false) || method !== 'GET');

    if (wantsSuccess) {
      const msg = typeof init.toast?.success === 'string' ? init.toast.success : 'Successful operation';
      addToast({ type: ToastType.Success, title: 'Success', description: msg });
    }

    if (res.status === 204) {
      return undefined as T;
    }

    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  } catch (err) {
    const isNetworkError = err instanceof TypeError && err.message === 'Failed to fetch';

    if (init.toast?.error !== false) {
      let msg: string;
      if (typeof init.toast?.error === 'string') {
        msg = init.toast.error;
      } else if (isNetworkError) {
        msg = `The server could not be reached.: ${url}`;
      } else if (err instanceof Error) {
        msg = `${err.message} (${url})`;
      } else {
        msg = `An unknown error occurred. (${url})`;
      }

      addToast({ type: ToastType.Error, title: 'Error', description: msg });
    }

    throw err instanceof Error ? err : new Error(String(err));
  }
}
