import { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import adminApi from '../services/api';
import type { Stats } from '../services/api';
import { BarChart3, Users, Tag, CheckCircle, FileText } from 'lucide-react';

export function DashboardPage() {
  const { token } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats(token);
        setStats(response.data || response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Verified Users',
      value: stats?.verifiedUsers || 0,
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Admin Users',
      value: stats?.adminUsers || 0,
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Total Confessions',
      value: stats?.totalConfessions || 0,
      icon: FileText,
      color: 'orange',
    },
    {
      label: 'Categories',
      value: stats?.totalCategories || 0,
      icon: Tag,
      color: 'pink',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorClass = colorClasses[card.color as keyof typeof colorClasses];

          return (
            <div
              key={card.label}
              className={`${colorClass} border rounded-lg p-6 flex items-start justify-between`}
            >
              <div>
                <p className="text-sm font-medium opacity-75">{card.label}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <Icon className="w-8 h-8 opacity-50" />
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Quick Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">User Verification Rate</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${
                      stats
                        ? Math.round(
                            (stats.verifiedUsers / stats.totalUsers) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="font-semibold">
                {stats
                  ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Admin Count</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats?.adminUsers || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
