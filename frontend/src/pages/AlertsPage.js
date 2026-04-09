import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, AlertTriangle, Info, Bell, Check, Loader2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';
import AlertCard from '@/components/AlertCard';
import { toast } from 'sonner';
import api from '../services/api';

const AlertsPage = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch alerts from backend
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await api.alerts.getAlerts({ limit: 50 });
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  // Collect all non-dismissed alerts
  const allAlerts = alerts
    .filter(a => !dismissedAlerts.includes(a.id))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const criticalAlerts = allAlerts.filter(a => a.severity === 'critical');
  const warningAlerts = allAlerts.filter(a => a.severity === 'warning');
  const infoAlerts = allAlerts.filter(a => a.severity === 'info');

  const displayAlerts = (() => {
    switch (activeTab) {
      case 'critical':
        return criticalAlerts;
      case 'warning':
        return warningAlerts;
      case 'info':
        return infoAlerts;
      default:
        return allAlerts;
    }
  })();

  const handleDismiss = async (alertId) => {
    try {
      await api.alerts.markAsRead(alertId);
      setDismissedAlerts(prev => [...prev, alertId]);
      toast.success('Alert dismissed');
      fetchAlerts(); // Refresh to get updated data
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      toast.error('Failed to dismiss alert');
    }
  };

  const handleDismissAll = async () => {
    try {
      await api.alerts.markAllAsRead();
      const allAlertIds = displayAlerts.map(a => a.id);
      setDismissedAlerts(prev => [...prev, ...allAlertIds]);
      toast.success(`${displayAlerts.length} alerts dismissed`);
      fetchAlerts(); // Refresh
    } catch (error) {
      console.error('Failed to dismiss all alerts:', error);
      toast.error('Failed to dismiss alerts');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Alerts & Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor critical issues and important updates across your portfolio
          </p>
        </div>
        {displayAlerts.length > 0 && (
          <Button onClick={handleDismissAll} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Dismiss All
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setActiveTab('all')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-3xl font-semibold tabular-nums">{allAlerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setActiveTab('critical')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-3xl font-semibold text-destructive tabular-nums">{criticalAlerts.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setActiveTab('warning')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-3xl font-semibold text-warning tabular-nums">{warningAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setActiveTab('info')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Info</p>
                <p className="text-3xl font-semibold text-primary tabular-nums">{infoAlerts.length}</p>
              </div>
              <Info className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({allAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="critical">
                Critical ({criticalAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="warning">
                Warning ({warningAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="info">
                Info ({infoAlerts.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {displayAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No alerts</h3>
              <p className="text-sm text-muted-foreground">
                You're all caught up! No {activeTab !== 'all' ? activeTab : ''} alerts to review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayAlerts.map(alert => (
                <div key={alert.id}>
                  <div 
                    className="flex items-center gap-2 mb-2 cursor-pointer hover:underline"
                    onClick={() => navigate(`/startup/${alert.startupId}`)}
                  >
                    <img 
                      src={alert.startupLogo} 
                      alt={alert.startupName} 
                      className="h-6 w-6 rounded"
                    />
                    <span className="text-sm font-medium">{alert.startupName}</span>
                  </div>
                  <AlertCard alert={alert} onDismiss={handleDismiss} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPage;