import { request } from './client';
import type { ListQuery, Pagination, SearchFilters, User, Vehicle, VehicleInput } from './types';

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ user: User }>('/api/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body }),
  me: () => request<{ user: User }>('/api/auth/me'),
};

const PAGE_SIZE = 12;

/** Builds "make=toyota&sort=price_asc&page=2", skipping empty values. */
function toQueryString(filters: SearchFilters, list: ListQuery): string {
  const params = new URLSearchParams();
  (Object.keys(filters) as (keyof SearchFilters)[]).forEach((key) => {
    const value = filters[key].trim();
    if (value) params.set(key, value);
  });
  if (list.sort) params.set('sort', list.sort);
  params.set('page', String(list.page));
  params.set('limit', String(PAGE_SIZE));
  return params.toString();
}

export interface VehiclePageResponse {
  vehicles: Vehicle[];
  pagination: Pagination;
}

export const vehicleApi = {
  /** Uses /search when any filter is set, otherwise the plain list. Both support sort and paging. */
  find: (filters: SearchFilters, list: ListQuery, filtering: boolean) =>
    request<VehiclePageResponse>(
      `/api/vehicles${filtering ? '/search' : ''}?${toQueryString(filters, list)}`,
    ),
  create: (input: VehicleInput) =>
    request<{ vehicle: Vehicle }>('/api/vehicles', { method: 'POST', body: input }),
  update: (id: number, input: VehicleInput) =>
    request<{ vehicle: Vehicle }>(`/api/vehicles/${id}`, { method: 'PUT', body: input }),
  remove: (id: number) => request<void>(`/api/vehicles/${id}`, { method: 'DELETE' }),
  purchase: (id: number, quantity = 1) =>
    request<{ vehicle: Vehicle }>(`/api/vehicles/${id}/purchase`, {
      method: 'POST',
      body: { quantity },
    }),
  restock: (id: number, quantity: number) =>
    request<{ vehicle: Vehicle }>(`/api/vehicles/${id}/restock`, {
      method: 'POST',
      body: { quantity },
    }),
};