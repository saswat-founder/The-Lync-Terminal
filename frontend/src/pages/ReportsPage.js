import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  FileText,
  Download,
  Eye,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockStartups } from '@/data/mockData';
import { formatDate, formatCurrency, formatPercentage } from '@/lib/formatters';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [startupFilter, setStartupFilter] = useState('all');

  // Generate mock reports
  const allReports = useMemo(() => {
    const reports = [];
    const months = ['January', 'February', 'March', 'April'];
    const year = 2026;
    
    mockStartups.slice(0, 20).forEach(startup => {
      months.forEach((month, idx) => {
        const reportDate = new Date(year, 3 - idx, 1); // April backwards
        reports.push({
          id: `report-${startup.id}-${idx}`,
          startupId: startup.id,
          startupName: startup.name,
          startupLogo: startup.logo,
          period: `${month} ${year}`,
          periodDate: reportDate.toISOString(),
          submittedDate: new Date(reportDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: idx === 0 ? 'submitted' : 'final',
          type: 'Monthly',
          revenue: startup.metrics.revenue * (1 + (Math.random() - 0.5) * 0.2),
          growth: startup.metrics.growthRate + (Math.random() - 0.5) * 10,
          runway: startup.metrics.runway + (Math.random() - 0.5) * 3,
          completeness: 85 + Math.floor(Math.random() * 15)
        });
      });
    });
    
    return reports.sort((a, b) => new Date(b.periodDate) - new Date(a.periodDate));
  }, []);

  const filteredReports = useMemo(() => {
    let result = [...allReports];
    
    if (searchQuery) {
      result = result.filter(r => 
        r.startupName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (startupFilter !== 'all') {
      result = result.filter(r => r.startupId === startupFilter);
    }
    
    if (periodFilter !== 'all') {
      result = result.filter(r => r.period.includes(periodFilter));
    }
    
    return result;
  }, [allReports, searchQuery, periodFilter, startupFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const thisMonth = allReports.filter(r => r.period.includes('April')).length;
    const submitted = allReports.filter(r => r.status === 'submitted').length;
    const avgCompleteness = Math.round(
      allReports.reduce((sum, r) => sum + r.completeness, 0) / allReports.length
    );
    
    return {
      total: allReports.length,
      thisMonth,
      submitted,
      avgCompleteness
    };
  }, [allReports]);

  const getTrendIcon = (growth) => {
    if (growth > 5) return <TrendingUp className="h-4 w-4 text-success" />;
    if (growth < -5) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Reports Archive</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historical reports and submission tracking
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-3xl font-semibold tabular-nums">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-3xl font-semibold tabular-nums">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recently Submitted</p>
                <p className="text-3xl font-semibold tabular-nums">{stats.submitted}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completeness</p>
                <p className="text-3xl font-semibold tabular-nums">{stats.avgCompleteness}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-base">All Reports</CardTitle>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by startup..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  <SelectItem value="April">April 2026</SelectItem>
                  <SelectItem value="March">March 2026</SelectItem>
                  <SelectItem value="February">February 2026</SelectItem>
                  <SelectItem value="January">January 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              filteredReports.map(report => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/report/${report.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img 
                      src={report.startupLogo} 
                      alt={report.startupName} 
                      className="h-10 w-10 rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{report.startupName}</p>
                        <Badge variant="outline" className="text-xs">
                          {report.type}
                        </Badge>
                        <Badge 
                          variant={report.status === 'submitted' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{report.period}</span>
                        <span>•</span>
                        <span>Submitted {formatDate(report.submittedDate)}</span>
                        <span>•</span>
                        <span>{report.completeness}% complete</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mr-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-sm font-semibold tabular-nums">
                        {formatCurrency(report.revenue, true)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Growth</p>
                      <div className="flex items-center justify-end gap-1">
                        {getTrendIcon(report.growth)}
                        <p className="text-sm font-semibold tabular-nums">
                          {formatPercentage(report.growth, 1, true)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Runway</p>
                      <p className="text-sm font-semibold tabular-nums">
                        {report.runway.toFixed(1)}m
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;