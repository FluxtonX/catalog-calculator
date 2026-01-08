import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon,
  trend,
  trendValue,
  iconBgColor = 'bg-emerald-500',
  className = ''
}) => {
  const isPositive = trend === 'up';
  
  return (
    <Card className={className} hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </h3>
          {trendValue && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`${iconBgColor} p-3 rounded-xl`}>
          {Icon && <Icon size={24} className="text-white" />}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;