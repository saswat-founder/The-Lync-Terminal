import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Building2, 
  Settings, 
  Plus,
  Mail,
  UserPlus,
  Shield
} from 'lucide-react';
import { mockStartups, mockUsers, STAGES, SECTORS } from '@/data/mockData';
import { formatDate, formatCurrency } from '@/lib/formatters';
import HealthBadge from '@/components/HealthBadge';
import { toast } from 'sonner';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('cohorts');

  // Group startups into cohorts
  const cohorts = [
    {
      id: 'cohort-1',
      name: 'StartupTN Batch 2025',
      startups: mockStartups.filter((_, idx) => idx < 15),
      created: '2025-01-15',
      status: 'active'
    },
    {
      id: 'cohort-2',
      name: 'StartupTN Batch 2024',
      startups: mockStartups.filter((_, idx) => idx >= 15 && idx < 30),
      created: '2024-06-20',
      status: 'active'
    },
    {
      id: 'cohort-3',
      name: 'StartupTN Batch 2023',
      startups: mockStartups.filter((_, idx) => idx >= 30),
      created: '2023-09-10',
      status: 'archived'
    }
  ];

  const handleInviteUser = () => {
    toast.success('Invitation sent!', {
      description: 'User will receive an email to join the platform.'
    });
  };

  const handleCreateCohort = () => {
    toast.success('Cohort created!', {
      description: 'You can now add startups to this cohort.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage cohorts, users, and platform settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleInviteUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
          <Button onClick={handleCreateCohort}>
            <Plus className="h-4 w-4 mr-2" />
            New Cohort
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Cohorts</p>
                <p className="text-3xl font-semibold tabular-nums">
                  {cohorts.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Startups</p>
                <p className="text-3xl font-semibold tabular-nums">{mockStartups.length}</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Users</p>
                <p className="text-3xl font-semibold tabular-nums">{mockUsers.length}</p>
              </div>
              <Shield className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
                <p className="text-3xl font-semibold tabular-nums">3</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-4">
          {cohorts.map(cohort => (
            <Card key={cohort.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{cohort.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created {formatDate(cohort.created)} • {cohort.startups.length} startups
                    </p>
                  </div>
                  <Badge variant={cohort.status === 'active' ? 'default' : 'outline'}>
                    {cohort.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Startup</TableHead>
                        <TableHead className="font-semibold">Stage</TableHead>
                        <TableHead className="font-semibold">Sector</TableHead>
                        <TableHead className="font-semibold">Health</TableHead>
                        <TableHead className="text-right font-semibold">Revenue</TableHead>
                        <TableHead className="text-right font-semibold">Runway</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cohort.startups.slice(0, 5).map(startup => (
                        <TableRow key={startup.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img src={startup.logo} alt={startup.name} className="h-6 w-6 rounded" />
                              <span className="font-medium">{startup.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{startup.stage}</Badge>
                          </TableCell>
                          <TableCell>{startup.sector}</TableCell>
                          <TableCell>
                            <HealthBadge health={startup.health} />
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(startup.metrics.revenue, true)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {startup.metrics.runway.toFixed(1)}m
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {cohort.startups.length > 5 && (
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    + {cohort.startups.length - 5} more startups
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.title}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-success text-success-foreground">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Platform Name</label>
                <Input defaultValue="Startup Intel" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Default Reporting Cycle</label>
                <Input defaultValue="Monthly" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Notification Email</label>
                <Input type="email" defaultValue="admin@startuptn.com" />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send email alerts for critical events</p>
                </div>
                <Badge variant="default" className="bg-success">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Auto-reporting</p>
                  <p className="text-sm text-muted-foreground">Generate reports automatically from integrations</p>
                </div>
                <Badge variant="default" className="bg-success">Enabled</Badge>
              </div>
              
              <div className="pt-4">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;