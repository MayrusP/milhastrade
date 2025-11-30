import { User } from './User';
import { Airline } from './Airline';

export type OfferType = 'SALE' | 'EXCHANGE';
export type OfferStatus = 'ACTIVE' | 'SOLD' | 'CANCELLED';

export interface Offer {
  id: string;
  title: string;
  description?: string;
  milesAmount: number;
  price: number;
  type: OfferType;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  user: User;
  airline: Airline;
}

export interface CreateOfferRequest {
  title: string;
  description?: string;
  milesAmount: number;
  price: number;
  type: OfferType;
  airlineId: string;
}

export interface UpdateOfferRequest {
  title?: string;
  description?: string;
  milesAmount?: number;
  price?: number;
  type?: OfferType;
  airlineId?: string;
}

export interface OfferQuery {
  airlineId?: string;
  type?: OfferType;
  minPrice?: number;
  maxPrice?: number;
  minMiles?: number;
  maxMiles?: number;
  sortBy?: 'price' | 'milesAmount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OfferListResponse {
  offers: Offer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}