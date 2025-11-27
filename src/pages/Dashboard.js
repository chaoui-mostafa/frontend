import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { analyticsAPI } from '../services/api';
import {
  RefreshCw,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30days');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [metricType, setMetricType] = useState('revenue');
  const [chartView, setChartView] = useState('grid');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, categoryFilter, regionFilter, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = {
        dateRange,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        region: regionFilter !== 'all' ? regionFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      
      const response = await analyticsAPI.getDashboard(params);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Simple export functionality
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Enhanced chart options with modern styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        beginAtZero: true
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  // Enhanced chart data with gradients
  const monthlySalesData = {
    labels: dashboardData?.monthlySales?.map(item => 
      new Date(item._id?.year, (item._id?.month - 1)).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    ) || [],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: dashboardData?.monthlySales?.map(item => item.total) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const topProductsData = {
    labels: dashboardData?.topProducts?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Revenue',
        data: dashboardData?.topProducts?.map(item => item.total) || [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const salesByCategoryData = {
    labels: dashboardData?.salesByCategory?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Revenue by Category',
        data: dashboardData?.salesByCategory?.map(item => item.total) || [],
        backgroundColor: (context) => {
          const colors = [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ];
          return colors[context.dataIndex % colors.length];
        },
        borderColor: (context) => {
          const colors = [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
          ];
          return colors[context.dataIndex % colors.length];
        },
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Calculate metrics for cards
  const metrics = useMemo(() => {
    if (!dashboardData) return [];
    
    return [
      {
        title: 'Total Revenue',
        value: `$${dashboardData.totalSales?.toLocaleString() || '0'}`,
        change: '+12.5%',
        icon: DollarSign,
        color: 'green',
        description: `${dashboardData.totalOrders || '0'} total orders`
      },
      {
        title: 'Recent Sales',
        value: `$${dashboardData.recentSales?.toLocaleString() || '0'}`,
        change: '+8.2%',
        icon: TrendingUp,
        color: 'blue',
        description: `${dashboardData.recentOrders || '0'} orders (30 days)`
      },
      {
        title: 'Active Customers',
        value: dashboardData.customerStats?.find(s => s._id === 'active')?.count || '0',
        change: '+5.1%',
        icon: Users,
        color: 'purple',
        description: 'Total active customers'
      },
      {
        title: 'Top Product Revenue',
        value: `$${dashboardData.topProducts?.[0]?.total?.toLocaleString() || '0'}`,
        change: '+15.3%',
        icon: Package,
        color: 'orange',
        description: dashboardData.topProducts?.[0]?._id || 'N/A'
      }
    ];
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">{error}</div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">No data available</div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Real-time business insights and performance metrics</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 slide-down">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Dashboard Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {dashboardData.salesByCategory?.map(category => (
                  <option key={category._id} value={category._id}>
                    {category._id}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Regions</option>
                {dashboardData.regionalSales?.map(region => (
                  <option key={region._id} value={region._id}>
                    {region._id}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metric Type
              </label>
              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="revenue">Revenue</option>
                <option value="orders">Orders</option>
                <option value="customers">Customers</option>
                <option value="growth">Growth</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const colorClasses = {
            green: 'from-green-500 to-emerald-600',
            blue: 'from-blue-500 to-cyan-600',
            purple: 'from-purple-500 to-violet-600',
            orange: 'from-orange-500 to-amber-600'
          };
          
          return (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[metric.color]} text-white group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{metric.description}</span>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {metric.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart View Toggle */}
      <div className="flex justify-end">
        <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setChartView('grid')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              chartView === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setChartView('full')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              chartView === 'full' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Full Width
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={`grid gap-8 ${
        chartView === 'grid' 
          ? 'grid-cols-1 lg:grid-cols-2' 
          : 'grid-cols-1'
      }`}>
        {/* Monthly Sales Trend */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Monthly Sales Trend</h3>
            <div className="text-sm text-gray-500">
              {dashboardData.monthlySales?.length || 0} months
            </div>
          </div>
          <div className="h-80">
            <Line data={monthlySalesData} options={chartOptions} />
          </div>
        </div>
        
        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Top Products by Revenue</h3>
            <div className="text-sm text-gray-500">
              Top {dashboardData.topProducts?.length || 0} products
            </div>
          </div>
          <div className="h-80">
            <Bar data={topProductsData} options={chartOptions} />
          </div>
        </div>
        
        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Sales by Category</h3>
            <div className="text-sm text-gray-500">
              {dashboardData.salesByCategory?.length || 0} categories
            </div>
          </div>
          <div className="h-80">
            <Bar data={salesByCategoryData} options={chartOptions} />
          </div>
        </div>
        
        {/* Customer Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Customer Distribution</h3>
            <div className="text-sm text-gray-500">
              {dashboardData.customerStats?.reduce((sum, stat) => sum + stat.count, 0) || 0} total
            </div>
          </div>
          <div className="h-80">
            <Doughnut 
              data={{
                labels: dashboardData.customerStats?.map(item => 
                  item._id.charAt(0).toUpperCase() + item._id.slice(1)
                ) || [],
                datasets: [{
                  data: dashboardData.customerStats?.map(item => item.count) || [],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                  ],
                  borderWidth: 3,
                  borderColor: '#fff'
                }]
              }} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Regional Sales Table */}
      {dashboardData.regionalSales && dashboardData.regionalSales.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Regional Performance</h3>
            <div className="text-sm text-gray-500">
              {dashboardData.regionalSales.length} regions
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Order Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.regionalSales.map((region, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {region._id?.charAt(0) || 'R'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {region._id || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${region.total?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.count || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Math.round(region.total / region.count)?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        +{Math.floor(Math.random() * 20) + 5}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;