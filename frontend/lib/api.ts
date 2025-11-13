export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

type JSONValue = Record<string, any> | Array<any> | string | number | boolean | null;

async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const isFormData = typeof window !== 'undefined' && init.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(init.headers || {}),
  };
  if (token) (headers as any).Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: init.credentials || 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let body: any;
    try { body = text ? JSON.parse(text) : {}; } catch { body = { message: text }; }
    const err = new Error(body?.message || `HTTP ${res.status}`) as any;
    err.status = res.status;
    err.body = body;
    throw err;
  }
  // try to parse json; fallback to any
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return (await res.text()) as any;
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request<{ token: string; user: any }>(`/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: any }>(`/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ user: any }>(`/api/auth/me`),
    refresh: () => request<{ token: string }>(`/api/auth/refresh`, { method: 'POST' }),
    logout: () => request<{ message: string }>(`/api/auth/logout`, { method: 'POST' }),
  },
  users: {
    getMe: () => request<any>(`/api/users/me`),
    getProfile: (id: string) => request<any>(`/api/users/${id}`),
    updateProfile: (id: string, data: { name?: string; bio?: string; location?: string; avatarUrl?: string }) =>
      request<any>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    uploadAvatar: (id: string, file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return request<any>(`/api/users/${id}/avatar`, { method: 'POST', body: fd });
    },
  },
  offeredSkills: {
    list: (params?: { userId?: string; page?: number; limit?: number }) => {
      const sp = new URLSearchParams();
      if (params?.userId) sp.set('userId', params.userId);
      if (params?.page) sp.set('page', String(params.page));
      if (params?.limit) sp.set('limit', String(params.limit));
      return request<{ items: any[]; total: number; page: number; limit: number }>(
        `/api/offered-skills?${sp}`
      );
    },
    create: (data: any) =>
      request<any>(`/api/offered-skills`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/api/offered-skills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/api/offered-skills/${id}`, { method: 'DELETE' }),
  },
  requestedSkills: {
    list: (params?: { userId?: string; page?: number; limit?: number }) => {
      const sp = new URLSearchParams();
      if (params?.userId) sp.set('userId', params.userId);
      if (params?.page) sp.set('page', String(params.page));
      if (params?.limit) sp.set('limit', String(params.limit));
      return request<{ items: any[]; total: number; page: number; limit: number }>(
        `/api/requested-skills?${sp}`
      );
    },
    create: (data: any) =>
      request<any>(`/api/requested-skills`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/api/requested-skills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/api/requested-skills/${id}`, { method: 'DELETE' }),
  },
  reviews: {
    listForUser: (userId: string, params?: { page?: number; limit?: number }) => {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.limit) sp.set('limit', String(params.limit));
      return request<{ items: any[]; total: number }>(`/api/reviews/user/${userId}?${sp}`);
    },
    create: (data: any) =>
      request<any>(`/api/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  },
  messages: {
    send: (data: { recipientId: string; content: string; exchangeId?: string }) =>
      request<any>(`/api/messages`, { method: 'POST', body: JSON.stringify(data) }),
    getThread: (userId: string) =>
      request<{ messages: any[] }>(`/api/messages/thread/${userId}`),
    markRead: (userId: string) =>
      request<{ updated: number }>(`/api/messages/thread/${userId}/read`, { method: 'POST' }),
    unreadCount: () => request<{ count: number }>(`/api/messages/unread-count`),
    getConnections: () => request<{ connections: any[] }>(`/api/messages/connections`),
  },
  categories: {
    list: () => request<{ categories: string[] }>(`/api/categories`),
  },
  exchanges: {
    create: (data: any) => request<any>(`/api/exchanges`, { method: 'POST', body: JSON.stringify(data) }),
    list: (params?: { role?: string; status?: string; page?: number; limit?: number }) => {
      const sp = new URLSearchParams();
      if (params?.role) sp.set('role', params.role);
      if (params?.status) sp.set('status', params.status);
      if (params?.page) sp.set('page', String(params.page));
      if (params?.limit) sp.set('limit', String(params.limit));
      return request<{ items: any[]; total: number }>(`/api/exchanges?${sp}`);
    },
    get: (id: string) => request<any>(`/api/exchanges/${id}`),
    updateStatus: (id: string, status: string) =>
      request<any>(`/api/exchanges/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  notifications: {
    list: (params?: { page?: number; limit?: number }) => {
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.limit) sp.set('limit', String(params.limit));
      return request<{ items: any[]; total: number }>(`/api/notifications?${sp}`);
    },
    markRead: (id: string) => 
      request<any>(`/api/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () =>
      request<{ updated: number }>(`/api/notifications/mark-all-read`, { method: 'POST' }),
  },
  matches: {
    find: (params: { skillTitle?: string; category?: string }) => {
      const sp = new URLSearchParams();
      if (params.skillTitle) sp.set('skillTitle', params.skillTitle);
      if (params.category) sp.set('category', params.category);
      return request<any>(`/api/matches/find?${sp}`);
    },
    myMatches: () => request<any>(`/api/matches/my-matches`),
  },
};
