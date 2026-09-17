/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Calendar,
  Layers,
  FileCheck,
  Trash2,
  X,
  Printer,
  Download,
  FileSpreadsheet,
  Building2,
  Globe,
  Filter,
  DollarSign
} from 'lucide-react';
import { Invoice, Expense, CountryConfig } from '../types';
import { SUPPORTED_COUNTRIES } from '../data/saasData';
import { downloadFinanceReportPDF } from '../lib/pdf';

interface FinanceViewProps {
  invoices: Invoice[];
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onNavigate?: (route: string) => void;
  isDemo?: boolean;
  activeCountry?: CountryConfig;
  t: any;
}

type PeriodPreset = 'all' | 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom';

export default function FinanceView({
  invoices,
  expenses,
  onAddExpense,
  onDeleteExpense,
  onNavigate,
  isDemo,
  activeCountry,
  t
}: FinanceViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Country Selection State
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    activeCountry?.code || 'IN'
  );

  const selectedCountry = useMemo(() => {
    return (
      SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountryCode) ||
      activeCountry ||
      SUPPORTED_COUNTRIES[0]
    );
  }, [selectedCountryCode, activeCountry]);

  // Sync with activeCountry prop if updated globally
  useEffect(() => {
    if (activeCountry?.code) {
      setSelectedCountryCode(activeCountry.code);
    }
  }, [activeCountry]);

  // Period Selection State
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Handle Preset Changes
  const handlePresetChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'this_month') {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (preset === 'last_month') {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (preset === 'this_quarter') {
      const qStartMonth = Math.floor(month / 3) * 3;
      const start = new Date(year, qStartMonth, 1);
      const end = new Date(year, qStartMonth + 3, 0);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (preset === 'this_year') {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (preset === 'custom') {
      if (!startDate) setStartDate('2026-01-01');
      if (!endDate) setEndDate(today.toISOString().split('T')[0]);
    }
  };

  // Filter Invoices & Expenses based on Date Range
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invDate = inv.date || '';
      if (startDate && invDate < startDate) return false;
      if (endDate && invDate > endDate) return false;
      return true;
    });
  }, [invoices, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const expDate = exp.date || '';
      if (startDate && expDate < startDate) return false;
      if (endDate && expDate > endDate) return false;
      return true;
    });
  }, [expenses, startDate, endDate]);

  // Compute Period Display Label
  const periodLabel = useMemo(() => {
    if (periodPreset === 'all' && !startDate && !endDate) return 'All Time';
    if (periodPreset === 'this_month') return 'This Month';
    if (periodPreset === 'last_month') return 'Last Month';
    if (periodPreset === 'this_quarter') return 'This Quarter';
    if (periodPreset === 'this_year') return 'This Year';
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    if (startDate) return `From ${startDate}`;
    if (endDate) return `Up to ${endDate}`;
    return 'All Time';
  }, [periodPreset, startDate, endDate]);

  // Tax and Currency Config
  const currSymbol = selectedCountry.currencySymbol || '₹';
  const taxName = selectedCountry.taxName || 'GST';
  const taxRate = selectedCountry.defaultTaxPercent || 18;
  const isIndia = selectedCountry.code === 'IN';

  // Form State for Recording Expense
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(1500);
  const [category, setCategory] = useState<'Rent' | 'Reagents' | 'Electricity' | 'Salary' | 'Other'>('Reagents');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Math & Tax totals on filtered data
  const grossBilled = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalUncollected = filteredInvoices.reduce((sum, inv) => sum + inv.outstandingBalance, 0);

  // Tax Output Liability Calculations
  const totalTaxCollected = filteredInvoices.reduce((sum, inv) => {
    return sum + (inv.gstAmount || (inv.total * taxRate / (100 + taxRate)));
  }, 0);

  // Input Tax Credit (Purchase / Stock Tax Paid) Calculation
  const totalInputTaxCredit = filteredExpenses.reduce((sum, exp) => {
    if (typeof exp.taxAmount === 'number' && exp.taxAmount > 0) {
      return sum + exp.taxAmount;
    }
    // If purchase expense has explicit tax details or is a stock reagent purchase
    if (
      exp.category === 'Reagents & Kits' ||
      exp.category === 'Utilities' ||
      exp.description.toLowerCase().includes('stock purchase') ||
      exp.description.toLowerCase().includes('gst') ||
      exp.description.toLowerCase().includes('tax')
    ) {
      // Calculate tax embedded in expense amount using taxRate
      return sum + (exp.amount * taxRate / (100 + taxRate));
    }
    return sum;
  }, 0);

  const netTaxPayable = Math.max(0, totalTaxCollected - totalInputTaxCredit);
  const itcExcess = Math.max(0, totalInputTaxCredit - totalTaxCollected);

  const cgstAmount = totalTaxCollected / 2;
  const sgstAmount = totalTaxCollected / 2;

  const cgstInputCredit = totalInputTaxCredit / 2;
  const sgstInputCredit = totalInputTaxCredit / 2;

  const netCgstPayable = netTaxPayable / 2;
  const netSgstPayable = netTaxPayable / 2;

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const isDemoMode = isDemo || (invoices.length > 0 && invoices[0].tenantId === 'TNT-DEMO-PREVIEW');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Expense title is required.');
      return;
    }

    const newExpense: Expense = {
      id: `EXP-2026-${String(expenses.length + 1).padStart(3, '0')}`,
      category: (category === 'Reagents' ? 'Reagents & Kits' : category === 'Electricity' ? 'Utilities' : category) as any,
      amount,
      date,
      description: notes ? `${title} (${notes})` : title
    };

    onAddExpense(newExpense);
    setIsAdding(false);

    // reset
    setTitle('');
    setAmount(1500);
    setNotes('');
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadFinanceReportPDF(
        filteredInvoices,
        filteredExpenses,
        selectedCountry,
        periodLabel,
        isDemo
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Group expenses by category for chart
  const expenseSummary = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="space-y-6" id="finance-view-container">
      {/* Header and Action Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="finance-header-section">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>{t.finance} & {taxName} Statement</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
              {selectedCountry.flag} {selectedCountry.name} ({taxName} {taxRate}%)
            </span>
          </h2>
          <p className="text-sm text-slate-500">
            Record expenditures, track {taxName} tax liabilities for {selectedCountry.name}, and export audit statements for any selected period.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs"
            id="btn-view-finance-report"
          >
            <FileSpreadsheet size={16} />
            Financial & {taxName} Statement
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs"
            id="btn-download-pdf-top"
          >
            <Download size={15} />
            {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
          </button>
          <button
            onClick={handlePrintReport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs"
            id="btn-print-statement-top"
          >
            <Printer size={15} />
            Print Statement
          </button>
          {/* Record expense button removed from Finance header as it is available in sidebar */}
        </div>
      </div>

      {/* FILTER CONTROLS BAR: Period & Country Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3" id="finance-filters-bar">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Period Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter size={13} /> Period:
            </span>
            <button
              onClick={() => handlePresetChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodPreset === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => handlePresetChange('this_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodPreset === 'this_month'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handlePresetChange('last_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodPreset === 'last_month'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => handlePresetChange('this_quarter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodPreset === 'this_quarter'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              This Quarter
            </button>
            <button
              onClick={() => handlePresetChange('this_year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodPreset === 'this_year'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => handlePresetChange('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodPreset === 'custom'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Country Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Globe size={13} className="text-slate-400" /> Country & Tax:
            </span>
            <select
              value={selectedCountryCode}
              onChange={(e) => setSelectedCountryCode(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.taxName} {c.defaultTaxPercent}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Inputs when Custom Range is active or fine-tuning */}
        {(periodPreset === 'custom' || startDate || endDate) && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-600 flex items-center gap-1">
                <Calendar size={13} className="text-blue-500" /> From Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPeriodPreset('custom');
                }}
                className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-800 font-medium"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-600 flex items-center gap-1">
                <Calendar size={13} className="text-blue-500" /> To Date:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPeriodPreset('custom');
                }}
                className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-800 font-medium"
              />
            </div>
            <div className="text-slate-500 italic ml-auto font-medium">
              Filtered Records: <strong>{filteredInvoices.length}</strong> Invoices, <strong>{filteredExpenses.length}</strong> Expenses ({periodLabel})
            </div>
          </div>
        )}
      </div>

      {/* KPI summaries grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="finance-kpis">
        {/* Revenue collected */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Realized Revenue</p>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              {currSymbol}{totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Cash & Digital Collected</p>
          </div>
        </div>

        {/* Outstanding dues */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Outstanding Dues</p>
            <h3 className="text-base font-black text-amber-600 mt-0.5">
              {currSymbol}{totalUncollected.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-amber-700 font-bold mt-0.5">Customer Receivables</p>
          </div>
        </div>

        {/* Expenses billed */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Expenditures</p>
            <h3 className="text-base font-black text-rose-600 mt-0.5">
              {currSymbol}{totalExpenses.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-rose-700 font-bold mt-0.5">{filteredExpenses.length} Vouchers</p>
          </div>
        </div>

        {/* Input Tax Credit (Purchase Tax Paid) */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-2xs p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
            <FileCheck size={20} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Input Purchase Tax (ITC)</p>
            <h3 className="text-base font-black text-emerald-700 mt-0.5">
              {currSymbol}{totalInputTaxCredit.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Reagent & Stock GST Credit</p>
          </div>
        </div>

        {/* Net Operating Yield */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Net Profit / Yield</p>
            <h3 className="text-base font-black text-blue-700 mt-0.5">
              {currSymbol}{netProfit.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-blue-600 font-bold mt-0.5">Margin: {profitMargin.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Tax Liability Calculation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-sm border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-900/60 px-2.5 py-0.5 rounded border border-blue-800">
              {selectedCountry.flag} {selectedCountry.name} Tax Return & Input Tax Credit (ITC) Summary
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              {taxName} Tax Statement & Settlement ({periodLabel})
            </h3>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div className="border-r border-slate-800 pr-4">
              <span className="text-sm font-bold text-slate-400 block">Output Tax (Sales)</span>
              <span className="text-lg font-black text-white">{currSymbol}{totalTaxCollected.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-r border-slate-800 pr-4">
              <span className="text-sm font-bold text-emerald-400 block">Input Tax (Purchases)</span>
              <span className="text-lg font-black text-emerald-400">-{currSymbol}{totalInputTaxCredit.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-blue-400 block">Net {taxName} Payable</span>
              <span className="text-2xl font-black text-blue-300">
                {currSymbol}{netTaxPayable.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {isIndia ? (
            <>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium block text-[11px]">Output Sales Tax (Collected):</span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {currSymbol}{totalTaxCollected.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">CGST {currSymbol}{cgstAmount.toLocaleString('en-IN')} + SGST {currSymbol}{sgstAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-emerald-800/60">
                <span className="text-emerald-400 font-medium block text-[11px]">Input Purchase Tax (ITC):</span>
                <span className="text-sm font-black text-emerald-400 mt-0.5 block">
                  {currSymbol}{totalInputTaxCredit.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-300/80 mt-1 block">CGST {currSymbol}{cgstInputCredit.toLocaleString('en-IN')} + SGST {currSymbol}{sgstInputCredit.toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-blue-900/40 p-3 rounded-xl border border-blue-700/60">
                <span className="text-blue-300 font-medium block text-[11px]">Net Tax Payable to Govt:</span>
                <span className="text-sm font-black text-blue-200 mt-0.5 block">
                  {currSymbol}{netTaxPayable.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-blue-300/80 mt-1 block">CGST {currSymbol}{netCgstPayable.toLocaleString('en-IN')} + SGST {currSymbol}{netSgstPayable.toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium block text-[11px]">ITC Deduction Status:</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                  {totalInputTaxCredit > 0 ? '100% Tax Credit Claimed' : 'No Purchase ITC Recorded'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Healthcare Reagent Exemption Rules</span>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium block text-[11px]">{taxName} Output Tax ({taxRate}%):</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{currSymbol}{totalTaxCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-emerald-400 font-medium block text-[11px]">Input Tax Credit (ITC):</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{currSymbol}{totalInputTaxCredit.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium block text-[11px]">Net Payable:</span>
                <span className="text-sm font-bold text-blue-300 mt-0.5 block">{currSymbol}{netTaxPayable.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 font-medium block text-[11px]">Tax Region:</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{selectedCountry.flag} {selectedCountry.name}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-slate-900/90 rounded-xl px-4 py-2 border border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-blue-400 shrink-0" />
            <span>GSTIN / Tax ID: <strong className="text-white font-mono font-bold">24AAACA0000A1Z5</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <span>Total Sales Billed: <strong className="text-white font-bold">{currSymbol}{grossBilled.toLocaleString('en-IN')}</strong></span>
            <span>Total Purchases Billed: <strong className="text-emerald-400 font-bold">{currSymbol}{totalExpenses.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 max-w-xl" id="record-expense-form-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-base font-bold text-slate-800">Record Overhead Expenditure Voucher</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="form-record-expense">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Title / Description *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Office rent for July month"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden"
                >
                  <option value="Rent">Rent</option>
                  <option value="Reagents">Reagent Chemical Supplies</option>
                  <option value="Electricity">Electricity & Utilities</option>
                  <option value="Salary">Staff Wages</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Amount ({currSymbol}) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Comment Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional details..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main financial panels: List & Vector category chart */}
      {!isAdding && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="finance-split-view">
          {/* Expenses list */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="expenses-log-panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Recorded Expense Logs ({periodLabel})
              </h3>
              <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                Total Billed: {currSymbol}{totalExpenses.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-3 px-2">Voucher No</th>
                    <th className="py-3 px-2">Expenditure details</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Paid Date</th>
                    <th className="py-3 px-2">Debit Amount</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors" id={`row-exp-${exp.id}`}>
                      {/* ID */}
                      <td className="py-3.5 px-2 font-mono">
                        <span className="font-bold text-slate-800 block">{exp.id}</span>
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-2 font-bold text-slate-700">
                        <p>{exp.description}</p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-2 font-semibold text-slate-600">
                        {exp.category}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-2 text-slate-500 font-medium">
                        {exp.date}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-2 font-extrabold text-red-600">
                        - {currSymbol}{exp.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Delete */}
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Do you wish to delete this expense voucher?`)) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-1 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete Expense Voucher"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No expense logs recorded for the selected period ({periodLabel}).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Graphical Category breakdown card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between" id="expense-graph-panel">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Expense Distribution</h3>

              {/* Vector representation donut chart */}
              <div className="flex items-center justify-center py-4" id="donut-expense-chart">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  {/* Circle segments */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="88 251" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="75 251" strokeDashoffset="-88" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="12" strokeDasharray="50 251" strokeDashoffset="-163" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="38 251" strokeDashoffset="-213" />
                </svg>
              </div>

              {/* Legends list */}
              <div className="space-y-2 text-xs font-medium text-slate-600" id="legends">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Rent & Office Lease</span>
                  <span className="font-bold text-slate-700">{currSymbol}{expenseSummary['Rent']?.toLocaleString('en-IN') || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Reagent chemical kits</span>
                  <span className="font-bold text-slate-700">{currSymbol}{expenseSummary['Reagents']?.toLocaleString('en-IN') || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Salaries</span>
                  <span className="font-bold text-slate-700">{currSymbol}{expenseSummary['Salary']?.toLocaleString('en-IN') || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Utilities & Electricity</span>
                  <span className="font-bold text-slate-700">{currSymbol}{expenseSummary['Electricity']?.toLocaleString('en-IN') || '0'}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 font-mono mt-4 flex items-center gap-1.5">
              <FileCheck size={14} className="text-blue-500 shrink-0" />
              <span>Diagnostic profit ratio: <strong>{profitMargin.toFixed(1)}%</strong> ({periodLabel}).</span>
            </div>
          </div>
        </div>
      )}

      {/* FULL FINANCIAL & TAX ANALYSIS REPORT MODAL */}
      {showReportModal && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto"
          id="financial-report-modal"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Sticky Action Bar Header */}
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0 sticky top-0 z-20">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet size={20} className="text-blue-400" />
                <h3 className="font-extrabold text-base">Financial Audit & {taxName} Statement</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  Print Statement
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close (X)"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Statement Canvas */}
            <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white overflow-y-auto flex-1" id="printable-financial-statement">
              {/* Report Letterhead Header */}
              <div className="flex items-start justify-between border-b-2 border-blue-900 pb-4">
                <div>
                  <h1 className="text-xl font-black text-blue-950 tracking-tight">APEX DIAGNOSTICS & PATHOLOGY</h1>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mt-0.5">
                    FINANCIAL AUDIT STATEMENT & {taxName.toUpperCase()} TAX LIABILITY REPORT
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Tax Reg ID: <strong className="font-mono">24AAACA0000A1Z5</strong> | Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 leading-snug">
                  <p className="font-extrabold text-slate-800 uppercase">ACCOUNTS DIVISION</p>
                  <p className="font-bold text-blue-900">Statement Period: {periodLabel}</p>
                  <p className="font-bold text-blue-800">Country: {selectedCountry.flag} {selectedCountry.name}</p>
                </div>
              </div>

              {/* Demo Mode Notice */}
              {isDemoMode && (
                <div className="bg-red-50 border-2 border-dashed border-red-500 rounded-xl p-3 text-center text-red-900">
                  <p className="font-black text-xs uppercase tracking-wider text-red-700">
                    ⚠️ DEMO MODE — SAMPLE FINANCIAL STATEMENT (DEMO RESULT)
                  </p>
                  <p className="text-[10px] font-bold text-red-800 mt-0.5 leading-relaxed">
                    THIS STATEMENT IS GENERATED IN DEMO PREVIEW MODE. IT IS STRICTLY FOR SOFTWARE EVALUATION AND CANNOT BE FILED WITH TAX AUTHORITIES OR USED FOR AUDITING.
                  </p>
                </div>
              )}

              {/* Section 1: Financial & Diagnostic Revenue Metrics */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. Revenue & Operational Profit Summary
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                      <th className="p-2.5">Metric Indicator</th>
                      <th className="p-2.5 text-right">Amount ({currSymbol})</th>
                      <th className="p-2.5">Audit Status / Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    <tr>
                      <td className="p-2.5">Gross Billed Invoice Revenue</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{currSymbol}{grossBilled.toLocaleString('en-IN')} {isDemoMode && <span className="text-red-600 text-[10px]">[DEMO]</span>}</td>
                      <td className="p-2.5 text-slate-500">{filteredInvoices.length} Invoices Billed</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Realized Cash & Digital Receipts</td>
                      <td className="p-2.5 text-right font-extrabold text-emerald-700">{currSymbol}{totalRevenue.toLocaleString('en-IN')} {isDemoMode && <span className="text-red-600 text-[10px]">[DEMO]</span>}</td>
                      <td className="p-2.5 text-emerald-600 font-bold">Collected Funds</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Outstanding Receivables (Due)</td>
                      <td className="p-2.5 text-right font-extrabold text-red-600">{currSymbol}{totalUncollected.toLocaleString('en-IN')} {isDemoMode && <span className="text-red-600 text-[10px]">[DEMO]</span>}</td>
                      <td className="p-2.5 text-red-600 font-bold">Pending Customer Dues</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Total Overhead Expenditures</td>
                      <td className="p-2.5 text-right font-extrabold text-rose-600">{currSymbol}{totalExpenses.toLocaleString('en-IN')} {isDemoMode && <span className="text-red-600 text-[10px]">[DEMO]</span>}</td>
                      <td className="p-2.5 text-slate-500">{filteredExpenses.length} Expense Vouchers</td>
                    </tr>
                    <tr className="bg-emerald-50/80 text-emerald-950 font-extrabold text-sm border-t-2 border-emerald-300">
                      <td className="p-3">NET OPERATING PROFIT / YIELD</td>
                      <td className="p-3 text-right font-black text-emerald-800 text-base">{currSymbol}{netProfit.toLocaleString('en-IN')} {isDemoMode && <span className="text-red-600 text-[10px]">[DEMO]</span>}</td>
                      <td className="p-3 text-xs text-emerald-800">Profit Ratio: {profitMargin.toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 2: Tax Liability & Input Tax Credit Breakdown */}
              <div className="bg-slate-50 border-2 border-blue-900 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                      2. {taxName} Tax Statement & Input Tax Credit (ITC)
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Region: {selectedCountry.flag} {selectedCountry.name} • Standard Rate: {taxRate}% {taxName}
                    </p>
                  </div>
                  <span className="bg-blue-900 text-white font-black text-[10px] px-2.5 py-1 rounded uppercase">
                    NET TAX SETTLEMENT
                  </span>
                </div>

                <div className="space-y-2 text-xs font-bold text-slate-800">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-700">Output Sales Tax Collected (Invoices):</span>
                    <span className="font-black text-slate-900">{currSymbol}{totalTaxCollected.toLocaleString('en-IN')} {isDemoMode && <span className="text-red-600 text-[10px]">[DEMO]</span>}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 pb-1.5 text-emerald-800">
                    <span className="flex items-center gap-1">
                      <span>Less: Input Tax Credit (ITC) on Purchase / Stock Expenses:</span>
                    </span>
                    <span className="font-black text-emerald-700">-{currSymbol}{totalInputTaxCredit.toLocaleString('en-IN')} {isDemoMode && <span className="text-red-600 text-[10px]">[DEMO]</span>}</span>
                  </div>

                  {isIndia && (
                    <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-100/70 p-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold">
                      <div>
                        <span className="block text-slate-500 text-[10px]">CGST Output: {currSymbol}{cgstAmount.toLocaleString('en-IN')}</span>
                        <span className="block text-emerald-700 font-bold">CGST Input Credit: -{currSymbol}{cgstInputCredit.toLocaleString('en-IN')}</span>
                        <span className="block text-blue-900 font-black mt-0.5">Net CGST Payable: {currSymbol}{netCgstPayable.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px]">SGST Output: {currSymbol}{sgstAmount.toLocaleString('en-IN')}</span>
                        <span className="block text-emerald-700 font-bold">SGST Input Credit: -{currSymbol}{sgstInputCredit.toLocaleString('en-IN')}</span>
                        <span className="block text-blue-900 font-black mt-0.5">Net SGST Payable: {currSymbol}{netSgstPayable.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-sky-100/90 border border-sky-200 rounded-lg p-3 flex items-center justify-between text-sky-950 font-black">
                  <span className="text-xs">TOTAL NET {taxName.toUpperCase()} TAX PAYABLE TO GOVERNMENT:</span>
                  <span className="text-base text-blue-900">{currSymbol}{netTaxPayable.toLocaleString('en-IN')} {isDemoMode && <span className="text-red-600 text-[10px]">[DEMO]</span>}</span>
                </div>
              </div>

              {/* Section 3: Expense Ledger Breakdown */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  3. Expense Ledger Breakdown by Category
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                      <th className="p-2">Category</th>
                      <th className="p-2 text-right">Amount Spent ({currSymbol})</th>
                      <th className="p-2 text-right">% Allocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {Object.entries(expenseSummary).map(([cat, amt]) => {
                      const numAmt = amt as number;
                      return (
                        <tr key={cat}>
                          <td className="p-2">{cat}</td>
                          <td className="p-2 text-right font-bold text-rose-600">{currSymbol}{numAmt.toLocaleString('en-IN')} {isDemoMode && <span className="text-red-600 text-[10px]">[DEMO]</span>}</td>
                          <td className="p-2 text-right text-slate-500">
                            {totalExpenses > 0 ? ((numAmt / totalExpenses) * 100).toFixed(1) : '0'}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="border-t border-slate-200 pt-6 mt-8 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <p className="font-bold text-slate-800 uppercase text-[10px]">Financial Auditor Declaration</p>
                  <p className="text-[10px] italic max-w-xs mt-0.5 leading-tight">
                    Calculated under standard {selectedCountry.name} {taxName} accounting rules for healthcare diagnostic laboratories.
                  </p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-slate-300 w-36 ml-auto mb-1"></div>
                  <p className="font-bold text-slate-900">Chief Financial Officer / Accountant</p>
                  <p className="text-[9px]">Apex Diagnostics Accounts Wing</p>
                </div>
              </div>
            </div>

            {/* Bottom Modal Action Footer */}
            <div className="bg-slate-100 dark:bg-slate-800 p-3.5 px-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0 print:hidden">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Click outside or press Close to return to Finance View
              </span>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <X size={16} />
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
