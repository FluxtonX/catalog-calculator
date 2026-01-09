import React from 'react';
import { DollarSign, Briefcase, Users, TrendingUp, Activity } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { usePageTitle } from '../hooks/usePageTitle';

const Dashboard = () => {
  usePageTitle('Dashboard', 'Your business analytics overview');
  
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

  // Get current time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-emerald-100 dark:border-emerald-800 shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={24} className="text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Live Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getGreeting()}, there! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your business today
          </p>
        </div>
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 dark:bg-emerald-500/10 rounded-full blur-3xl -z-0"></div>
      </div>

      {/* Quick Stats Overview */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Performance Metrics
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: Just now
        </div>
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

      {/* Additional Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>📊 New valuation report generated</p>
            <p>👤 3 new team members added</p>
            <p>💰 Revenue increased by 12.5%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-900 dark:text-white">
              📈 View Analytics
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-900 dark:text-white">
              🎵 New Valuation
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-900 dark:text-white">
              📧 Invite Team Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;