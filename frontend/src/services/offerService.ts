import api from './api';
import { 
  Offer, 
  CreateOfferRequest, 
  UpdateOfferRequest, 
  OfferQuery, 
  OfferListResponse,
  Airline,
  ApiResponse 
} from '@/types';

export class OfferService {
  static async getOffers(query: OfferQuery = {}): Promise<OfferListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<ApiResponse<OfferListResponse>>(`/offers?${params}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar ofertas');
  }

  static async getOfferById(id: string): Promise<Offer> {
    const response = await api.get<ApiResponse<{ offer: Offer }>>(`/offers/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data.offer;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar oferta');
  }

  static async createOffer(data: CreateOfferRequest): Promise<Offer> {
    const response = await api.post<ApiResponse<{ offer: Offer }>>('/offers', data);
    
    if (response.data.success && response.data.data) {
      return response.data.data.offer;
    }
    
    throw new Error(response.data.message || 'Erro ao criar oferta');
  }

  static async updateOffer(id: string, data: UpdateOfferRequest): Promise<Offer> {
    const response = await api.put<ApiResponse<{ offer: Offer }>>(`/offers/${id}`, data);
    
    if (response.data.success && response.data.data) {
      return response.data.data.offer;
    }
    
    throw new Error(response.data.message || 'Erro ao atualizar oferta');
  }

  static async deleteOffer(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`/offers/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro ao remover oferta');
    }
  }

  static async getUserOffers(query: OfferQuery = {}): Promise<OfferListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<ApiResponse<OfferListResponse>>(`/offers/user/my-offers?${params}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar suas ofertas');
  }

  static async getAirlines(): Promise<Airline[]> {
    const response = await api.get<ApiResponse<{ airlines: Airline[] }>>('/offers/airlines');
    
    if (response.data.success && response.data.data) {
      return response.data.data.airlines;
    }
    
    throw new Error(response.data.message || 'Erro ao buscar companhias aéreas');
  }
}