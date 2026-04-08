import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { activityFeed } from '@/data/mockData';
import ActivityFeedItem from '@/components/ActivityFeedItem';
import { Activity, TrendingUp, AlertTriangle, FileText } from 'lucide-react';

const LiveFeedPage = () => {
  const recentActivity = activityFeed.slice(0, 50);
  
  const todayActivity = recentActivity.filter(a => {
    const activityDate = new Date(a.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString();
  });

  const thisWeekActivity = recentActivity.filter(a => {
    const activityDate = new Date(a.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return activityDate > weekAgo;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Live Feed</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time activity stream across your portfolio
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-3xl font-semibold tabular-nums">{todayActivity.length}</p>
                <p className="text-xs text-muted-foreground mt-1">events</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-3xl font-semibold tabular-nums">{thisWeekActivity.length}</p>
                <p className="text-xs text-muted-foreground mt-1">events</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">All Time</p>
                <p className="text-3xl font-semibold tabular-nums">{recentActivity.length}</p>
                <p className="text-xs text-muted-foreground mt-1">events tracked</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {recentActivity.map(activity => (
                <ActivityFeedItem 
                  key={activity.id} 
                  activity={activity}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveFeedPage;