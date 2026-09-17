/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Receipt,
  Layers,
  Trash2,
  Calendar,
  Search,
  Filter,
  DollarSign,
  Building2,
  CheckCircle2,
  FileText,
  Tag,
  CreditCard,
  UserCheck,
  TrendingUp,
  Download,
  Printer
} from 'lucide-react';
import { Expense, CountryConfig } from '../types';
import { SUPPORTED_COUNTRIES } from '../data/saasData';

interface RecordExpenseViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  activeCountry?: CountryConfig;
  isDemo?: boolean;
  t: any;
}

export default function RecordExpenseView({
  expenses,
  onAddExpense,
  onDeleteExpense,
  activeCountry,
  isDemo,
  t
}: RecordExpenseViewProps) {
  // Country config & currency symbol
  const selectedCountry = useMemo(() => {
    return activeCountry || SUPPORTED_COUNTRIES[0];
  }, [activeCountry]);

  const currSymbol = selectedCountry.currencySymbol || '₹';

  // Form State for Recording New Expense
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<'Reagents & Kits' | 'Rent' | 'Utilities' | 'Salaries' | 'Equipment' | 'Logistics' | 'Other'>('Reagents & Kits');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI / GPay' | 'Bank Transfer' | 'Credit Card' | 'Cheque'>('UPI / GPay');
  const [vendorName, setVendorName] = useState('');
  const [notes, setNotes] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Table Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter an expense title / description.');
      return;
    }
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid expense amount greater than 0.');
      return;
    }

    const newExpense: Expense = {
      id: `EXP-2026-${String(expenses.length + 1).padStart(3, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      category: category as any,
      amount: numAmount,
      date: date || new Date().toISOString().split('T')[0],
      description: vendorName
        ? `${title.trim()} - Vendor: ${vendorName.trim()}${notes ? ` (${notes.trim()})` : ''}`
        : notes
        ? `${title.trim()} (${notes.trim()})`
        : title.trim()
    };

    onAddExpense(newExpense);

    // Show success feedback
    setFormSuccessMessage(`Expense voucher "${newExpense.id}" recorded successfully!`);
    setTimeout(() => setFormSuccessMessage(''), 4000);

    // Reset Form
    setTitle('');
    setAmount('');
    setVendorName('');
    setNotes('');
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // Category filter
      if (selectedCategoryFilter !== 'all' && exp.category !== selectedCategoryFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = exp.description.toLowerCase().includes(q);
        const catMatch = exp.category.toLowerCase().includes(q);
        const idMatch = exp.id.toLowerCase().includes(q);
        return descMatch || catMatch || idMatch;
      }
      return true;
    });
  }, [expenses, selectedCategoryFilter, searchQuery]);

  // Total Expenditures
  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Category breakdown
  const categoryTotals = useMemo(() => {
    const acc: { [key: string]: number } = {};
    expenses.forEach(e => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
    });
    return acc;
  }, [expenses]);

  return (
    <div className="space-y-6" id="record-expense-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="text-blue-600" size={22} />
            <span>{t.recordExpense || 'Record Expense'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
              {selectedCountry.flag} {selectedCountry.name}
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Log overhead expenditures, vendor payments, reagent procurement, and utilities vouchers for laboratory accounting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer size={15} />
            Print Expense Log
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {formSuccessMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-2xs animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{formSuccessMessage}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Expenditures</p>
            <h3 className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {currSymbol}{totalExpenseAmount.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">{expenses.length} Vouchers Recorded</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Reagents & Chemicals</p>
            <h3 className="text-lg font-black text-blue-700 dark:text-blue-400 mt-0.5">
              {currSymbol}{(categoryTotals['Reagents & Kits'] || categoryTotals['Reagents'] || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Lab Kit Procurement</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rent & Utilities</p>
            <h3 className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {currSymbol}{((categoryTotals['Rent'] || 0) + (categoryTotals['Utilities'] || categoryTotals['Electricity'] || 0)).toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Facility Lease & Power</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-11 h-11 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Staff Wage Outflow</p>
            <h3 className="text-lg font-black text-purple-700 dark:text-purple-400 mt-0.5">
              {currSymbol}{(categoryTotals['Salaries'] || categoryTotals['Salary'] || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Payroll Disbursed</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Card on Left, List & Ledger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Record New Expense Form Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
            <PlusCircle size={20} className="text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              New Expense Voucher
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="record-expense-form">
            {/* Title / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FileText size={13} className="text-slate-400" /> Expense Description / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Purchase of Hematology Reagents Batch #402"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Category & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Tag size={13} className="text-slate-400" /> Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Reagents & Kits">Reagents & Chemical Kits</option>
                  <option value="Rent">Rent & Facility Lease</option>
                  <option value="Utilities">Electricity & Water Utilities</option>
                  <option value="Salaries">Staff Wages & Payroll</option>
                  <option value="Equipment">Equipment & Calibration</option>
                  <option value="Logistics">Logistics & Home Sample Fuel</option>
                  <option value="Other">Other Sundry Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <DollarSign size={13} className="text-slate-400" /> Amount ({currSymbol}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="e.g. 2500"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-rose-600 dark:text-rose-400"
                />
              </div>
            </div>

            {/* Transaction Date & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" /> Transaction Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <CreditCard size={13} className="text-slate-400" /> Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                  <option value="Cash">Petty Cash</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            {/* Vendor / Payee Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Building2 size={13} className="text-slate-400" /> Payee / Vendor Name (Optional)
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={e => setVendorName(e.target.value)}
                placeholder="e.g. Transasia Bio-Medicals Ltd"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Comment Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Remarks / Invoice Ref (Optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Bill number or additional voucher notes..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs"
              >
                <PlusCircle size={16} />
                Save Expense Voucher
              </button>
            </div>
          </form>
        </div>

        {/* Expense Voucher Ledger Table on Right */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                  Recorded Overhead Vouchers ({filteredExpenses.length})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Search & manage laboratory expenditures
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search vouchers..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-36 sm:w-44"
                  />
                </div>

                {/* Category Dropdown */}
                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-lg focus:outline-hidden"
                >
                  <option value="all">All Categories</option>
                  <option value="Reagents & Kits">Reagents & Kits</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-2">Voucher No</th>
                    <th className="py-2.5 px-2">Description / Payee</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">Date</th>
                    <th className="py-2.5 px-2 text-right">Debit Amount</th>
                    <th className="py-2.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {exp.id}
                      </td>

                      <td className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={exp.description}>
                        {exp.description}
                      </td>

                      <td className="py-3 px-2 font-medium">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">
                        {exp.date}
                      </td>

                      <td className="py-3 px-2 text-right font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                        - {currSymbol}{exp.amount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete expense voucher ${exp.id}?`)) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                          title="Delete Expense Voucher"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        No expense vouchers found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Ledger Total */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
            <span>Showing {filteredExpenses.length} expense records</span>
            <span className="text-rose-600 dark:text-rose-400">
              Filtered Total: {currSymbol}{filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
