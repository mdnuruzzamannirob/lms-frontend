"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRequireAuth } from "@/hooks/useAuth";
import {
  useGetPopularBooksQuery,
  useGetActiveMembersQuery,
  useGetCategoryDistributionQuery,
  useGetBorrowTrendsQuery,
  useGetRevenueReportQuery,
  useGetOverdueReportQuery,
} from "@/store/api/reportApi";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#e11d48",
  "#0891b2",
  "#ca8a04",
  "#4f46e5",
];

export default function ReportsPage() {
  useRequireAuth("admin");

  const { data: popularData, isLoading: loadingPopular } =
    useGetPopularBooksQuery();
  const { data: activeData, isLoading: loadingActive } =
    useGetActiveMembersQuery();
  const { data: catData, isLoading: loadingCat } =
    useGetCategoryDistributionQuery();
  const { data: trendData, isLoading: loadingTrend } =
    useGetBorrowTrendsQuery();
  const { data: revenueData, isLoading: loadingRevenue } =
    useGetRevenueReportQuery();
  const { data: overdueData, isLoading: loadingOverdue } =
    useGetOverdueReportQuery();

  const isLoading =
    loadingPopular ||
    loadingActive ||
    loadingCat ||
    loadingTrend ||
    loadingRevenue ||
    loadingOverdue;

  if (isLoading) return <PageLoader />;

  const popularBooks = popularData?.data || [];
  const activeMembers = activeData?.data || [];
  const categories = catData?.data || [];
  const trends = trendData?.data || [];
  const revenue = revenueData?.data;
  const overdue = overdueData?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Library analytics and statistics"
        icon={BarChart3}
      />

      {/* Revenue overview */}
      {revenue && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(revenue.totalRevenue)}
          />
          <StatsCard
            title="Paid Fines"
            value={formatCurrency(revenue.paidFines)}
          />
          <StatsCard
            title="Pending Fines"
            value={formatCurrency(revenue.pendingFines)}
          />
          <StatsCard
            title="Waived Fines"
            value={formatCurrency(revenue.waivedFines)}
          />
        </div>
      )}

      {overdue && (
        <Card>
          <CardHeader>
            <CardTitle>Overdue Books: {overdue.totalOverdue}</CardTitle>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Borrow Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="popular">Popular Books</TabsTrigger>
          <TabsTrigger value="active">Active Members</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Borrow Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {trends.length === 0 ? (
                <EmptyState title="No trend data" />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <EmptyState title="No category data" />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count }) =>
                        `${category} (${count})`
                      }
                      outerRadius={120}
                      dataKey="count"
                      nameKey="category"
                    >
                      {categories.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <CardTitle>Popular Books</CardTitle>
            </CardHeader>
            <CardContent>
              {popularBooks.length === 0 ? (
                <EmptyState title="No data" />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={popularBooks.map((pb) => ({
                      title:
                        pb.book?.title?.substring(0, 20) || "Unknown",
                      borrowCount: pb.borrowCount,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="borrowCount" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Most Active Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activeMembers.length === 0 ? (
                <EmptyState title="No data" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">
                        Borrows
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeMembers.map((am, i) => (
                      <TableRow key={i}>
                        <TableCell>{am.member?.membershipId}</TableCell>
                        <TableCell>
                          {(am.member?.user as any)?.name || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {am.borrowCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
