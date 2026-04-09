import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  Wallet,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
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

  const financialData = {
    cash_balance: metrics.cash_balance || 0,
    monthly_revenue: metrics.monthly_revenue || 0,
    burn_rate: metrics.burn_rate || 0,
    runway_months: metrics.runway_months || 0,
    mrr: metrics.mrr || 0,
    arr: metrics.arr || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Real-time financial data from Zoho Books
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-blue-50">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Cash Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(financialData.cash_balance)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Monthly Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(financialData.monthly_revenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-orange-50">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Monthly Burn</p>
            <p className="text-2xl font-bold">{formatCurrency(financialData.burn_rate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-lg ${financialData.runway_months < 6 ? 'bg-red-50' : 'bg-purple-50'}`}>
                <Calendar className={`h-5 w-5 ${financialData.runway_months < 6 ? 'text-red-600' : 'text-purple-600'}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Runway</p>
            <p className="text-2xl font-bold">
              {financialData.runway_months ? `${financialData.runway_months}mo` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(financialData.mrr)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(financialData.arr)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialMetricsDashboard;
