import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const FinancialMetricsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [zohoConnected, setZohoConnected] = useState(false);

  const orgId = user?.organization_id || user?.id || 'default_org';

  useEffect(() => {
    fetchFinancialMetrics();
    checkZohoConnection();
  }, [orgId]);

  const checkZohoConnection = async () => {
    try {
      const response = await api.integrations.zoho.getStatus(orgId);
      setZohoConnected(response.data.connected);
    } catch (err) {
      console.error('Failed to check Zoho connection:', err);
    }
  };

  const fetchFinancialMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.financial.getOverview(orgId);
      setMetrics(response.data);
    } catch (err) {
      console.error('Error fetching financial metrics:', err);
      setError(err.response?.data?.detail || 'Failed to load financial data');
      
      // If error is due to no Zoho connection, show appropriate message
      if (err.response?.status === 404 || err.response?.status === 400) {
        setError('No financial data available. Please connect Zoho Books.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      await fetchFinancialMetrics();
      toast.success('Financial data refreshed');
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !zohoConnected) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Zoho Books is not connected. Please connect it to view financial metrics.'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/integrations')}>
          <LinkIcon className="w-4 h-4 mr-2" />
          Go to Integrations
        </Button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No financial data available yet. Data will appear after Zoho Books syncs.
        </AlertDescription>
      </Alert>
    );
  }

  // Mock data structure for display (would come from API)
  const financialData = {
    cash_balance: metrics.cash_balance || 0,
    monthly_revenue: metrics.monthly_revenue || 0,
    burn_rate: metrics.burn_rate || 0,
    runway_months: metrics.runway_months || 0,
    mrr: metrics.mrr || 0,
    arr: metrics.arr || 0,
    growth_rate: metrics.growth_rate || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Real-time financial data from Zoho Books
            <Badge variant="outline" className="ml-2">Live Data</Badge>
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={syncing}
        >
          {syncing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing</>
          ) : (
            <><RefreshCw className="w-4 h-4 mr-2" /> Refresh</>
          )}
        </Button>
      </div>
    setSyncing(true);
    await fetchAllMetrics();
    setSyncing(false);
  };

  // Aggregate metrics from all sources
  const aggregated = {
    totalRevenue: (
      (metrics.zoho?.total_revenue_month || 0) +
      (metrics.razorpay?.revenue_mtd || 0)
    ),
    totalCash: metrics.zoho?.cash_balance || 0,
    mrr: (
      (metrics.razorpay?.mrr || 0) +
      (metrics.hubspot?.monthly_recurring_revenue || 0)
    ),
    arr: (
      (metrics.razorpay?.arr || 0) +
      (metrics.hubspot?.annual_recurring_revenue || 0)
    ),
    burnRate: metrics.zoho?.burn_rate_monthly || 0,
    runway: metrics.zoho?.runway_months || null,
    pipelineValue: metrics.hubspot?.pipeline_value || 0
  };

  // Mock historical data for charts (replace with real data from backend)
  const revenueHistory = [
    { month: 'Jan', revenue: 45000, expenses: 38000 },
    { month: 'Feb', revenue: 52000, expenses: 39000 },
    { month: 'Mar', revenue: 61000, expenses: 41000 },
    { month: 'Apr', revenue: 73000, expenses: 43000 },
    { month: 'May', revenue: 85000, expenses: 45000 },
    { month: 'Jun', revenue: 98000, expenses: 47000 }
  ];

  const cashFlowData = [
    { month: 'Jan', cash: 150000 },
    { month: 'Feb', cash: 163000 },
    { month: 'Mar', cash: 183000 },
    { month: 'Apr', cash: 213000 },
    { month: 'May', cash: 253000 },
    { month: 'Jun', cash: 304000 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend, description, color = 'blue' }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      orange: 'text-orange-600 bg-orange-50',
      purple: 'text-purple-600 bg-purple-50',
      red: 'text-red-600 bg-red-50'
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className={`h-5 w-5 ${colorClasses[color].split(' ')[0]}`} />
            </div>
            {change && (
              <Badge variant={trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {change}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold mb-1">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Aggregated data from Zoho Books, Razorpay, and HubSpot
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={syncing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue (MTD)"
          value={formatCurrency(aggregated.totalRevenue)}
          change="+23%"
          trend="up"
          icon={DollarSign}
          description="Zoho + Razorpay"
          color="green"
        />
        
        <MetricCard
          title="Cash Balance"
          value={formatCurrency(aggregated.totalCash)}
          change="+12%"
          trend="up"
          icon={Wallet}
          description={aggregated.runway ? `${Math.round(aggregated.runway)} months runway` : 'From Zoho Books'}
          color="blue"
        />
        
        <MetricCard
          title="MRR"
          value={formatCurrency(aggregated.mrr)}
          change="+18%"
          trend="up"
          icon={TrendingUp}
          description="Recurring revenue"
          color="purple"
        />
        
        <MetricCard
          title="Monthly Burn"
          value={formatCurrency(aggregated.burnRate)}
          icon={CreditCard}
          description="From Zoho Books"
          color="orange"
        />
      </div>

      {/* ARR & Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ARR & Pipeline</CardTitle>
            <CardDescription>Annual recurring revenue and sales pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Annual Recurring Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(aggregated.arr)}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +24%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sales Pipeline Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(aggregated.pipelineValue)}</p>
                </div>
                <Badge variant="outline">HubSpot</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Runway & Burn Rate</CardTitle>
            <CardDescription>Cash runway and spending analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cash Runway</p>
                  <p className="text-2xl font-bold">
                    {aggregated.runway ? `${Math.round(aggregated.runway)} months` : 'N/A'}
                  </p>
                </div>
                {aggregated.runway && aggregated.runway < 6 && (
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Net Burn Rate</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(metrics.zoho?.net_burn_rate_monthly || 0)}/mo
                  </p>
                </div>
                <Badge variant="outline">Zoho</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue vs Expenses</TabsTrigger>
          <TabsTrigger value="cash">Cash Flow</TabsTrigger>
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Expenses</CardTitle>
              <CardDescription>Monthly revenue vs operational expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="expenses" fill="#f59e0b" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Balance Over Time</CardTitle>
              <CardDescription>Historical cash position</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="cash" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCash)" name="Cash Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MRR Growth Trend</CardTitle>
              <CardDescription>Monthly recurring revenue growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Sources */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Data sources:</span>
            <div className="flex gap-2">
              <Badge variant="outline">Zoho Books</Badge>
              <Badge variant="outline">Razorpay</Badge>
              <Badge variant="outline">HubSpot CRM</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialMetricsDashboard;
