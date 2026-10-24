import { request } from './client';
import type { SearchFilters, User, Vehicle, VehicleInput } from './types';

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ user: User }>('/api/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body }),
  me: () => request<{ user: User }>('/api/auth/me'),
};

/** Builds "make=toyota&minPrice=100", skipping empty filters. */
function toQueryString(filters: SearchFilters): string {
  const params = new URLSearchParams();
  (Object.keys(filters) as (keyof SearchFilters)[]).forEach((key) => {
    const value = filters[key].trim();
    if (value) params.set(key, value);
  });
  return params.toString();
}

export const vehicleApi = {
  list: () => request<{ vehicles: Vehicle[] }>('/api/vehicles'),
  search: (filters: SearchFilters) =>
    request<{ vehicles: Vehicle[] }>(`/api/vehicles/search?${toQueryString(filters)}`),
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