import React from 'react';
import { DollarSign, Briefcase, Users, TrendingUp } from 'lucide-react';
import StatCard from '../components/common/StatCard';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$124,592',
      icon: DollarSign,
      trend: 'up',
      trendValue: '+12.5%',
      iconBgColor: 'bg-green-500'
    },
    {
      title: 'Active Projects',
      value: '23',
      icon: Briefcase,
      trend: 'up',
      trendValue: '+3',
      iconBgColor: 'bg-blue-500'
    },
    {
      title: 'Total Clients',
      value: '156',
      icon: Users,
      trend: 'up',
      trendValue: '+8.2%',
      iconBgColor: 'bg-purple-500'
    },
    {
      title: 'Conversion Rate',
      value: '68%',
      icon: TrendingUp,
      trend: 'down',
      trendValue: '-2.1%',
      iconBgColor: 'bg-orange-500'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-emerald-100 dark:border-emerald-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Good afternoon, there! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your Business Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendValue={stat.trendValue}
            iconBgColor={stat.iconBgColor}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;