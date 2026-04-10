import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DollarSign,
  Clock,
  TrendingUp,
  Activity,
  Target,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Users,
  Send,
  Video,
  Phone,
  Folder,
  GitBranch,
  AlertTriangle,
  Circle,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatPercentage, formatDate, getChartColor } from '@/lib/formatters';
import MetricCard from '@/components/MetricCard';
import FinancialMetricsDashboard from '@/components/FinancialMetricsDashboard';

const FounderHome = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');

  // Mock data - in production comes from integrations
  const startup = user?.startup || {
    name: 'Your Startup',
    metrics: {
      cash: 1500000,
      runway: 18,
      mrr: 125000,
      revenue: 150000,
      growthRate: 15,
      burn: 75000,
      headcount: 12
    }
  };

  // Setup checklist
  const setupChecklist = [
    { id: 1, title: 'Connect remaining data sources', completed: true },
    { id: 2, title: 'Invite finance lead', completed: true },
    { id: 3, title: 'Review first draft investor update', completed: false },
    { id: 4, title: 'Add quarterly milestones', completed: false },
    { id: 5, title: 'Open stakeholder chat', completed: true },
  ];

  const completedCount = setupChecklist.filter(i => i.completed).length;
  const setupProgress = (completedCount / setupChecklist.length) * 100;

  // Financial data
  const financialData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      revenue: startup.metrics.revenue * (0.8 + i * 0.07),
      burn: startup.metrics.burn * (0.9 + i * 0.03),
      health: 70 + i * 3
    };
  });

  // Milestones
  const milestones = [
    { id: 1, title: 'Launch Enterprise Plan', target: 'Q2 2026', status: 'on-track', progress: 75 },
    { id: 2, title: 'Reach $2M ARR', target: 'Q3 2026', status: 'on-track', progress: 60 },
    { id: 3, title: 'Hire VP Sales', target: 'Q2 2026', status: 'at-risk', progress: 40 },
    { id: 4, title: 'Close Series A', target: 'Q4 2026', status: 'planning', progress: 20 }
  ];

  // Execution metrics
  const execution = {
    sprintProgress: 85,
    ticketsDue: 5,
    blockedIssues: 2,
    releaseCadence: '2 weeks',
    lastRelease: '3 days ago',
    prsOpen: 12,
    prsReviewed: 8
  };

  // Investor asks
  const investorAsks = [
    { id: 1, from: 'Sarah Chen', message: 'Can you share Q1 pipeline breakdown?', time: '2h ago', priority: 'high' },
    { id: 2, from: 'Michael Rodriguez', message: 'Update on Series A timeline?', time: '1d ago', priority: 'medium' },
    { id: 3, from: 'Board', message: 'Board meeting prep - April 15', time: '3d ago', priority: 'high' }
  ];

  // Activity feed
  const activityFeed = [
    { id: 1, type: 'integration', message: 'Zoho Books synced successfully', time: '10m ago', icon: CheckCircle2, color: 'text-success' },
    { id: 2, type: 'report', message: 'Monthly report draft ready for review', time: '2h ago', icon: FileText, color: 'text-primary' },
    { id: 3, type: 'milestone', message: 'Enterprise Plan progress updated to 75%', time: '5h ago', icon: Target, color: 'text-success' },
    { id: 4, type: 'chat', message: 'New message from Sarah Chen', time: '1d ago', icon: MessageSquare, color: 'text-primary' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with startup name and logo */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {startup.name?.charAt(0) || 'S'}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{startup.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Founder Dashboard • Your operating command center
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Start Call
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send Update
          </Button>
        </div>
      </div>

      {/* Setup Progress Banner */}
      {setupProgress < 100 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Complete your workspace setup</p>
              <Badge variant="outline">{completedCount} / {setupChecklist.length}</Badge>
            </div>
            <Progress value={setupProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Integrations Quick Access */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Connected Integrations</p>
                <p className="text-xs text-muted-foreground">
                  Zoho Books • HubSpot • Razorpay • GitHub
                </p>
              </div>
            </div>
            <Link to="/integrations">
              <Button size="sm" variant="outline" className="bg-white">
                Manage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <MetricCard
          title="Cash"
          value={startup.metrics.cash}
          format="currency-compact"
          icon={DollarSign}
          className="lg:col-span-1"
        />
        <MetricCard
          title="Runway"
          value={startup.metrics.runway}
          subtitle="months"
          format="number"
          icon={Clock}
          className="lg:col-span-1"
        />
        <MetricCard
          title="MRR"
          value={startup.metrics.mrr}
          format="currency-compact"
          change={startup.metrics.growthRate}
          trend="positive"
          icon={DollarSign}
          className="lg:col-span-1"
        />
        <MetricCard
          title="Growth"
          value={startup.metrics.growthRate}
          format="percentage"
          icon={TrendingUp}
          className="lg:col-span-1"
        />
        <MetricCard
          title="Burn"
          value={startup.metrics.burn}
          format="currency-compact"
          icon={Activity}
          className="lg:col-span-1"
        />
        <MetricCard
          title="Milestones"
          value={milestones.filter(m => m.status === 'on-track').length}
          subtitle={`of ${milestones.length}`}
          format="number"
          icon={Target}
          className="lg:col-span-1"
        />
        <MetricCard
          title="Open Asks"
          value={investorAsks.length}
          subtitle="from investors"
          format="number"
          icon={MessageSquare}
          className="lg:col-span-1"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Company Health Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Health Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="health" 
                    stroke={getChartColor(1)} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue and Burn Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue vs Burn</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => formatCurrency(value, true)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={getChartColor(0)} 
                    fill={getChartColor(0)}
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="burn" 
                    stroke={getChartColor(2)} 
                    fill={getChartColor(2)}
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Burn"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Execution */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Execution Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sprint Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current Sprint</span>
                  <Badge variant="outline">{execution.sprintProgress}%</Badge>
                </div>
                <Progress value={execution.sprintProgress} className="h-2" />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Tickets Due</p>
                  <p className="text-2xl font-semibold">{execution.ticketsDue}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Blocked Issues</p>
                  <p className="text-2xl font-semibold text-warning">{execution.blockedIssues}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">PRs Open</p>
                  <p className="text-2xl font-semibold">{execution.prsOpen}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">PRs Reviewed</p>
                  <p className="text-2xl font-semibold text-success">{execution.prsReviewed}</p>
                </div>
              </div>

              {/* Release Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Release Cadence</span>
                  <Badge>{execution.releaseCadence}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last release: {execution.lastRelease}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Latest Update Draft */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Latest Investor Update</CardTitle>
                <Badge variant="outline">Draft</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your monthly update draft is ready for review. Add commentary and submit.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Preview
                </Button>
                <Button size="sm" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Review & Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Communications */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="chat">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="tasks">
                    Tasks
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="mt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {/* Board Meeting Notice */}
                      <div className="p-3 border-l-2 border-primary rounded-lg bg-primary/5">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-primary mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Upcoming Board Meeting</p>
                            <p className="text-xs text-muted-foreground mt-1">April 15, 2026 • 10:00 AM</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Prepare Materials
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Investor Asks */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium mb-2">Investor Messages</p>
                        {investorAsks.map(ask => (
                          <div 
                            key={ask.id} 
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                              ask.priority === 'high' ? 'border-warning/50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-sm font-medium">{ask.from}</p>
                              <Badge variant="outline" className="text-xs">
                                {ask.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{ask.message}</p>
                            <p className="text-xs text-muted-foreground">{ask.time}</p>
                          </div>
                        ))}
                      </div>

                      {/* Overdue Tasks */}
                      <div className="p-3 border-l-2 border-destructive rounded-lg bg-destructive/5">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Overdue: Q1 Report</p>
                            <p className="text-xs text-muted-foreground mt-1">Due 2 days ago</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Complete Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="tasks" className="mt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {setupChecklist.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          {item.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Quarterly Milestones</CardTitle>
              <Button variant="outline" size="sm">
                <Target className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Milestone</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.map(milestone => (
                  <TableRow key={milestone.id}>
                    <TableCell className="font-medium">{milestone.title}</TableCell>
                    <TableCell>{milestone.target}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          milestone.status === 'on-track' ? 'border-success text-success' :
                          milestone.status === 'at-risk' ? 'border-warning text-warning' :
                          'border-muted-foreground text-muted-foreground'
                        }
                      >
                        {milestone.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={milestone.progress} className="h-2 w-20" />
                        <span className="text-sm font-medium">{milestone.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Financial Metrics Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialMetricsDashboard />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityFeed.map(activity => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Icon className={`h-5 w-5 ${activity.color} mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FounderHome;
