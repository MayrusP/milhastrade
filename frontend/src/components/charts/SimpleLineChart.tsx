import { useMemo } from 'react';

interface DataPoint {
  date: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  title: string;
  color: string;
  formatValue?: (value: number) => string;
  height?: number;
}

export const SimpleLineChart = ({ 
  data, 
  title, 
  color, 
  formatValue = (v) => v.toString(),
  height = 200 
}: SimpleLineChartProps) => {
  const { points, maxValue, minValue } = useMemo(() => {
    if (data.length === 0) return { points: [], maxValue: 0, minValue: 0 };

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    const width = 400;
    const chartHeight = height - 60; // Espaço para labels
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = chartHeight - ((point.value - min) / (max - min)) * chartHeight;
      return { x, y, value: point.value, date: point.date };
    });

    return { points, maxValue: max, minValue: min };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          Sem dados disponíveis
        </div>
      </div>
    );
  }

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h3>
      
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 400 ${height}`} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-600" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="400" height={height - 60} fill="url(#grid)" />
          
          {/* Área sob a linha */}
          <path
            d={`${pathData} L ${points[points.length - 1]?.x || 0} ${height - 60} L ${points[0]?.x || 0} ${height - 60} Z`}
            fill={color}
            fillOpacity="0.1"
          />
          
          {/* Linha principal */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Pontos */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={color}
                className="hover:r-6 transition-all cursor-pointer"
              />
              {/* Tooltip on hover */}
              <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <rect
                  x={point.x - 40}
                  y={point.y - 35}
                  width="80"
                  height="25"
                  fill="rgba(0,0,0,0.8)"
                  rx="4"
                />
                <text
                  x={point.x}
                  y={point.y - 18}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium"
                >
                  {formatValue(point.value)}
                </text>
              </g>
            </g>
          ))}
          
          {/* Labels do eixo Y */}
          <text x="-10" y="15" textAnchor="end" className="text-xs fill-gray-600 dark:fill-gray-400">
            {formatValue(maxValue)}
          </text>
          <text x="-10" y={height - 65} textAnchor="end" className="text-xs fill-gray-600 dark:fill-gray-400">
            {formatValue(minValue)}
          </text>
        </svg>
        
        {/* Labels do eixo X */}
        <div className="flex justify-between mt-2 px-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {data[0]?.date ? new Date(data[0].date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Últimos {data.length} dias
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {data[data.length - 1]?.date ? new Date(data[data.length - 1].date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}
          </span>
        </div>
      </div>
      
      {/* Estatísticas resumidas */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Máximo</p>
          <p className="font-semibold text-gray-900 dark:text-white">{formatValue(maxValue)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Mínimo</p>
          <p className="font-semibold text-gray-900 dark:text-white">{formatValue(minValue)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Média</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatValue(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
          </p>
        </div>
      </div>
    </div>
  );
};