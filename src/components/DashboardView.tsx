/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  Beaker,
  FileClock,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Receipt,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Patient, TestReport, Invoice, InventoryItem } from '../types';

interface DashboardViewProps {
  patients: Patient[];
  reports: TestReport[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  t: any;
  onNavigate: (tab: string) => void;
  onSelectReport: (report: TestReport) => void;
}

export default function DashboardView({
  patients,
  reports,
  invoices,
  inventory,
  t,
  onNavigate,
  onSelectReport
}: DashboardViewProps) {
  // Calculations
  const totalPatients = patients.length;
  const todayTests = reports.filter(r => r.collectedDate === '2026-07-18').length;
  const pendingReports = reports.filter(r => r.status === 'Processing').length;
  const completedReports = reports.filter(r => r.status === 'Completed').length;

  const totalIncome = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  const lowStockItems = inventory.filter(item => item.quantity <= item.minThreshold);
  const expiringSoonItems = inventory.filter(item => {
    const expiry = new Date(item.expiryDate);
    const today = new Date('2026-07-18');
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 45;
  });

  const alertsCount = lowStockItems.length + expiringSoonItems.length;

  // Calculate monthly revenue dynamically from actual invoices
  const monthsList = [
    { key: '02', name: 'Feb' },
    { key: '03', name: 'Mar' },
    { key: '04', name: 'Apr' },
    { key: '05', name: 'May' },
    { key: '06', name: 'Jun' },
    { key: '07', name: 'Jul' }
  ];

  const revenueData = monthsList.map(m => {
    const monthlySum = invoices
      .filter(inv => {
        if (!inv.date) return false;
        const parts = inv.date.split('-');
        return parts[1] === m.key;
      })
      .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

    return {
      month: m.name,
      amount: monthlySum
    };
  });

  const maxRevenue = Math.max(1, ...revenueData.map(d => d.amount));
  const chartHeight = 160;

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden" id="welcome-banner">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pointer-events-none">
          <Beaker size={260} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-blue-500/30 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 mb-3">
            <Sparkles size={12} /> {t.rolePermissions} Enabled
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t.welcome}, Apex Diagnostic Staff!
          </h1>
          <p className="mt-2 text-blue-100 text-sm md:text-base font-light">
            Providing accurate diagnostic reporting, digital pathology, real-time sample collections, and automated patient notifications. Review your active workloads below.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="kpi-grid">
        {/* Total Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 flex items-center justify-between" id="stat-patients">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalPatients}</p>
            <div className="flex items-end gap-1.5">
              <h3 className="text-2xl font-bold text-blue-900">{totalPatients}</h3>
              <span className="text-[10px] text-green-600 font-bold">↑ 12%</span>
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg">
            <Users size={18} />
          </div>
        </div>

        {/* Today's Tests */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 flex items-center justify-between" id="stat-today-tests">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.todayTests}</p>
            <div className="flex items-end gap-1.5">
              <h3 className="text-2xl font-bold text-blue-900">{todayTests}</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Today</span>
            </div>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Beaker size={18} />
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 flex items-center justify-between" id="stat-pending-reports">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.pendingReports}</p>
            <div className="flex items-end gap-1.5">
              <h3 className="text-2xl font-bold text-amber-600">{pendingReports}</h3>
              <span className="px-1 py-0.2 bg-amber-50 text-[8px] text-amber-600 border border-amber-200 rounded uppercase font-extrabold tracking-tighter">Urgent</span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <FileClock size={18} />
          </div>
        </div>

        {/* Completed Reports */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 flex items-center justify-between" id="stat-completed-reports">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.completedReports}</p>
            <div className="flex items-end gap-1.5">
              <h3 className="text-2xl font-bold text-emerald-600">{completedReports}</h3>
              <span className="text-[10px] text-emerald-500 font-bold">98%</span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={18} />
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 flex items-center justify-between" id="stat-total-income">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalIncome}</p>
            <div className="flex items-end gap-1.5">
              <h3 className="text-2xl font-bold text-slate-800">₹{totalIncome.toLocaleString('en-IN')}</h3>
              <span className="text-[10px] text-teal-600 font-bold">AUDIT</span>
            </div>
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue & Recent workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-main-grid">
        {/* Revenue SVG Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between" id="revenue-chart-card">
          <div>
            <div className="flex items-center justify-between mb-3 bg-slate-50 -mx-4 -mt-4 px-4 py-2.5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t.revenueChart} (INR)</h3>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span>
                <span className="text-[10px] text-slate-500 font-bold">Monthly Gross</span>
              </div>
            </div>
            {/* Custom SVG Chart */}
            <div className="w-full pt-4 relative">
              <svg viewBox={`0 0 500 ${chartHeight}`} className="w-full overflow-visible">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                  const y = chartHeight - p * (chartHeight - 20) - 10;
                  const value = Math.round(p * maxRevenue);
                  return (
                    <g key={idx}>
                      <line x1="45" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="5" y={y + 4} className="text-[9px] fill-slate-400 font-mono font-bold">
                        {maxRevenue >= 1000 ? `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : `₹${value}`}
                      </text>
                    </g>
                  );
                })}

                {/* Draw Bar Columns */}
                {revenueData.map((d, i) => {
                  const barWidth = 35;
                  const x = 65 + i * 70;
                  const h = (d.amount / maxRevenue) * (chartHeight - 30);
                  const y = chartHeight - h - 15;
                  return (
                    <g key={i} className="group">
                      {/* Gradient */}
                      <defs>
                        <linearGradient id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1e3a8a" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      {/* Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={h}
                        rx="4"
                        fill={`url(#barGrad-${i})`}
                        className="transition-all duration-300 hover:opacity-95 cursor-pointer"
                      />
                      {/* Value Indicator on hover */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 5}
                        textAnchor="middle"
                        className="text-[10px] font-extrabold fill-blue-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        {d.amount >= 1000 ? `₹${(d.amount / 1000).toFixed(d.amount >= 10000 ? 0 : 1)}k` : `₹${d.amount.toLocaleString('en-IN')}`}
                      </text>
                      {/* X Label */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - 2}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-slate-500"
                      >
                        {d.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-medium font-mono text-[10px]">SYNCED: Today 08:00 AM</span>
            <button
              onClick={() => onNavigate('finance')}
              className="text-blue-700 hover:underline font-bold inline-flex items-center gap-1 transition-all uppercase tracking-tight text-[10px]"
            >
              View Financial Summary <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Notifications & System Alerts Panel */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between" id="notifications-panel">
          <div>
            <div className="flex items-center justify-between mb-3 bg-slate-50 -mx-4 -mt-4 px-4 py-2.5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t.notifications}</h3>
              <span className="bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded text-[10px] animate-pulse uppercase">
                {alertsCount} Urgent
              </span>
            </div>

            <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1" id="notification-scrollable">
              {/* Critical Alert 1: Low stock */}
              {inventory.map(item => {
                if (item.quantity <= item.minThreshold) {
                  return (
                    <div key={item.id} className="flex gap-2.5 p-2.5 bg-red-50/50 rounded-lg border border-red-100 text-[11px]" id={`alert-stock-${item.id}`}>
                      <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="font-bold text-red-800 leading-tight">{t.lowStockAlert}: {item.name}</p>
                        <p className="text-red-600 mt-1">Current Stock: <span className="font-extrabold">{item.quantity} {item.unit}</span> (Min: {item.minThreshold})</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              {/* Expiry alerts */}
              {inventory.map(item => {
                const expiry = new Date(item.expiryDate);
                const today = new Date('2026-07-18');
                const diffTime = expiry.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 0 && diffDays <= 45) {
                  return (
                    <div key={`exp-${item.id}`} className="flex gap-2.5 p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-[11px]" id={`alert-exp-${item.id}`}>
                      <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="font-bold text-amber-800 leading-tight">{t.expiryAlert}: {item.name}</p>
                        <p className="text-amber-600 mt-1">Expiring on: <span className="font-bold">{item.expiryDate}</span> ({diffDays} days remaining)</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              {/* Status report update */}
              <div className="flex gap-2.5 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px]" id="notify-status-update">
                <CheckCircle className="text-blue-600 shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="font-bold text-blue-900 leading-tight">New Patient Scheduled</p>
                  <p className="text-blue-700 mt-1">Ketan Patel has completed Sample processing for Lipid profile.</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('inventory')}
            className="w-full mt-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1.5 uppercase"
          >
            Open Inventory Manager <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Row 3: Recent Patient Checkins & Quick Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-row-3">
        {/* Recent Patients Table */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-sm" id="recent-patients-list">
          <div className="flex items-center justify-between mb-3 bg-slate-50 -mx-4 -mt-4 px-4 py-2.5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t.recentPatients}</h3>
            <button
              onClick={() => onNavigate('patients')}
              className="text-blue-700 hover:underline text-[10px] font-bold uppercase tracking-tight"
            >
              Manage All Patients <ArrowRight size={10} className="inline ml-0.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 bg-slate-50/50">
                  <th className="py-2 px-3 font-bold border-b border-slate-100">Patient ID</th>
                  <th className="py-2 px-3 font-bold border-b border-slate-100">Name</th>
                  <th className="py-2 px-3 font-bold border-b border-slate-100">Age/Gender</th>
                  <th className="py-2 px-3 font-bold border-b border-slate-100">Reference Doctor</th>
                  <th className="py-2 px-3 font-bold border-b border-slate-100">Registered Date</th>
                  <th className="py-2 px-3 font-bold border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.slice(0, 4).map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors cursor-pointer" id={`row-recent-pat-${p.id}`} onClick={() => onNavigate('patients')}>
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{p.id}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{p.name}</td>
                    <td className="py-2 px-3 text-slate-500 font-medium">{p.age}y / {p.gender}</td>
                    <td className="py-2 px-3 text-slate-600 italic font-bold">{p.doctorRef}</td>
                    <td className="py-2 px-3 text-slate-400 font-medium">{p.appointmentDate}</td>
                    <td className="py-2 px-3 text-right">
                      <span className="text-[10px] text-blue-600 font-bold hover:underline">View File</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Workflows panel (Instant Action style) */}
        <div className="bg-blue-700 rounded-xl p-4 shadow-md text-white flex flex-col justify-between" id="quick-workflows">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-100">Instant Action Panel</h3>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-extrabold font-mono uppercase tracking-tighter">Quick-Link</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigate('patients')}
                className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5 cursor-pointer text-center"
              >
                <div className="h-6 w-6 bg-white/20 rounded flex items-center justify-center mb-1 text-xs font-bold font-mono">+</div>
                <span className="text-[9px] font-extrabold tracking-wider uppercase">New Patient</span>
              </button>

              <button
                onClick={() => onNavigate('billing')}
                className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5 cursor-pointer text-center"
              >
                <div className="h-6 w-6 bg-white/20 rounded flex items-center justify-center mb-1 text-xs">🧾</div>
                <span className="text-[9px] font-extrabold tracking-wider uppercase">Billing / Invoice</span>
              </button>

              <button
                onClick={() => onNavigate('appointments')}
                className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5 cursor-pointer text-center"
              >
                <div className="h-6 w-6 bg-white/20 rounded flex items-center justify-center mb-1 text-xs">📅</div>
                <span className="text-[9px] font-extrabold tracking-wider uppercase">Schedule</span>
              </button>

              <button
                onClick={() => onNavigate('samples')}
                className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5 cursor-pointer text-center"
              >
                <div className="h-6 w-6 bg-white/20 rounded flex items-center justify-center mb-1 text-xs">🔬</div>
                <span className="text-[9px] font-extrabold tracking-wider uppercase">Find Sample</span>
              </button>
            </div>
          </div>

          <div className="bg-white/10 p-2.5 rounded-lg border border-white/5 text-[10px] text-blue-100 mt-4 leading-tight font-medium">
            <span className="font-extrabold text-white block mb-0.5 uppercase tracking-wide">Backup & Sync</span>
            Database synced to cloud server. All active audit nodes are normal.
          </div>
        </div>
      </div>
    </div>
  );
}
