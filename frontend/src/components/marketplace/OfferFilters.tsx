import { useState, useEffect } from 'react';
import { OfferQuery, OfferType } from '@/types';
import { useAirlines } from '@/hooks/useOffers';

interface OfferFiltersProps {
  query: OfferQuery;
  onQueryChange: (query: Partial<OfferQuery>) => void;
}

export const OfferFilters = ({ query, onQueryChange }: OfferFiltersProps) => {
  const { airlines } = useAirlines();
  const [localFilters, setLocalFilters] = useState({
    airlineId: query.airlineId || '',
    type: query.type || '',
    minPrice: query.minPrice?.toString() || '',
    maxPrice: query.maxPrice?.toString() || '',
    minMiles: query.minMiles?.toString() || '',
    maxMiles: query.maxMiles?.toString() || '',
    sortBy: query.sortBy || 'createdAt',
    sortOrder: query.sortOrder || 'desc',
  });

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const filters: Partial<OfferQuery> = {};
    
    if (localFilters.airlineId) filters.airlineId = localFilters.airlineId;
    if (localFilters.type) filters.type = localFilters.type as OfferType;
    if (localFilters.minPrice) filters.minPrice = parseFloat(localFilters.minPrice);
    if (localFilters.maxPrice) filters.maxPrice = parseFloat(localFilters.maxPrice);
    if (localFilters.minMiles) filters.minMiles = parseInt(localFilters.minMiles);
    if (localFilters.maxMiles) filters.maxMiles = parseInt(localFilters.maxMiles);
    if (localFilters.sortBy) filters.sortBy = localFilters.sortBy as any;
    if (localFilters.sortOrder) filters.sortOrder = localFilters.sortOrder as any;

    onQueryChange(filters);
  };

  const clearFilters = () => {
    setLocalFilters({
      airlineId: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      minMiles: '',
      maxMiles: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    onQueryChange({
      airlineId: undefined,
      type: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minMiles: undefined,
      maxMiles: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Airline Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Companhia Aérea
          </label>
          <select
            value={localFilters.airlineId}
            onChange={(e) => handleFilterChange('airlineId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas</option>
            {airlines.map((airline) => (
              <option key={airline.id} value={airline.id}>
                {airline.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={localFilters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos</option>
            <option value="SALE">Venda</option>
            <option value="EXCHANGE">Troca</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordenar por
          </label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="createdAt">Data</option>
            <option value="price">Preço</option>
            <option value="milesAmount">Quantidade de Milhas</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordem
          </label>
          <select
            value={localFilters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="desc">Decrescente</option>
            <option value="asc">Crescente</option>
          </select>
        </div>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço mínimo (R$)
          </label>
          <input
            type="number"
            value={localFilters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço máximo (R$)
          </label>
          <input
            type="number"
            value={localFilters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Sem limite"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Miles Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Milhas mínimas
          </label>
          <input
            type="number"
            value={localFilters.minMiles}
            onChange={(e) => handleFilterChange('minMiles', e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Milhas máximas
          </label>
          <input
            type="number"
            value={localFilters.maxMiles}
            onChange={(e) => handleFilterChange('maxMiles', e.target.value)}
            placeholder="Sem limite"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Aplicar Filtros
        </button>
        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          Limpar
        </button>
      </div>
    </div>
  );
};