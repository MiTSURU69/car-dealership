export interface User {
  id: number;
  name: string;
  email: string;
  role: string; // "user" or "admin"
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The fields an admin can set. An empty imageUrl means "find one automatically". */
export type VehicleInput = Pick<Vehicle, 'make' | 'model' | 'category' | 'price' | 'quantity'> & {
  imageUrl?: string;
};

/** Search form values. They stay strings because they come straight from inputs. */
export interface SearchFilters {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListQuery {
  sort: SortOption | '';
  page: number;
}