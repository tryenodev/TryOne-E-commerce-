'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/customer/PageHeader';
import { StatCard } from '@/components/customer/StatCard';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { AlertBanner } from '@/components/customer/AlertBanner';
import { formatINR } from '@/lib/format';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface SalesData {
  summary: {
    totalSales: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
    totalOrders: number;
    averageOrderValue: number;
    todaySales: number;
    todayCost: number;
    todayProfit: number;
    todayOrders: number;
    thisMonthSales: number;
    thisMonthCost: number;
    thisMonthProfit: number;
    thisMonthOrders: number;
  };
  daily: Array<{ date: string; sales: number; orders: number; cost: number; profit: number }>;
  monthly: Array<{ month: string; sales: number; orders: number; cost: number; profit: number }>;
  yearly: Array<{ year: string; sales: number; orders: number; cost: number; profit: number }>;
}

function formatTooltipCurrency(value: ValueType | undefined) {
  const amount =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : NaN;

  return Number.isFinite(amount) ? formatINR(amount) : formatINR(0);
}

function formatAxisINR(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

export default function AnalyticsPage() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    fetch('/api/analytics/sales')
      .then((r) => r.json())
      .then((data) => {
        if (data.summary) setSalesData(data);
        else setError('Failed to load analytics');
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading analytics..." />;

  if (!salesData) {
    return (
      <>
        <PageHeader title="Sales analytics" description="Revenue, profit, and order trends" />
        {error && <AlertBanner variant="error" message={error} />}
      </>
    );
  }

  const getChartData = () => {
    switch (viewMode) {
      case 'daily':
        return salesData.daily.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: item.sales,
          cost: item.cost,
          profit: item.profit,
          orders: item.orders,
        }));
      case 'monthly':
        return salesData.monthly.map(item => ({
          name: new Date(item.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          sales: item.sales,
          cost: item.cost,
          profit: item.profit,
          orders: item.orders,
        }));
      case 'yearly':
        return salesData.yearly.map(item => ({
          name: item.year,
          sales: item.sales,
          cost: item.cost,
          profit: item.profit,
          orders: item.orders,
        }));
    }
  };

  return (
    <>
      <PageHeader
        title="Sales analytics"
        description="Revenue, profit, and order trends across your store"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Total revenue" value={formatINR(salesData.summary.totalSales)} accent="emerald" hint="All time" />
        <StatCard label="Total profit" value={formatINR(salesData.summary.totalProfit)} accent="sky" hint={`${salesData.summary.profitMargin.toFixed(1)}% margin`} />
        <StatCard label="Total cost" value={formatINR(salesData.summary.totalCost)} accent="amber" />
        <StatCard
          label="Total orders"
          value={salesData.summary.totalOrders}
          accent="violet"
          hint={`${formatINR(salesData.summary.averageOrderValue)} avg`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Today</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Sales</p>
              <p className="font-bold text-emerald-600 tabular-nums">{formatINR(salesData.summary.todaySales)}</p>
            </div>
            <div>
              <p className="text-slate-500">Profit</p>
              <p className="font-bold text-sky-600 tabular-nums">{formatINR(salesData.summary.todayProfit)}</p>
            </div>
            <div>
              <p className="text-slate-500">Orders</p>
              <p className="font-bold text-violet-600 tabular-nums">{salesData.summary.todayOrders}</p>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">This month</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Sales</p>
              <p className="font-bold text-emerald-600 tabular-nums">{formatINR(salesData.summary.thisMonthSales)}</p>
            </div>
            <div>
              <p className="text-slate-500">Profit</p>
              <p className="font-bold text-sky-600 tabular-nums">{formatINR(salesData.summary.thisMonthProfit)}</p>
            </div>
            <div>
              <p className="text-slate-500">Orders</p>
              <p className="font-bold text-violet-600 tabular-nums">{salesData.summary.thisMonthOrders}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Sales overview</h2>
          <div className="flex flex-wrap gap-2">
            {(['daily', 'monthly', 'yearly'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === mode
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {mode === 'daily' ? 'Daily (30d)' : mode === 'monthly' ? 'Monthly (12m)' : 'Yearly'}
              </button>
            ))}
          </div>
        </div>

            {/* Revenue and Profit Chart */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue and Profit</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={formatAxisINR}
                  />
                  <Tooltip
                    formatter={formatTooltipCurrency}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                    labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cost Chart */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={formatAxisINR}
                  />
                  <Tooltip
                    formatter={formatTooltipCurrency}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                    labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: '#f97316', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Cost"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue vs Cost vs Profit per Period */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Cost vs Profit</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={formatAxisINR}
                  />
                  <Tooltip
                    formatter={formatTooltipCurrency}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                    labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="#10b981"
                    name="Revenue"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="cost"
                    fill="#f97316"
                    name="Cost"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    fill="#3b82f6"
                    name="Profit"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Orders Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Volume</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                    labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar
                    dataKey="orders"
                    fill="#8b5cf6"
                    name="Orders"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
      </section>
    </>
  );
}
