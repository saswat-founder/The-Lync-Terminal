import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Circle, 
  RefreshCw, 
  Settings, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Code,
  FileText,
  Zap
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const IntegrationsPage = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState({
    zoho: { status: 'disconnected', lastSync: null },
    hubspot: { status: 'disconnected', lastSync: null },
    razorpay: { status: 'disconnected', lastSync: null },
    github: { status: 'disconnected', lastSync: null }
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});

  const integrations = [
    {
      id: 'zoho',
      name: 'Zoho Books',
      description: 'Financial data, invoices, expenses, and cash flow tracking',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      metrics: ['Cash Balance', 'Revenue', 'Burn Rate', 'Runway'],
      authType: 'oauth',
      category: 'Financial'
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      description: 'Sales pipeline, contacts, companies, and deal tracking',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      metrics: ['Pipeline Value', 'Deal Stages', 'Contacts', 'Companies'],
      authType: 'oauth',
      category: 'Sales & CRM'
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Payment transactions, subscriptions, and revenue metrics',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      metrics: ['MRR', 'ARR', 'Transactions', 'Churn'],
      authType: 'api_key',
      category: 'Payments'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Code metrics, commits, pull requests, and contributor activity',
      icon: Code,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      metrics: ['Commits', 'PRs', 'Contributors', 'Velocity'],
      authType: 'oauth',
      category: 'Engineering'
    }
  ];

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  const fetchConnectionStatus = async () => {
    setLoading(true);
    try {
      // Fetch connection status for each integration
      const orgId = 'default_org'; // TODO: Get from auth context
      
      const statuses = await Promise.all(
        integrations.map(async (integration) => {
          try {
            const response = await fetch(
              `${BACKEND_URL}/api/auth/${integration.id}/status?organization_id=${orgId}`
            );
            const data = await response.json();
            return {
              id: integration.id,
              status: data.connected ? 'connected' : 'disconnected',
              lastSync: data.last_updated || null,
              details: data
            };
          } catch (error) {
            console.error(`Error fetching ${integration.id} status:`, error);
            return {
              id: integration.id,
              status: 'disconnected',
              lastSync: null
            };
          }
        })
      );

      const newConnections = {};
      statuses.forEach(status => {
        newConnections[status.id] = status;
      });
      setConnections(newConnections);
    } catch (error) {
      console.error('Error fetching connection statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integration) => {
    const orgId = 'default_org'; // TODO: Get from auth context
    
    if (integration.authType === 'oauth') {
      // OAuth flow
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/auth/${integration.id}/authorize?organization_id=${orgId}`
        );
        const data = await response.json();
        
        if (data.auth_url) {
          // Open OAuth popup
          const width = 600;
          const height = 700;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          
          const popup = window.open(
            data.auth_url,
            `${integration.name} Authorization`,
            `width=${width},height=${height},left=${left},top=${top}`
          );

          // Listen for OAuth callback
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
              // Refresh connection status
              fetchConnectionStatus();
            }
          }, 1000);
        }
      } catch (error) {
        console.error(`Error connecting to ${integration.name}:`, error);
      }
    } else if (integration.authType === 'api_key') {
      // API key flow - show modal
      navigate(`/integrations/${integration.id}/setup`);
    }
  };

  const handleSync = async (integrationId) => {
    setSyncing(prev => ({ ...prev, [integrationId]: true }));
    try {
      const orgId = 'default_org';
      const response = await fetch(
        `${BACKEND_URL}/api/${integrationId}/sync?organization_id=${orgId}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        // Refresh status after a short delay
        setTimeout(() => {
          fetchConnectionStatus();
          setSyncing(prev => ({ ...prev, [integrationId]: false }));
        }, 2000);
      }
    } catch (error) {
      console.error(`Error syncing ${integrationId}:`, error);
      setSyncing(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleDisconnect = async (integrationId) => {
    if (!window.confirm('Are you sure you want to disconnect this integration?')) {
      return;
    }

    try {
      const orgId = 'default_org';
      await fetch(
        `${BACKEND_URL}/api/auth/${integrationId}/disconnect?organization_id=${orgId}`,
        { method: 'DELETE' }
      );
      fetchConnectionStatus();
    } catch (error) {
      console.error(`Error disconnecting ${integrationId}:`, error);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'connected') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-gray-600">
        <Circle className="h-3 w-3 mr-1" />
        Not Connected
      </Badge>
    );
  };

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your business tools to automatically track metrics and monitor progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Connected</p>
                  <p className="text-2xl font-bold">
                    {Object.values(connections).filter(c => c.status === 'connected').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available</p>
                  <p className="text-2xl font-bold">{integrations.length}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Sync</p>
                  <p className="text-sm font-medium">
                    {Object.values(connections).some(c => c.lastSync) 
                      ? formatLastSync(
                          Math.max(...Object.values(connections)
                            .filter(c => c.lastSync)
                            .map(c => new Date(c.lastSync).getTime()))
                        )
                      : 'Never'
                    }
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data Points</p>
                  <p className="text-2xl font-bold">
                    {Object.values(connections).filter(c => c.status === 'connected').length * 4}+
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert for setup */}
        {Object.values(connections).every(c => c.status === 'disconnected') && (
          <Alert className="mb-8 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Get started:</strong> Connect your first integration to start tracking metrics automatically.
              All connections are secure and encrypted.
            </AlertDescription>
          </Alert>
        )}

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const connection = connections[integration.id];
            const isConnected = connection?.status === 'connected';
            const isSyncing = syncing[integration.id];

            return (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${integration.bgColor}`}>
                        <Icon className={`h-6 w-6 ${integration.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{integration.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    {getStatusBadge(connection?.status)}
                  </div>
                  <CardDescription className="mt-3">
                    {integration.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Metrics Preview */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">
                      Key Metrics:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {integration.metrics.map((metric) => (
                        <Badge 
                          key={metric} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Last Sync Info */}
                  {isConnected && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last synced:</span>
                        <span className="font-medium">
                          {formatLastSync(connection.lastSync)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isConnected ? (
                      <Button 
                        onClick={() => handleConnect(integration)}
                        className="flex-1"
                        disabled={loading}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleSync(integration.id)}
                          variant="outline"
                          className="flex-1"
                          disabled={isSyncing}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                          {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </Button>
                        <Button
                          onClick={() => navigate(`/integrations/${integration.id}`)}
                          variant="outline"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDisconnect(integration.id)}
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          Disconnect
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Setup Guide Link */}
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Need help getting started?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Follow our comprehensive setup guide to obtain API credentials and connect your first integration.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('/INTEGRATION_SETUP_GUIDE.md', '_blank')}
                >
                  View Setup Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsPage;
