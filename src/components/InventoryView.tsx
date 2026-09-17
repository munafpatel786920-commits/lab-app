/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  PlusCircle,
  AlertTriangle,
  Minus,
  Plus,
  Truck,
  Calendar,
  Layers,
  X,
  Trash2,
  ShoppingCart,
  Receipt,
  CheckCircle2,
  DollarSign,
  Building2,
  Tag,
  CreditCard,
  FileText
} from 'lucide-react';
import { InventoryItem, Expense, CountryConfig } from '../types';
import { SUPPORTED_COUNTRIES } from '../data/saasData';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateStock: (id: string, newQuantity: number) => void;
  onDeleteInventoryItem?: (id: string) => void;
  onAddExpense?: (expense: Expense) => void;
  activeCountry?: CountryConfig;
  t: any;
}

export default function InventoryView({
  inventory,
  onAddInventoryItem,
  onUpdateStock,
  onDeleteInventoryItem,
  onAddExpense,
  activeCountry,
  t
}: InventoryViewProps) {
  const selectedCountry = useMemo(() => {
    return activeCountry || SUPPORTED_COUNTRIES[0];
  }, [activeCountry]);

  const currSymbol = selectedCountry.currencySymbol || '₹';

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // New Item Registration Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Test Kit' | 'Reagent' | 'Chemical' | 'Consumable'>('Test Kit');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState('Boxes');
  const [minThreshold, setMinThreshold] = useState<number>(10);
  const [expiryDate, setExpiryDate] = useState('2027-01-01');
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');

  // Item Purchase Form State
  const [purchaseMode, setPurchaseMode] = useState<'existing' | 'new'>('existing');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [purItemName, setPurItemName] = useState('');
  const [purCategory, setPurCategory] = useState<'Test Kit' | 'Reagent' | 'Chemical' | 'Consumable'>('Reagent');
  const [purQty, setPurQty] = useState<number>(10);
  const [purUnit, setPurUnit] = useState('Vials');
  const [purUnitPrice, setPurUnitPrice] = useState<number | ''>(250);
  const [purTotalCost, setPurTotalCost] = useState<number | ''>(2500);
  const [purTaxPercent, setPurTaxPercent] = useState<number>(selectedCountry.defaultTaxPercent || 18);
  const [purTaxMode, setPurTaxMode] = useState<'extra' | 'included'>('extra');
  const [purVendor, setPurVendor] = useState('');
  const [purVendorContact, setPurVendorContact] = useState('');
  const [purDate, setPurDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [purPayMode, setPurPayMode] = useState<'UPI / GPay' | 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Cheque'>('UPI / GPay');
  const [purInvoiceNo, setPurInvoiceNo] = useState('');
  const [purNotes, setPurNotes] = useState('');
  const [purExpiry, setPurExpiry] = useState('2027-06-30');

  // Calculate Tax & Totals for Purchase
  const calculatedTaxAndTotals = useMemo(() => {
    const rawCost = typeof purTotalCost === 'number' ? purTotalCost : parseFloat(purTotalCost as string) || 0;
    const taxPct = typeof purTaxPercent === 'number' ? purTaxPercent : parseFloat(purTaxPercent as string) || 0;

    if (purTaxMode === 'extra') {
      const base = rawCost;
      const taxAmt = base * (taxPct / 100);
      const grandTotal = base + taxAmt;
      return { baseAmount: base, taxAmount: taxAmt, grandTotal };
    } else {
      const grandTotal = rawCost;
      const taxAmt = grandTotal - (grandTotal / (1 + taxPct / 100));
      const base = grandTotal - taxAmt;
      return { baseAmount: base, taxAmount: taxAmt, grandTotal };
    }
  }, [purTotalCost, purTaxPercent, purTaxMode]);

  // Stock In / Out Adjustment state
  const [adjustingItemId, setAdjustingItemId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(5);

  // Handle register new item directly
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !supplierName) {
      alert('Item Name and Supplier details are required.');
      return;
    }

    const newItem: InventoryItem = {
      id: `INV-KIT-${String(inventory.length + 1).padStart(3, '0')}`,
      name,
      category,
      quantity,
      unit,
      minThreshold,
      expiryDate,
      supplierName,
      supplierContact,
      lastStockedDate: new Date().toISOString().split('T')[0]
    };

    onAddInventoryItem(newItem);
    setIsAdding(false);

    setSuccessMsg(`Inventory item "${newItem.name}" added successfully!`);
    setTimeout(() => setSuccessMsg(''), 4000);

    // reset
    setName('');
    setQuantity(50);
    setUnit('Boxes');
    setMinThreshold(10);
    setExpiryDate('2027-01-01');
    setSupplierName('');
    setSupplierContact('');
  };

  // Handle Purchase Item & Sync with Finance / GST
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetName = purItemName.trim();
    let targetUnit = purUnit.trim();
    let targetVendor = purVendor.trim();
    let targetCategory = purCategory;

    if (purchaseMode === 'existing') {
      const existing = inventory.find(i => i.id === selectedItemId);
      if (!existing) {
        alert('Please select an existing item to purchase.');
        return;
      }
      targetName = existing.name;
      targetUnit = existing.unit;
      if (!targetVendor) targetVendor = existing.supplierName;
      targetCategory = existing.category;
    } else {
      if (!targetName) {
        alert('Please enter the purchase item name.');
        return;
      }
    }

    const qtyNum = typeof purQty === 'number' ? purQty : parseInt(purQty) || 0;
    if (qtyNum <= 0) {
      alert('Please enter a valid purchase quantity greater than 0.');
      return;
    }

    const costNum = typeof purTotalCost === 'number' ? purTotalCost : parseFloat(purTotalCost as string);
    if (isNaN(costNum) || costNum <= 0) {
      alert('Please enter a valid total purchase cost greater than 0.');
      return;
    }

    const { baseAmount, taxAmount, grandTotal } = calculatedTaxAndTotals;

    // 1. Update or Add in Inventory
    if (purchaseMode === 'existing' && selectedItemId) {
      const existing = inventory.find(i => i.id === selectedItemId);
      if (existing) {
        onUpdateStock(existing.id, existing.quantity + qtyNum);
      }
    } else {
      const newInvItem: InventoryItem = {
        id: `INV-KIT-${String(inventory.length + 1).padStart(3, '0')}`,
        name: targetName,
        category: targetCategory,
        quantity: qtyNum,
        unit: targetUnit || 'Units',
        minThreshold: 5,
        expiryDate: purExpiry || '2027-12-31',
        supplierName: targetVendor || 'General Vendor',
        supplierContact: purVendorContact,
        lastStockedDate: purDate || new Date().toISOString().split('T')[0]
      };
      onAddInventoryItem(newInvItem);
    }

    // 2. Automatically Log Expense Voucher for Finance & GST Statement
    if (onAddExpense) {
      const expenseCat = (targetCategory === 'Reagent' || targetCategory === 'Test Kit' || targetCategory === 'Chemical')
        ? 'Reagents & Kits'
        : 'Other';

      const taxLabel = selectedCountry.taxName || 'GST';

      const expVoucher: Expense = {
        id: `EXP-INV-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`,
        category: expenseCat as any,
        amount: Math.round(grandTotal * 100) / 100,
        date: purDate || new Date().toISOString().split('T')[0],
        description: `Stock Purchase: ${targetName} (${qtyNum} ${targetUnit || 'Units'}) - Base: ${currSymbol}${baseAmount.toFixed(2)} + ${taxLabel} (${purTaxPercent}% / ${currSymbol}${taxAmount.toFixed(2)}) = Total: ${currSymbol}${grandTotal.toFixed(2)} - Vendor: ${targetVendor || 'Vendor'}${purInvoiceNo ? ` [Bill Ref: ${purInvoiceNo.trim()}]` : ''}${purNotes ? ` (${purNotes.trim()})` : ''}`
      };

      onAddExpense(expVoucher);
    }

    setIsPurchasing(false);
    setSuccessMsg(`Stock purchase of ${targetName} (${qtyNum} ${targetUnit}) recorded! Total Bill ${currSymbol}${grandTotal.toFixed(2)} (incl. ${purTaxPercent}% GST: ${currSymbol}${taxAmount.toFixed(2)}) logged into Finance & Analytics & GST Statement.`);
    setTimeout(() => setSuccessMsg(''), 6000);

    // Reset Form
    setSelectedItemId('');
    setPurItemName('');
    setPurQty(10);
    setPurUnitPrice(250);
    setPurTotalCost(2500);
    setPurVendor('');
    setPurVendorContact('');
    setPurInvoiceNo('');
    setPurNotes('');
  };

  const handleAdjustStock = (item: InventoryItem, action: 'In' | 'Out') => {
    let finalQty = item.quantity;
    if (action === 'In') {
      finalQty += adjustQty;
    } else {
      finalQty = Math.max(0, item.quantity - adjustQty);
    }
    onUpdateStock(item.id, finalQty);
    setAdjustingItemId(null);
    setAdjustQty(5);
  };

  const filteredInventory = inventory.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.supplierName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6" id="inventory-view-container">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="inventory-header-section">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Package className="text-blue-600" size={22} />
            <span>{t.inventory}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor reagent reserves, purchase chemical stock, and manage supplier orders linked directly to Finance & Analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isPurchasing && (
            <button
              onClick={() => {
                setIsPurchasing(true);
                setIsAdding(false);
                if (inventory.length > 0) {
                  setSelectedItemId(inventory[0].id);
                  setPurVendor(inventory[0].supplierName);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs"
              id="btn-purchase-inventory-item"
            >
              <ShoppingCart size={16} />
              Item Purchase (Add Stock & Expense)
            </button>
          )}

          {!isAdding && (
            <button
              onClick={() => {
                setIsAdding(true);
                setIsPurchasing(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs"
              id="btn-add-inventory-item"
            >
              <PlusCircle size={16} />
              Stock In New Item
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-2xs animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ITEM PURCHASE MODAL / FORM */}
      {isPurchasing && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-md p-6 max-w-3xl" id="purchase-inventory-form">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShoppingCart size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  Record Item Purchase (Stock & Expense Voucher)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically restocks inventory and posts expense detail to Finance & Analytics & GST Statement.
                </p>
              </div>
            </div>
            <button onClick={() => setIsPurchasing(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handlePurchaseSubmit} className="space-y-4">
            {/* Purchase Mode Toggle */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Purchase Target:</label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="purMode"
                  checked={purchaseMode === 'existing'}
                  onChange={() => setPurchaseMode('existing')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                Restock Existing Inventory Item
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="purMode"
                  checked={purchaseMode === 'new'}
                  onChange={() => setPurchaseMode('new')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                Purchase New Unregistered Chemical
              </label>
            </div>

            {/* Target Item Selection */}
            {purchaseMode === 'existing' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Existing Inventory Item *
                </label>
                <select
                  value={selectedItemId}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedItemId(id);
                    const item = inventory.find(i => i.id === id);
                    if (item) {
                      setPurVendor(item.supplierName);
                      setPurVendorContact(item.supplierContact || '');
                      setPurUnit(item.unit);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.category}) - Current Stock: {i.quantity} {i.unit} [Supplier: {i.supplierName}]
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New Item / Reagent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={purItemName}
                    onChange={e => setPurItemName(e.target.value)}
                    placeholder="e.g. Lipid Profile Reagent Kit"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={purCategory}
                    onChange={e => setPurCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Reagent">Reagent Chemical</option>
                    <option value="Test Kit">Test Kit</option>
                    <option value="Chemical">Staining Chemical</option>
                    <option value="Consumable">Vials & Consumables</option>
                  </select>
                </div>
              </div>
            )}

            {/* Qty, Unit, Price, Total Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Purchased Qty *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={purQty}
                  onChange={e => {
                    const q = parseInt(e.target.value) || 0;
                    setPurQty(q);
                    if (typeof purUnitPrice === 'number') {
                      setPurTotalCost(q * purUnitPrice);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-extrabold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Unit *
                </label>
                <input
                  type="text"
                  required
                  value={purUnit}
                  onChange={e => setPurUnit(e.target.value)}
                  placeholder="Vials, Kits, Boxes"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Price / Unit ({currSymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  value={purUnitPrice}
                  onChange={e => {
                    const price = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setPurUnitPrice(price);
                    if (typeof price === 'number' && typeof purQty === 'number') {
                      setPurTotalCost(price * purQty);
                    }
                  }}
                  placeholder="e.g. 250"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subtotal / Bill Cost ({currSymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={purTotalCost}
                  onChange={e => setPurTotalCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="e.g. 2500"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-black focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* TAX / GST SECTION */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 dark:text-slate-200">
                  <Receipt size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Tax / GST Details ({selectedCountry.taxName || 'GST'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPurTaxMode('extra')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      purTaxMode === 'extra'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    + Tax Extra
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurTaxMode('included')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      purTaxMode === 'included'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    Tax Included in Cost
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tax / GST Rate (%)
                  </label>
                  <select
                    value={purTaxPercent}
                    onChange={e => setPurTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden"
                  >
                    <option value={0}>0% (Tax Exempt)</option>
                    <option value={5}>5% GST (Reagents / Chemicals)</option>
                    <option value={12}>12% GST (Standard Kits)</option>
                    <option value={18}>18% GST (Lab Equipment & Reagents)</option>
                    <option value={28}>28% GST (Special Machinery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tax Amount ({currSymbol})
                  </label>
                  <div className="w-full px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-black">
                    {currSymbol}{calculatedTaxAndTotals.taxAmount.toFixed(2)}
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 ml-1">
                      (CGST {currSymbol}{(calculatedTaxAndTotals.taxAmount / 2).toFixed(2)} + SGST {currSymbol}{(calculatedTaxAndTotals.taxAmount / 2).toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary line */}
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Base: {currSymbol}{calculatedTaxAndTotals.baseAmount.toFixed(2)}</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  Total Payable: {currSymbol}{calculatedTaxAndTotals.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Vendor Details & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vendor / Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={purVendor}
                  onChange={e => setPurVendor(e.target.value)}
                  placeholder="e.g. Transasia Bio-Medicals"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={purPayMode}
                  onChange={e => setPurPayMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                  <option value="Cash">Petty Cash</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  required
                  value={purDate}
                  onChange={e => setPurDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Bill Ref & Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier Invoice / Bill Ref No.
                </label>
                <input
                  type="text"
                  value={purInvoiceNo}
                  onChange={e => setPurInvoiceNo(e.target.value)}
                  placeholder="e.g. BILL-TRANS-99012"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Stock Expiration Date
                </label>
                <input
                  type="date"
                  value={purExpiry}
                  onChange={e => setPurExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPurchasing(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                <ShoppingCart size={15} />
                Confirm Purchase & Post Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEW ITEM REGISTRATION FORM */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 max-w-3xl" id="add-inventory-form">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans">
              Add Reagent Kit / Laboratory Consumable
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4" id="form-add-inventory">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Glucose Oxidase Reagent"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Item Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="Test Kit">Test Kit</option>
                  <option value="Reagent">Reagent Chemical</option>
                  <option value="Chemical">Staining Chemical</option>
                  <option value="Consumable">Vials & Consumables</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Unit of Volume *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="e.g. Vials, Bottles, Boxes"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Minimum Alert Threshold *</label>
                <input
                  type="number"
                  required
                  value={minThreshold}
                  onChange={e => setMinThreshold(parseInt(e.target.value) || 5)}
                  placeholder="e.g. 10 (Warns when stock dips)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Expiration Date *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Supplier Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    placeholder="e.g. Abbott Healthcare Ltd"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Supplier Contact Number</label>
                  <input
                    type="tel"
                    value={supplierContact}
                    onChange={e => setSupplierContact(e.target.value)}
                    placeholder="e.g. +91 9988770101"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Register & Stock In
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reagent Catalog Table List */}
      {!isAdding && !isPurchasing && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6" id="inventory-list-view">
          {/* Search bar row */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search chemicals, reagents, expiry dates..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-2">Item ID & Category</th>
                  <th className="py-3 px-2">Reagent / Chemical Name</th>
                  <th className="py-3 px-2">Current Reserves</th>
                  <th className="py-3 px-2">Stock Alert Threshold</th>
                  <th className="py-3 px-2">Expiration Date</th>
                  <th className="py-3 px-2">Supplier Brand</th>
                  <th className="py-3 px-2 text-right">Adjust Stock</th>
                  <th className="py-3 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInventory.map(item => {
                  const isLow = item.quantity <= item.minThreshold;
                  // Expiry checks
                  const expiry = new Date(item.expiryDate);
                  const today = new Date('2026-07-18');
                  const diffTime = expiry.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isSoonExpiring = diffDays > 0 && diffDays <= 45;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors" id={`row-inv-${item.id}`}>
                      {/* ID category */}
                      <td className="py-3.5 px-2">
                        <span className="font-mono font-bold text-slate-400 block">{item.id}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-sm block w-fit font-semibold mt-0.5 border border-slate-200 dark:border-slate-700">{item.category}</span>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-2 font-extrabold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Package size={15} className="text-blue-500 shrink-0" /> {item.name}
                        </span>
                      </td>

                      {/* Stock Level volume bar */}
                      <td className="py-3.5 px-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-extrabold text-sm ${isLow ? 'text-rose-600 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                              {item.quantity} {item.unit}
                            </span>
                            {isLow && (
                              <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded-sm block border border-rose-200 dark:border-rose-800">
                                LOW STOCK
                              </span>
                            )}
                          </div>
                          {/* Progress bar */}
                          <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-blue-600'}`}
                              style={{ width: `${Math.min(100, (item.quantity / 100) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* min threshold */}
                      <td className="py-3.5 px-2 font-semibold text-slate-500 dark:text-slate-400">
                        {item.minThreshold} {item.unit}
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-2">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          isSoonExpiring ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          <Calendar size={12} className="text-slate-400" /> {item.expiryDate}
                          {isSoonExpiring && (
                            <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[8px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 border border-amber-200 dark:border-amber-800">
                              EXP ALERT
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300 font-medium">
                        <p className="flex items-center gap-1"><Truck size={13} className="text-slate-400" /> {item.supplierName}</p>
                        {item.supplierContact && <p className="text-[10px] text-slate-400 block mt-0.5">{item.supplierContact}</p>}
                      </td>

                      {/* Adjust controls */}
                      <td className="py-3.5 px-2 text-right">
                        {adjustingItemId === item.id ? (
                          <div className="flex items-center justify-end gap-1" id={`adjust-panel-${item.id}`}>
                            <input
                              type="number"
                              value={adjustQty}
                              onChange={e => setAdjustQty(parseInt(e.target.value) || 1)}
                              className="w-11 px-1 py-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded text-center text-xs font-bold text-slate-800 dark:text-slate-100"
                            />
                            <button
                              onClick={() => handleAdjustStock(item, 'In')}
                              className="p-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded"
                              title="Stock In (+)"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() => handleAdjustStock(item, 'Out')}
                              className="p-1 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-500 dark:text-rose-400 rounded"
                              title="Stock Out (-)"
                            >
                              <Minus size={12} />
                            </button>
                            <button
                              onClick={() => setAdjustingItemId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 font-semibold"
                            >
                              Close
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAdjustingItemId(item.id)}
                            className="text-xs bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold px-2.5 py-1 rounded-md transition-colors"
                          >
                            Deduct / Restock
                          </button>
                        )}
                      </td>

                      {/* Action - Delete Button */}
                      <td className="py-3.5 px-2 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete inventory item "${item.name}" (${item.id})?`)) {
                              if (onDeleteInventoryItem) {
                                onDeleteInventoryItem(item.id);
                                setSuccessMsg(`Inventory item "${item.name}" deleted successfully.`);
                                setTimeout(() => setSuccessMsg(''), 4000);
                              }
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Delete Inventory Item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No inventory items found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
