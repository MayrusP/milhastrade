import { useState, useEffect } from 'react';
import { Offer, OfferQuery, OfferListResponse, Airline } from '@/types';
import { OfferService } from '@/services/offerService';

export const useOffers = (initialQuery: OfferQuery = {}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<OfferQuery>(initialQuery);

  const fetchOffers = async (newQuery?: OfferQuery) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryToUse = newQuery || query;
      const response: OfferListResponse = await OfferService.getOffers(queryToUse);
      setOffers(response.offers);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar ofertas');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuery = (newQuery: Partial<OfferQuery>) => {
    const updatedQuery = { ...query, ...newQuery, page: 1 }; // Reset to first page
    setQuery(updatedQuery);
    fetchOffers(updatedQuery);
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      const nextPageQuery = { ...query, page: pagination.page + 1 };
      setQuery(nextPageQuery);
      fetchOffers(nextPageQuery);
    }
  };

  const refresh = () => {
    fetchOffers();
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return {
    offers,
    pagination,
    isLoading,
    error,
    query,
    updateQuery,
    loadMore,
    refresh,
  };
};

export const useAirlines = () => {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAirlines = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await OfferService.getAirlines();
      setAirlines(response);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar companhias aéreas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAirlines();
  }, []);

  return {
    airlines,
    isLoading,
    error,
    refresh: fetchAirlines,
  };
};