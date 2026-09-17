/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Receipt,
  Search,
  IndianRupee,
  PlusCircle,
  Trash2,
  Printer,
  CheckCircle,
  HelpCircle,
  Download,
  X
} from 'lucide-react';
import { Patient, TestTemplate, Invoice, InvoiceItem, TestReport } from '../types';
import { downloadInvoicePDF } from '../lib/pdf';

interface BillingViewProps {
  patients: Patient[];
  tests: TestTemplate[];
  reports: TestReport[];
  invoices: Invoice[];
  onAddInvoice: (invoice: Invoice) => void;
  isDemo?: boolean;
  t: any;
}

export default function BillingView({
  patients,
  tests,
  reports,
  invoices,
  onAddInvoice,
  isDemo,
  t
}: BillingViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Bill Form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [billItems, setBillItems] = useState<InvoiceItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Online'>('UPI');

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId);
    if (!patientId) {
      setBillItems([]);
      return;
    }
    const patientReports = reports.filter(r => r.patientId === patientId);
    if (patientReports.length > 0) {
      const items: InvoiceItem[] = patientReports.map(rep => {
        const matchedTest = tests.find(t => t.id === rep.testId || t.name.toLowerCase() === rep.testName.toLowerCase());
        const price = matchedTest ? matchedTest.price : 500;
        return {
          testId: rep.testId || matchedTest?.id || 'TEST-GENERAL',
          testName: rep.testName,
          price: price
        };
      });
      const uniqueItems = Array.from(new Map(items.map(item => [item.testId, item])).values());
      setBillItems(uniqueItems);
    } else {
      setBillItems([]);
    }
  };

  // Math variables
  const subtotal = billItems.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxable = subtotal - discountAmount;
  const gstAmount = taxable * 0.18; // 18% standard GST for medical diagnostics
  const total = taxable + gstAmount;
  const outstanding = total - paidAmount;

  let paymentStatus: 'Paid' | 'Unpaid' | 'Partial' = 'Unpaid';
  if (paidAmount >= total) paymentStatus = 'Paid';
  else if (paidAmount > 0) paymentStatus = 'Partial';

  // ID generator
  const generateNewInvoiceNo = () => {
    const existingNums = invoices.map(i => {
      const match = i.invoiceNo.match(/INV-2026-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextNum = maxNum + 1;
    return `INV-2026-${String(nextNum).padStart(4, '0')}`;
  };

  const handleAddTestToBill = (test: TestTemplate) => {
    if (billItems.some(item => item.testId === test.id)) {
      alert('This test panel is already added to current bill.');
      return;
    }
    setBillItems([...billItems, { testId: test.id, testName: test.name, price: test.price }]);
  };

  const handleRemoveItem = (testId: string) => {
    setBillItems(billItems.filter(item => item.testId !== testId));
  };

  const handleSubmitBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a registered patient first.');
      return;
    }
    if (billItems.length === 0) {
      alert('Please add at least one test panel to this invoice.');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    const newInvoiceNo = generateNewInvoiceNo();
    const newInvoice: Invoice = {
      invoiceNo: newInvoiceNo,
      patientId: patient.id,
      patientName: patient.name,
      items: billItems,
      subtotal,
      discount: discountPercent,
      discountAmount,
      gstPercent: 18,
      gstAmount,
      total,
      paidAmount,
      paymentStatus,
      paymentMode,
      outstandingBalance: outstanding < 0 ? 0 : outstanding,
      date: '2026-07-18'
    };

    onAddInvoice(newInvoice);
    setSelectedInvoice(newInvoice);
    setIsGenerating(false);

    // Reset fields
    setSelectedPatientId('');
    setBillItems([]);
    setDiscountPercent(0);
    setPaidAmount(0);
  };

  const handleDownloadInvoicePdf = async (invoice: Invoice) => {
    setIsDownloadingPdf(true);
    try {
      await downloadInvoicePDF(invoice, isDemo);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Filter list
  const filteredInvoices = invoices.filter(i => {
    const term = searchTerm.toLowerCase();
    return (
      i.patientName.toLowerCase().includes(term) ||
      i.invoiceNo.toLowerCase().includes(term) ||
      i.patientId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6" id="billing-view-container">
      {/* Header and Add Invoice Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="billing-header-section">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.billing}</h2>
          <p className="text-sm text-slate-500">Generate patients invoices, configure CGST/SGST tax, and track outstanding balances.</p>
        </div>
        {!isGenerating && (
          <button
            onClick={() => {
              setIsGenerating(true);
              setSelectedInvoice(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
            id="btn-generate-bill"
          >
            <PlusCircle size={18} />
            Generate New Invoice
          </button>
        )}
      </div>

      {isGenerating && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="bill-generator-form">
          {/* Bill Items selection */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Select Patient & Diagnostic Tests</h3>
              <button onClick={() => setIsGenerating(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-50">
                <X size={18} />
              </button>
            </div>

            {/* Select Patient */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600">Select Registered Patient *</label>
              <select
                value={selectedPatientId}
                onChange={e => handlePatientChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden focus:border-blue-500 font-semibold"
              >
                <option value="">-- Choose Registered Patient Profile --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) — {p.mobile}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Tests Catalog search */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Test Catalog (Click to Add)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {tests.map(test => (
                  <div
                    key={test.id}
                    onClick={() => handleAddTestToBill(test)}
                    className="p-3 bg-slate-50 hover:bg-blue-50/40 border border-slate-100 hover:border-blue-200 rounded-xl cursor-pointer text-xs flex justify-between items-center transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-700">{test.name}</p>
                      <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">{test.category} • Sample: {test.sampleType}</span>
                    </div>
                    <span className="text-blue-600 font-extrabold flex items-center">
                      <IndianRupee size={11} /> {test.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout billing summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between" id="bill-checkout-summary">
            <form onSubmit={handleSubmitBill} className="space-y-5">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 text-sm uppercase tracking-wider">Checkout Summary</h3>

              {/* Added test list */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Services ({billItems.length})</span>
                {billItems.length > 0 ? (
                  <div className="divide-y divide-slate-50 border-b border-slate-100 max-h-[140px] overflow-y-auto pr-1">
                    {billItems.map(item => (
                      <div key={item.testId} className="py-2 flex justify-between items-center text-xs">
                        <div className="truncate pr-2">
                          <p className="font-semibold text-slate-700 truncate">{item.testName}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-slate-600">₹{item.price}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.testId)}
                            className="text-red-400 hover:text-red-600 p-1 rounded-sm"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">No diagnostics selected. Click items from catalog list to add.</p>
                )}
              </div>

              {/* Discount inputs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-center font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">GST Tax (CGST+SGST)</label>
                  <div className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-500">
                    18% (Standard)
                  </div>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold"
                  >
                    <option value="UPI">UPI / GPay</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card Swipe</option>
                    <option value="Online">Online Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount Paid (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-center font-bold text-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Calculations Block */}
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs space-y-1.5 font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Discount ({discountPercent}%):</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST / SGST (18%):</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800 text-sm">
                  <span>Invoice Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-600 font-bold">
                  <span>Outstanding Balance:</span>
                  <span>₹{outstanding < 0 ? '0.00' : outstanding.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={15} /> Finalize bill & Generate Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice list table */}
      {!isGenerating && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="billing-receipts-list">
          {/* List of generated invoices */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="invoices-list-panel">
            {/* Search filter */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search invoices by invoice no, patient name or ID..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-3 px-2">Invoice No & Date</th>
                    <th className="py-3 px-2">Patient Profile</th>
                    <th className="py-3 px-2">Total Amount</th>
                    <th className="py-3 px-2">Paid Amount</th>
                    <th className="py-3 px-2">Payment Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInvoices.map(inv => (
                    <tr
                      key={inv.invoiceNo}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                        selectedInvoice?.invoiceNo === inv.invoiceNo ? 'bg-blue-50/40' : ''
                      }`}
                      id={`invoice-row-${inv.invoiceNo}`}
                    >
                      {/* Invoice ID & Date */}
                      <td className="py-3.5 px-2 font-mono">
                        <span className="font-bold text-slate-700 block">{inv.invoiceNo}</span>
                        <span className="text-[10px] text-slate-400 block">{inv.date}</span>
                      </td>

                      {/* Patient profile */}
                      <td className="py-3.5 px-2">
                        <span className="font-bold text-slate-700 block">{inv.patientName}</span>
                        <span className="text-[10px] font-bold text-blue-600 block">{inv.patientId}</span>
                      </td>

                      {/* Total bill */}
                      <td className="py-3.5 px-2 font-bold text-slate-800">
                        ₹{inv.total.toFixed(2)}
                      </td>

                      {/* Paid amount */}
                      <td className="py-3.5 px-2 font-semibold text-slate-600">
                        ₹{inv.paidAmount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {inv.paymentStatus}
                        </span>
                      </td>

                      {/* View Action */}
                      <td className="py-3.5 px-2 text-right flex items-center justify-end gap-3.5 pt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(inv);
                            setTimeout(() => {
                              window.print();
                            }, 100);
                          }}
                          className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Printer size={12} /> Print
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadInvoicePdf(inv);
                          }}
                          disabled={isDownloadingPdf}
                          className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <Download size={12} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No financial invoice records found under this search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Printable Invoice receipt preview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="invoice-bill-printer">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Receipt size={18} className="text-blue-600" /> Commercial Receipt Voucher
            </h3>

            {selectedInvoice ? (
              <div className="space-y-6 border border-slate-100 p-4 rounded-xl relative overflow-hidden" id="print-receipt-element">
                {/* Simulated Clinical Letterhead Header */}
                <div className="text-center border-b border-slate-200 pb-3">
                  <h4 className="font-extrabold text-blue-800 text-sm tracking-tight">APEX DIAGNOSTIC LABS</h4>
                  <p className="text-[9px] text-slate-400 max-w-[220px] mx-auto mt-0.5">Apex Mansion, Opposite Civil Hospital, Surat, Gujarat</p>
                  <span className="text-[8px] font-bold text-slate-500 font-mono">GSTIN: 24AAAAA0000A1Z5</span>
                </div>

                {/* Patient / Bill Meta */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-medium border-b border-slate-50 pb-3">
                  <div className="space-y-0.5">
                    <p>Bill No: <span className="font-bold font-mono text-slate-800">{selectedInvoice.invoiceNo}</span></p>
                    <p>Date: {selectedInvoice.date}</p>
                    <p>Payment Mode: <span className="font-bold">{selectedInvoice.paymentMode}</span></p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p>Patient ID: <span className="font-mono text-blue-600 font-bold">{selectedInvoice.patientId}</span></p>
                    <p className="font-bold text-slate-800">{selectedInvoice.patientName}</p>
                    <p>Status: <span className={`font-bold uppercase ${
                      selectedInvoice.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-red-500'
                    }`}>{selectedInvoice.paymentStatus}</span></p>
                  </div>
                </div>

                {/* Items and prices list */}
                <div className="space-y-1.5 text-[10px]">
                  <span className="font-bold text-slate-400 uppercase tracking-wide block">Diagnostics Billed</span>
                  <div className="divide-y divide-slate-50 border-b border-slate-100">
                    {selectedInvoice.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex justify-between">
                        <span className="text-slate-700 font-semibold">{item.testName}</span>
                        <span className="font-bold text-slate-600">₹{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals computation */}
                <div className="space-y-1 text-[10px] text-slate-500 text-right pt-2">
                  <p>Subtotal: <span className="font-semibold text-slate-700">₹{selectedInvoice.subtotal.toFixed(2)}</span></p>
                  <p className="text-red-600">Discount ({selectedInvoice.discount}%): <span>- ₹{selectedInvoice.discountAmount.toFixed(2)}</span></p>
                  <p>GST tax (18%): <span className="font-semibold text-slate-700">₹{selectedInvoice.gstAmount.toFixed(2)}</span></p>
                  <div className="border-t border-slate-100 pt-1 text-xs font-bold text-slate-800 flex justify-between">
                    <span>Total Bill:</span>
                    <span>₹{selectedInvoice.total.toFixed(2)} {(isDemo || selectedInvoice.tenantId === 'TNT-DEMO-PREVIEW') && <span className="text-red-600 font-black text-[10px] ml-1">(DEMO)</span>}</span>
                  </div>
                  <div className="text-emerald-600 font-bold flex justify-between pt-0.5">
                    <span>Amount Paid:</span>
                    <span>₹{selectedInvoice.paidAmount.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.outstandingBalance > 0 && (
                    <div className="text-red-600 font-extrabold flex justify-between pt-0.5 border-t border-slate-100">
                      <span>Outstanding Balance:</span>
                      <span>₹{selectedInvoice.outstandingBalance.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {(isDemo || selectedInvoice.tenantId === 'TNT-DEMO-PREVIEW') && (
                  <div className="bg-red-50 border-2 border-dashed border-red-500 rounded-xl p-3 my-3 text-center text-red-900">
                    <p className="font-black text-xs uppercase tracking-wider text-red-700">
                      ⚠️ DEMO MODE — SAMPLE INVOICE (DEMO)
                    </p>
                    <p className="text-[10px] font-bold text-red-800 mt-1 leading-relaxed">
                      THIS INVOICE IS GENERATED IN DEMO PREVIEW MODE. IT IS STRICTLY FOR SYSTEM TESTING AND CANNOT BE USED AS A LEGAL RECEIPT OR COMMERCIAL BILL.
                    </p>
                  </div>
                )}

                {/* Printing action tools */}
                <div className="flex items-center justify-center gap-3 border-t border-slate-100 pt-4" id="print-invoice-actions">
                  <button
                    onClick={() => window.print()}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer size={13} /> Print Invoice
                  </button>
                  <button
                    onClick={() => handleDownloadInvoicePdf(selectedInvoice)}
                    disabled={isDownloadingPdf}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-indigo-200 cursor-pointer disabled:opacity-50"
                  >
                    <Download size={13} /> {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl">
                <Receipt className="text-slate-300 mb-2" size={30} />
                <p className="text-xs text-slate-400">Select any transaction row from the billing panel list to display its receipt calculations, print invoices, or manage collection balances.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedInvoice && createPortal(
        <div id="print-section">
          <div className="bg-white text-slate-800 p-10 font-sans leading-relaxed max-w-2xl mx-auto border border-slate-300 rounded-xl">
            {/* Simulated Clinical Letterhead Header */}
            <div className="text-center border-b-2 border-blue-900 pb-4 mb-4">
              <h2 className="font-extrabold text-blue-900 text-lg tracking-tight">APEX DIAGNOSTICS & PATHOLOGY</h2>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Apex Mansion, Opposite Civil Hospital, Surat, Gujarat</p>
              <span className="text-[9px] font-bold text-slate-600 font-mono">GSTIN: 24AAAAA0000A1Z5 | Phone: +91 79 4005 8920</span>
            </div>

            {/* Receipt title */}
            <div className="bg-blue-950 text-white text-center py-2 rounded-md font-extrabold text-[11px] tracking-widest uppercase mb-4">
              COMMERCIAL RECEIPT VOUCHER {(isDemo || selectedInvoice.tenantId === 'TNT-DEMO-PREVIEW') ? '(DEMO RECEIPT)' : ''}
            </div>

            {/* Patient / Bill Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 font-medium border-b border-slate-200 pb-4 mb-4">
              <div className="space-y-1">
                <p>Bill No: <span className="font-bold font-mono text-slate-800">{selectedInvoice.invoiceNo}</span></p>
                <p>Date: {selectedInvoice.date}</p>
                <p>Payment Mode: <span className="font-bold text-slate-800">{selectedInvoice.paymentMode}</span></p>
              </div>
              <div className="space-y-1 text-right">
                <p>Patient ID: <span className="font-mono text-blue-600 font-bold">{selectedInvoice.patientId}</span></p>
                <p className="font-extrabold text-slate-900 text-sm">{selectedInvoice.patientName}</p>
                <p>Status: <span className={`font-bold uppercase ${
                  selectedInvoice.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-red-500'
                }`}>{selectedInvoice.paymentStatus}</span></p>
              </div>
            </div>

            {/* Items and prices list */}
            <div className="space-y-2 text-xs mb-6">
              <span className="font-bold text-slate-400 uppercase tracking-wide block text-[10px]">Diagnostics Billed</span>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-400 text-[10px] uppercase font-bold">
                    <th className="py-2">Test Name</th>
                    <th className="py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} className="font-medium">
                      <td className="py-2.5 text-slate-800">{item.testName}</td>
                      <td className="py-2.5 text-right font-bold text-slate-700">₹{item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals computation */}
            <div className="border-t border-slate-300 pt-4 text-xs text-slate-600 space-y-1.5 w-1/2 ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-700">₹{selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discount ({selectedInvoice.discount}%):</span>
                <span>- ₹{selectedInvoice.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (18%):</span>
                <span className="font-semibold text-slate-700">₹{selectedInvoice.gstAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 text-sm font-extrabold text-slate-800 flex justify-between">
                <span>Total Bill:</span>
                <span>₹{selectedInvoice.total.toFixed(2)} {(isDemo || selectedInvoice.tenantId === 'TNT-DEMO-PREVIEW') && <span className="text-red-600 text-[10px] ml-1">(DEMO)</span>}</span>
              </div>
              <div className="text-emerald-600 font-extrabold flex justify-between pt-0.5">
                <span>Amount Paid:</span>
                <span>₹{selectedInvoice.paidAmount.toFixed(2)}</span>
              </div>
              {selectedInvoice.outstandingBalance > 0 && (
                <div className="text-red-600 font-extrabold flex justify-between pt-0.5 border-t border-slate-100">
                  <span>Outstanding Balance:</span>
                  <span>₹{selectedInvoice.outstandingBalance.toFixed(2)}</span>
                </div>
              )}
            </div>

            {(isDemo || selectedInvoice.tenantId === 'TNT-DEMO-PREVIEW') && (
              <div className="bg-red-50 border-2 border-dashed border-red-500 rounded-xl p-3 my-4 text-center text-red-900">
                <p className="font-black text-xs uppercase tracking-wider text-red-700">
                  ⚠️ DEMO MODE — SAMPLE INVOICE RECEIPT (DEMO)
                </p>
                <p className="text-[10px] font-bold text-red-800 mt-1 leading-relaxed">
                  THIS INVOICE IS GENERATED IN DEMO PREVIEW MODE. IT IS STRICTLY FOR SYSTEM TESTING AND CANNOT BE USED AS A LEGAL RECEIPT, COMMERCIAL BILL, OR TAX CLAIM DOCUMENT.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-200 pt-6 mt-10 text-center text-[9px] text-slate-400 font-semibold leading-tight space-y-1">
              <p className="font-bold text-slate-500">Thank you for choosing Apex Diagnostics & Pathology.</p>
              <p>For report downloads, log into our secure Patient Portal using your Patient ID.</p>
              <p className="text-[8px] font-mono mt-2 text-slate-300">This is an automated computer generated receipt. No signature required.</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
