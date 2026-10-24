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
  createdAt: string;
  updatedAt: string;
}

/** The fields an admin can set when adding or editing a vehicle. */
export type VehicleInput = Pick<Vehicle, 'make' | 'model' | 'category' | 'price' | 'quantity'>;

/** Search form values. They stay strings because they come straight from inputs. */
export interface SearchFilters {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}