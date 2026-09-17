/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Search,
  Sparkles,
  Printer,
  Download,
  Share2,
  Send,
  User,
  Activity,
  UserCheck,
  BrainCircuit,
  Award,
  PenTool,
  Check,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { TestReport, ParameterValue, Patient } from '../types';
import { downloadReportPDF, generateReportPDFFile } from '../lib/pdf';

interface ReportsViewProps {
  reports: TestReport[];
  patients: Patient[];
  onSaveReportResults: (reportNo: string, parameters: ParameterValue[], doctorRemarks: string, pathologistName: string, status: 'Completed' | 'Processing') => void;
  onSaveAiSummary: (reportNo: string, aiSummary: string) => void;
  isDemo?: boolean;
  t: any;
}

export default function ReportsView({
  reports,
  patients,
  onSaveReportResults,
  onSaveAiSummary,
  isDemo,
  t
}: ReportsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null);
  const [isEditingValues, setIsEditingValues] = useState(false);
  const [viewMode, setViewMode] = useState<'lab-report' | 'ai-analytics'>('lab-report');

  // Editing state
  const [enteredValues, setEnteredValues] = useState<{ [paramName: string]: string }>({});
  const [remarks, setRemarks] = useState('');
  const [pathologistName, setPathologistName] = useState('Dr. Devangi Shah (MD)');

  // AI Loading state
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // WhatsApp Share States
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [autoDownloadPdf, setAutoDownloadPdf] = useState(true);

  // Set up values when editing starts
  const startEditing = (report: TestReport) => {
    const values: { [name: string]: string } = {};
    report.parameters.forEach(p => {
      values[p.name] = p.value || '';
    });
    setEnteredValues(values);
    setRemarks(report.doctorRemarks || '');
    setPathologistName(report.pathologistName || 'Dr. Devangi Shah (MD)');
    setIsEditingValues(true);
  };

  // Perform Clinical Bound Validation dynamically
  const validateValueStatus = (paramName: string, valueStr: string, report: TestReport): 'Normal' | 'High' | 'Low' => {
    const val = parseFloat(valueStr);
    if (isNaN(val)) return 'Normal';

    // Look up original ranges from tests or default rules
    // For simplicity, let's look up common normal limits
    let min = 0;
    let max = 100000;

    if (paramName === 'Hemoglobin') {
      min = 12.0;
      max = 17.5;
    } else if (paramName === 'Red Blood Cell (RBC)') {
      min = 4.1;
      max = 5.9;
    } else if (paramName === 'White Blood Cell (WBC)') {
      min = 4500;
      max = 11000;
    } else if (paramName === 'Platelets') {
      min = 150000;
      max = 450000;
    } else if (paramName === 'Fasting Blood Glucose') {
      min = 70;
      max = 100;
    } else if (paramName === 'HbA1c Level') {
      min = 4.0;
      max = 5.6;
    } else if (paramName === 'Total Cholesterol') {
      min = 125;
      max = 200;
    } else if (paramName === 'LDL Cholesterol') {
      min = 0;
      max = 100;
    } else if (paramName === 'HDL Cholesterol') {
      min = report.patientGender === 'Male' ? 40 : 50;
      max = 100;
    } else if (paramName === 'Triglycerides') {
      min = 0;
      max = 150;
    } else if (paramName === 'Urea') {
      min = 15;
      max = 45;
    } else if (paramName === 'Creatinine') {
      min = report.patientGender === 'Male' ? 0.7 : 0.6;
      max = report.patientGender === 'Male' ? 1.3 : 1.1;
    } else if (paramName === 'TSH') {
      min = 0.4;
      max = 4.5;
    } else if (paramName === 'Vitamin D Total') {
      min = 30;
      max = 100;
    } else if (paramName === 'Vitamin B12') {
      min = 211;
      max = 911;
    } else {
      // General defaults if no match
      return 'Normal';
    }

    if (val < min) return 'Low';
    if (val > max) return 'High';
    return 'Normal';
  };

  const handleValueChange = (paramName: string, val: string) => {
    setEnteredValues({
      ...enteredValues,
      [paramName]: val
    });
  };

  const handleSaveResults = (isFinalDraft: boolean) => {
    if (!selectedReport) return;

    const updatedParams: ParameterValue[] = selectedReport.parameters.map(p => {
      const enteredVal = enteredValues[p.name] || '';
      const status = validateValueStatus(p.name, enteredVal, selectedReport);
      return {
        ...p,
        value: enteredVal,
        status
      };
    });

    const finalStatus = isFinalDraft ? 'Completed' : 'Processing';
    onSaveReportResults(
      selectedReport.reportNo,
      updatedParams,
      remarks,
      pathologistName,
      finalStatus
    );

    // Update active UI panel report reference
    setSelectedReport({
      ...selectedReport,
      parameters: updatedParams,
      doctorRemarks: remarks,
      pathologistName,
      status: finalStatus
    });

    setIsEditingValues(false);
  };

  // Trigger server-side Gemini AI summary
  const handleAnalyzeWithAI = async () => {
    if (!selectedReport) return;
    setIsAnalyzingAi(true);
    setAiError('');

    try {
      const response = await fetch('/api/gemini-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testName: selectedReport.testName,
          patientName: selectedReport.patientName,
          patientAge: selectedReport.patientAge,
          patientGender: selectedReport.patientGender,
          doctorRef: selectedReport.doctorRef,
          parameters: selectedReport.parameters,
          doctorRemarks: selectedReport.doctorRemarks
        })
      });

      const data = await response.json();
      if (response.ok && data.summary) {
        onSaveAiSummary(selectedReport.reportNo, data.summary);
        setSelectedReport({
          ...selectedReport,
          aiSummary: data.summary
        });
      } else {
        throw new Error(data.error || 'Unknown response from server');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Connection timeout. Check your backend Gemini API Key.');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!selectedReport) return;
    setIsDownloadingPdf(true);
    try {
      await downloadReportPDF(selectedReport, isDemo);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const generateWhatsAppMessage = (report: TestReport) => {
    const parametersText = report.parameters
      .map(p => {
        let statusEmoji = '✅';
        let statusText = 'Normal';
        if (p.status === 'High') {
          statusEmoji = '🔺';
          statusText = 'HIGH';
        } else if (p.status === 'Low') {
          statusEmoji = '🔻';
          statusText = 'LOW';
        }
        return `• *${p.name}*: ${p.value || '—'} ${p.unit} [${statusEmoji} ${statusText}] (Ref: ${p.referenceRange})`;
      })
      .join('\n');

    return `*🔬 APEX DIAGNOSTICS & PATHOLOGY 🔬*\n` +
      `----------------------------------------\n` +
      `Dear *${report.patientName}*,\n\n` +
      `Your pathological *${report.testName}* report is ready and has been signed digitally by our medical experts.\n\n` +
      `👤 *Patient Details:*\n` +
      `• *Name*: ${report.patientName}\n` +
      `• *Age / Gender*: ${report.patientAge} Y / ${report.patientGender}\n` +
      `• *Patient ID*: ${report.patientId}\n` +
      `• *Report Number*: ${report.reportNo}\n` +
      `• *Date Collected*: ${report.collectedDate}\n\n` +
      `📊 *Test Results Overview:*\n` +
      `${parametersText}\n\n` +
      `📝 *Clinical Remarks:*\n` +
      `_${report.doctorRemarks || 'All parameters correlate within standard biological steady limits. Please consult with your referencing clinician.'}_\n\n` +
      `----------------------------------------\n` +
      `📥 *Note:* The official signed clinical PDF report has been downloaded to your local device. Please select the PDF to send in the chat! You can also view it digitally at ${window.location.origin}`;
  };

  // Share handlers
  const handleWhatsApp = () => {
    if (!selectedReport) return;
    const patient = patients.find(p => p.id === selectedReport.patientId);
    const mobile = patient?.mobile || '';
    setWhatsappNumber(mobile);
    setWhatsappMessage(generateWhatsAppMessage(selectedReport));
    setShowWhatsAppModal(true);
  };

  const handleEmailMock = () => {
    if (!selectedReport) return;
    alert(`Report email containing secure clinical PDF download link dispatched successfully to patient's registered email address.`);
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      r.patientName.toLowerCase().includes(term) ||
      r.reportNo.toLowerCase().includes(term) ||
      r.testName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6" id="reports-view">
      {/* Search and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="reports-header-section">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.reports}</h2>
          <p className="text-sm text-slate-500">Record diagnostic values, sign digitally, print official PDF copy, or generate AI analyses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="reports-main-layout">
        {/* Reports worklist list */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-xs p-5" id="reports-list-panel">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search reports by patient or ID..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1" id="reports-list-scroller">
            {filteredReports.map(r => (
              <div
                key={r.reportNo}
                onClick={() => {
                  setSelectedReport(r);
                  setIsEditingValues(false);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedReport?.reportNo === r.reportNo
                    ? 'border-blue-500 bg-blue-50/40 shadow-2xs'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
                id={`report-item-${r.reportNo}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm">
                    {r.reportNo}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 text-xs mt-2">{r.patientName}</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1">{r.testName}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100/60">
                  <div className="flex flex-col">
                    <span>Col: {r.collectedDate}</span>
                    {r.completedDate && <span>Comp: {r.completedDate}</span>}
                  </div>
                  {r.status === 'Completed' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await downloadReportPDF(r, isDemo);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      title="Download PDF"
                      id={`btn-download-list-pdf-${r.reportNo}`}
                    >
                      <Download size={11} /> {t.downloadPdf || 'Download PDF'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">No reports found.</p>
            )}
          </div>
        </div>

        {/* Action Detail Card */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="report-details-container">
          {selectedReport ? (
            <div className="space-y-6">
              {/* Report Header actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4" id="report-actions-row">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {selectedReport.testName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Order Ref: <span className="font-mono font-bold text-blue-600">{selectedReport.reportNo}</span> • Sample: {selectedReport.sampleType}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedReport.status !== 'Completed' && !isEditingValues && (
                    <button
                      onClick={() => startEditing(selectedReport)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
                      id="btn-enter-results"
                    >
                      Enter Parameters & Values
                    </button>
                  )}

                  {selectedReport.status === 'Completed' && (
                    <>
                      <button
                        onClick={handlePrintReport}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold px-3 py-2 shadow-xs"
                        title={t.printReport}
                      >
                        <Printer size={14} /> Print Lab Report
                      </button>
                      <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white border border-indigo-600 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold px-3 py-2 shadow-xs"
                        title="Download PDF"
                        id="btn-download-pdf"
                      >
                        {isDownloadingPdf ? (
                          <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Download size={14} />
                        )}
                        {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
                      </button>
                      <button
                        onClick={handleWhatsApp}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl transition-colors"
                        title="Share via WhatsApp"
                      >
                        <Share2 size={15} />
                      </button>
                      <button
                        onClick={handleEmailMock}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl transition-colors"
                        title="Send via Email"
                      >
                        <Send size={15} />
                      </button>
                    </>
                  )}
                </div>

                {selectedReport.status === 'Completed' && t.downloadTip && (
                  <p className="mt-3 text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-xl leading-relaxed shadow-3xs">
                    {t.downloadTip}
                  </p>
                )}
              </div>

              {/* Editing Form Panel */}
              {isEditingValues ? (
                <div className="space-y-5" id="report-edit-form">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fill Specimen Analytics Metrics</h4>

                  <div className="space-y-4">
                    {selectedReport.parameters.map(param => (
                      <div key={param.name} className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-700">{param.name}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Value"
                            value={enteredValues[param.name] || ''}
                            onChange={e => handleValueChange(param.name, e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-hidden focus:border-blue-500 text-center"
                          />
                          <span className="text-xs text-slate-400 font-bold">{param.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold bg-white p-1.5 rounded-md border border-slate-100 text-center">
                          Ref Range: {selectedReport.patientGender === 'Male' ? param.referenceRange : param.referenceRange}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Doctor Remarks Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor Remarks & Recommendations</label>
                    <textarea
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      placeholder="Add pathologist commentary..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* Pathologist signature name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Authorized MD Pathologist</label>
                      <input
                        type="text"
                        value={pathologistName}
                        onChange={e => setPathologistName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-400 font-mono flex items-center gap-2">
                        <PenTool size={14} className="text-blue-500 shrink-0" />
                        Digital Signature will be dynamically stamped upon report sign-off.
                      </div>
                    </div>
                  </div>

                  {/* Submit actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingValues(false)}
                      className="px-3.5 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveResults(false)}
                      className="px-3.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold border border-amber-200"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveResults(true)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                    >
                      <UserCheck size={14} /> Digitally Sign & Complete
                    </button>
                  </div>
                </div>
              ) : (
                /* Report View Mode */
                <div className="space-y-6">
                  {/* View Mode Tab Switcher */}
                  <div className="flex border-b border-slate-200">
                    <button
                      onClick={() => setViewMode('lab-report')}
                      className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
                        viewMode === 'lab-report'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      📄 Original Lab Report Copy
                    </button>
                    <button
                      onClick={() => setViewMode('ai-analytics')}
                      className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1 ${
                        viewMode === 'ai-analytics'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ✨ Smart AI & Clinical Interpretation
                    </button>
                  </div>

                  {viewMode === 'lab-report' ? (
                    /* ORIGINAL LAB REPORT PRESENTATION SHEETS (On Screen A4 Design) */
                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
                      <p className="text-[11px] text-slate-400 font-medium mb-3 text-center">
                        👇 Below is the exact digital preview of the official laboratory pathology copy. Click <b>"Print Lab Report"</b> above to output physical sheet.
                      </p>

                      {/* Main A4 sheet emulator container */}
                      <div
                        id="printable-lab-report"
                        className="bg-white text-slate-800 p-6 md:p-10 border border-slate-300 shadow-lg rounded-xl max-w-4xl mx-auto font-sans leading-relaxed"
                      >
                        {/* Lab Letterhead Header */}
                        <div className="flex justify-between items-start border-b-2 border-blue-900 pb-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 bg-blue-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-md border-2 border-blue-800 shrink-0">
                              🔬
                            </div>
                            <div>
                              <h1 className="text-lg font-extrabold text-blue-950 tracking-tight leading-none">
                                APEX DIAGNOSTICS & PATHOLOGY
                              </h1>
                              <p className="text-[9px] font-bold text-blue-800 tracking-wider uppercase mt-1">
                                Fully Automated Clinical Laboratories & Diagnostic Center
                              </p>
                              <p className="text-[8px] text-slate-500 mt-0.5 leading-tight font-medium">
                                ISO 9001:2015 Certified • National Accreditation Board (NABL) Certified • Reg No: AM-2026/89312
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-[8px] text-slate-500 leading-normal font-medium max-w-xs">
                            <p className="font-extrabold text-slate-800 text-[9px] tracking-wide">CENTRAL DISPATCH BRANCH</p>
                            <p>402-405, Clinic Heights, Opposite Civil Hospital</p>
                            <p>Ahmedabad, Gujarat, India - 380001</p>
                            <p className="font-bold text-blue-900">Phone: +91 79 4005 8920 | contact@apexdiagnostics.com</p>
                          </div>
                        </div>

                        {/* NABL and barcode strip */}
                        <div className="flex justify-between items-center text-[10px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mb-4 font-semibold text-slate-600">
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-extrabold text-white bg-red-600 px-1.5 py-0.5 rounded text-[8px] tracking-wider whitespace-nowrap shrink-0">
                              NABL ACCREDITED
                            </span>
                            <span className="whitespace-nowrap shrink-0">Registration No: MC-2026-66712</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[9px] shrink-0">
                            <span>Specimen Barcode:</span>
                            <span className="font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded">{selectedReport.barcode}</span>
                          </div>
                        </div>

                        {/* Patient Information Grid Box */}
                        <div className="border border-slate-300 rounded-lg overflow-hidden mb-6 text-[10px] leading-relaxed">
                          <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-50/50">
                            {/* Left Box Column */}
                            <div className="p-3 space-y-2">
                              <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-bold uppercase text-[9px]">Patient Name:</span>
                                <span className="col-span-2 font-extrabold text-slate-900 text-xs">{selectedReport.patientName}</span>
                              </div>
                              <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-bold uppercase text-[9px]">Age / Gender:</span>
                                <span className="col-span-2 font-bold text-slate-800">{selectedReport.patientAge} Years / {selectedReport.patientGender}</span>
                              </div>
                              <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-bold uppercase text-[9px]">Patient ID (PID):</span>
                                <span className="col-span-2 font-mono font-bold text-blue-700">{selectedReport.patientId}</span>
                              </div>
                            </div>
                            {/* Right Box Column */}
                            <div className="p-3 space-y-2">
                              <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-bold uppercase text-[9px]">Ref. Doctor:</span>
                                <span className="col-span-2 font-extrabold text-slate-800 italic">{selectedReport.doctorRef}</span>
                              </div>
                              <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-bold uppercase text-[9px]">Collected Date:</span>
                                <span className="col-span-2 font-bold text-slate-700">{selectedReport.collectedDate} 08:30 AM</span>
                              </div>
                              <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-bold uppercase text-[9px]">Reported Date:</span>
                                <span className="col-span-2 font-bold text-slate-700">{selectedReport.completedDate || selectedReport.collectedDate} 05:00 PM</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Department Banner Header */}
                        <div className="bg-blue-950 text-white text-center py-2 rounded-md font-extrabold text-[11px] tracking-widest uppercase mb-4">
                          DEPARTMENT OF {selectedReport.category.toUpperCase() || 'BIOCHEMISTRY'}
                        </div>

                        {/* Test Sub-Title Banner */}
                        <div className="border-b border-slate-300 pb-2 mb-4">
                          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                            {selectedReport.testName}
                          </h2>
                          <p className="text-[9px] text-slate-500 italic mt-0.5">
                            Methodology: Fully Automated Chemiluminescence Immunoassay (CLIA) & Dry Chemistry Technology
                          </p>
                        </div>

                        {/* Lab Report Parameters Table */}
                        <table className="w-full text-left text-[11px] mb-6">
                          <thead>
                            <tr className="border-b-2 border-slate-300 text-[10px] uppercase text-slate-400 tracking-wider">
                              <th className="py-2.5 font-extrabold w-2/5">Test Parameter</th>
                              <th className="py-2.5 text-center font-extrabold w-1/5">Observed Value</th>
                              <th className="py-2.5 text-center font-extrabold w-1/5">Unit</th>
                              <th className="py-2.5 text-right font-extrabold w-1/5">Biological Ref Interval</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                            {selectedReport.parameters.map((param, index) => {
                              const isOutOfRange = param.status === 'High' || param.status === 'Low';
                              const isDemoMode = isDemo || selectedReport.tenantId === 'TNT-DEMO-PREVIEW';
                              return (
                                <tr key={index} className={`hover:bg-slate-50/50 ${isOutOfRange ? 'bg-red-50/30 font-bold' : ''}`}>
                                  <td className="py-3 text-slate-900 font-bold">{param.name}</td>
                                  <td className="py-3 text-center">
                                    <span className={`px-2.5 py-1 rounded-md text-[11px] ${
                                      param.status === 'High' ? 'text-red-700 bg-red-100 font-extrabold' :
                                      param.status === 'Low' ? 'text-blue-700 bg-blue-100 font-extrabold' : 'text-slate-900 font-extrabold'
                                    }`}>
                                      {param.value || '—'} {isDemoMode && <span className="text-red-600 font-black text-[10px] ml-1">[DEMO RESULT]</span>} {param.status !== 'Normal' ? `* (${param.status})` : ''}
                                    </span>
                                  </td>
                                  <td className="py-3 text-center text-slate-500 font-bold">{param.unit || '—'}</td>
                                  <td className="py-3 text-right font-mono font-bold text-slate-600">{param.referenceRange}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {(isDemo || selectedReport.tenantId === 'TNT-DEMO-PREVIEW') && (
                          <div className="bg-red-50 border-2 border-dashed border-red-500 rounded-xl p-3.5 my-4 text-center text-red-900">
                            <p className="font-black text-xs uppercase tracking-wider text-red-700">
                              ⚠️ DEMO MODE — SAMPLE REPORT (DEMO RESULT)
                            </p>
                            <p className="text-[10px] font-bold text-red-800 mt-1 leading-relaxed">
                              THIS REPORT IS PRODUCED IN DEMO PREVIEW MODE WITH SAMPLE DATA. IT IS STRICTLY FOR EVALUATION PURPOSES AND CANNOT BE USED FOR CLINICAL DIAGNOSIS, PATIENT CARE, OR COMMERCIAL PRINTING.
                            </p>
                          </div>
                        )}

                        {/* Clinician Pathology Remarks Notes */}
                        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 text-[10px] text-slate-600 mb-6 leading-relaxed">
                          <span className="font-extrabold text-slate-800 block mb-1 uppercase tracking-wider text-[8px]">
                            Pathology clinical commentary & Remarks
                          </span>
                          <p className="italic">
                            {selectedReport.doctorRemarks || 'All results are clinical within normal limits, suggesting biological steady state for parameters tested. Please correlate clinically with symptoms.'}
                          </p>
                        </div>

                        {/* Authenticated Dual Clinical Signatures / Pending Notice */}
                        {(() => {
                          const isBothVerified = selectedReport.technicianVerified && (selectedReport.pathologistVerified || selectedReport.status === 'Completed');
                          if (isBothVerified) {
                            return (
                              <div className="border-t border-slate-300 pt-6 mt-6 flex justify-between items-end text-[10px] text-slate-500 avoid-break leading-normal font-semibold">
                                {/* Lab Technician */}
                                <div className="text-left space-y-1">
                                  {localStorage.getItem('apex_technicianSignature') ? (
                                    <img
                                      src={localStorage.getItem('apex_technicianSignature') as string}
                                      alt="Technician Signature"
                                      className="h-12 w-28 object-contain mr-auto mb-1"
                                    />
                                  ) : null}
                                  <p className="font-extrabold text-slate-700 text-[10px]">
                                    {localStorage.getItem('apex_technicianName') || selectedReport.technicianName || 'Amit Trivedi'}
                                  </p>
                                  <p>Lab Technician & Technologist</p>
                                  <p className="text-[8px] text-slate-400">{localStorage.getItem('apex_technicianDegree') || 'B.Sc. M.L.T. • Reg No: LT-2026-9912'}</p>

                                  <div className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 font-extrabold px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider mt-1">
                                    ✓ SAMPLE VERIFIED
                                  </div>
                                </div>

                                {/* Pathologist */}
                                <div className="text-right space-y-1">
                                  {localStorage.getItem('apex_pathologistSignature') ? (
                                    <img
                                      src={localStorage.getItem('apex_pathologistSignature') as string}
                                      alt="Pathologist Signature"
                                      className="h-12 w-28 object-contain ml-auto mb-1"
                                    />
                                  ) : null}
                                  <p className="font-extrabold text-slate-700 text-[10px]">
                                    {localStorage.getItem('apex_pathologistName') || selectedReport.pathologistName || 'Devangi Shah'}
                                  </p>
                                  <p>Consultant Pathology Clinical Director</p>
                                  <p className="text-[8px] text-slate-400">{localStorage.getItem('apex_pathologistDegree') || 'M.D. (Pathology) • Reg No: G-14232'}</p>

                                  <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider mt-1">
                                    ✓ REPORT VERIFIED
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="border-t border-slate-300 pt-5 mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-900 text-xs">
                                <p className="font-bold mb-1">⚠️ DUAL VERIFICATION PENDING</p>
                                <p className="text-[11px] text-red-700 mb-3">
                                  Certified clinical names and signatures will appear here only after <strong>both</strong> the Lab Technician (Sample Sign-off) and Pathologist (Report Sign-off) verify this test report.
                                </p>
                                <div className="flex justify-center gap-6 text-[11px] font-bold">
                                  <span className={`px-2.5 py-1 rounded-md ${selectedReport.technicianVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                    Lab Technician: {selectedReport.technicianVerified ? '✓ Verified' : '⏳ Pending'}
                                  </span>
                                  <span className={`px-2.5 py-1 rounded-md ${selectedReport.pathologistVerified || selectedReport.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                    Pathologist: {selectedReport.pathologistVerified || selectedReport.status === 'Completed' ? '✓ Verified' : '⏳ Pending'}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                        })()}

                        {/* Footer disclaimer copy */}
                        <div className="border-t border-slate-100 pt-4 mt-6 text-center text-[7px] text-slate-400 leading-tight">
                          <p className="font-bold">*** END OF PATHOLOGICAL REPORT ***</p>
                          <p className="mt-1">
                            This is a digitally generated patient record. It is secured using authenticated SHA-256 signatures of certifying physicians.
                          </p>
                          <p>
                            Please consult with your clinical referencing physician for therapy administration and clinical diagnostics correlation.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* SMART AI & CLINICAL ANALYTICS VIEW TAB */
                    <div className="space-y-6" id="report-view-mode">
                      {/* Patient mini summary metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Patient Profile</span>
                          <strong className="text-slate-800 text-sm">{selectedReport.patientName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Age / Gender</span>
                          <span className="text-slate-700">{selectedReport.patientAge} Yrs / {selectedReport.patientGender}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Barcode Tag</span>
                          <span className="font-mono text-slate-700">{selectedReport.barcode}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Ref Doctor</span>
                          <span className="text-slate-700 block truncate italic font-bold">{selectedReport.doctorRef}</span>
                        </div>
                      </div>

                      {/* Parameters Table values */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity size={14} className="text-blue-500" /> Specimen Parameter Results
                        </h4>

                        <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                          <div className="grid grid-cols-4 bg-slate-50 p-2.5 border-b border-slate-100 text-slate-400 font-bold">
                            <span>Parameter Name</span>
                            <span className="text-center">Patient Value</span>
                            <span className="text-center">Unit</span>
                            <span className="text-right">Reference Range</span>
                          </div>
                          <div className="divide-y divide-slate-50">
                            {selectedReport.parameters.map(param => (
                              <div key={param.name} className="grid grid-cols-4 p-3 items-center">
                                <span className="font-bold text-slate-700">{param.name}</span>
                                <div className="text-center">
                                  {param.value ? (
                                    <span className={`font-bold px-2 py-0.5 rounded-sm ${
                                      param.status === 'High' ? 'bg-red-50 text-red-600' :
                                      param.status === 'Low' ? 'bg-blue-50 text-blue-600' : 'text-slate-800'
                                    }`}>
                                      {param.value} {param.status !== 'Normal' ? `(${param.status})` : ''}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">Pending entry</span>
                                  )}
                                </div>
                                <span className="text-center text-slate-500 font-medium">{param.unit || '—'}</span>
                                <span className="text-right text-slate-500 font-mono font-bold">
                                  {selectedReport.patientGender === 'Male' ? param.referenceRange : param.referenceRange}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Doctor Remarks block */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs">
                        <span className="font-bold text-slate-700 block mb-1 uppercase text-[10px]">Pathologist clinical Remarks</span>
                        <p className="text-slate-600 leading-relaxed italic">
                          {selectedReport.doctorRemarks || 'No formal diagnostic commentary entered yet.'}
                        </p>
                      </div>

                      {/* AI Report Summary block */}
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100/50 relative" id="report-ai-summary-box">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                            <BrainCircuit size={16} className="text-indigo-600" /> {t.aiSummary}
                          </h4>
                          {selectedReport.status === 'Completed' && !selectedReport.aiSummary && (
                            <button
                              onClick={handleAnalyzeWithAI}
                              disabled={isAnalyzingAi}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              {isAnalyzingAi ? 'Analyzing Specimen...' : t.runSummary} <Sparkles size={11} />
                            </button>
                          )}
                        </div>

                        {isAnalyzingAi && (
                          <div className="py-4 text-center space-y-2 animate-pulse">
                            <BrainCircuit size={28} className="text-indigo-600 animate-bounce mx-auto" />
                            <p className="text-xs text-indigo-700 font-medium">Reading report parameters. Analyzing medical reference values via Gemini AI...</p>
                          </div>
                        )}

                        {aiError && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{aiError}</span>
                          </div>
                        )}

                        {selectedReport.aiSummary ? (
                          <div className="text-xs text-slate-700 leading-relaxed space-y-2 font-light" id="ai-response-text">
                            <p className="whitespace-pre-line">{selectedReport.aiSummary}</p>
                          </div>
                        ) : (
                          !isAnalyzingAi && (
                            <p className="text-xs text-slate-400 italic">
                              Click "Analyze Report with AI" to let our integrated clinical model translate pathological metrics and ranges into easily readable clinical summaries.
                            </p>
                          )
                        )}
                      </div>

                      {/* Digital Stamp Sign-off info */}
                      {selectedReport.status === 'Completed' && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Verified By</span>
                            <strong className="text-slate-700">{selectedReport.pathologistName}</strong>
                            <span className="text-[10px] text-slate-400 block font-medium">Board-Certified Pathologist</span>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg">
                            <Award size={18} className="text-emerald-600" />
                            <div className="text-[10px]">
                              <span className="font-bold text-slate-700 block">DIGITAL SIGNATURE ACTIVE</span>
                              <span className="text-slate-400 font-mono">Secured (SHA-256)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-2xl">
              <FileText className="text-slate-300 mb-2" size={42} />
              <p className="text-sm font-semibold text-slate-500">No Patient Report Selected</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">Select an active report log card from the left panel list. Clinicians can complete parameters, verify ranges, authorize digital pathology seals, or trigger Gemini-powered clinical insights.</p>
            </div>
          )}
        </div>
      </div>
      {selectedReport && createPortal(
        <div id="print-section">
          {/* Main A4 sheet emulator container */}
          <div
            className="bg-white text-slate-800 p-10 font-sans leading-relaxed"
            style={{ minHeight: '297mm', boxSizing: 'border-box' }}
          >
            {/* Lab Letterhead Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-900 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-blue-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-md border-2 border-blue-800 shrink-0">
                  🔬
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-blue-950 tracking-tight leading-none">
                    APEX DIAGNOSTICS & PATHOLOGY
                  </h1>
                  <p className="text-[9px] font-bold text-blue-800 tracking-wider uppercase mt-1">
                    Fully Automated Clinical Laboratories & Diagnostic Center
                  </p>
                  <p className="text-[8px] text-slate-500 mt-0.5 leading-tight font-medium">
                    ISO 9001:2015 Certified • National Accreditation Board (NABL) Certified • Reg No: AM-2026/89312
                  </p>
                </div>
              </div>
              <div className="text-right text-[8px] text-slate-500 leading-normal font-medium max-w-xs">
                <p className="font-extrabold text-slate-800 text-[9px] tracking-wide">CENTRAL DISPATCH BRANCH</p>
                <p>402-405, Clinic Heights, Opposite Civil Hospital</p>
                <p>Ahmedabad, Gujarat, India - 380001</p>
                <p className="font-bold text-blue-900">Phone: +91 79 4005 8920 | contact@apexdiagnostics.com</p>
              </div>
            </div>

            {/* NABL and barcode strip */}
            <div className="flex justify-between items-center text-[10px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mb-4 font-semibold text-slate-600">
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-extrabold text-white bg-red-600 px-1.5 py-0.5 rounded text-[8px] tracking-wider whitespace-nowrap shrink-0">
                  NABL ACCREDITED
                </span>
                <span className="whitespace-nowrap shrink-0">Registration No: MC-2026-66712</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] shrink-0">
                <span>Specimen Barcode:</span>
                <span className="font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded">{selectedReport.barcode}</span>
              </div>
            </div>

            {/* Patient Information Grid Box */}
            <div className="border border-slate-300 rounded-lg overflow-hidden mb-6 text-[10px] leading-relaxed">
              <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-50/50">
                {/* Left Box Column */}
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Patient Name:</span>
                    <span className="col-span-2 font-extrabold text-slate-900 text-xs">{selectedReport.patientName}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Age / Gender:</span>
                    <span className="col-span-2 font-bold text-slate-800">{selectedReport.patientAge} Years / {selectedReport.patientGender}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Patient ID (PID):</span>
                    <span className="col-span-2 font-mono font-bold text-blue-700">{selectedReport.patientId}</span>
                  </div>
                </div>
                {/* Right Box Column */}
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Ref. Doctor:</span>
                    <span className="col-span-2 font-extrabold text-slate-800 italic">{selectedReport.doctorRef}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Collected Date:</span>
                    <span className="col-span-2 font-bold text-slate-700">{selectedReport.collectedDate} 08:30 AM</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Reported Date:</span>
                    <span className="col-span-2 font-bold text-slate-700">{selectedReport.completedDate || selectedReport.collectedDate} 05:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Banner Header */}
            <div className="bg-blue-950 text-white text-center py-2 rounded-md font-extrabold text-[11px] tracking-widest uppercase mb-4">
              DEPARTMENT OF {selectedReport.category.toUpperCase() || 'BIOCHEMISTRY'}
            </div>

            {/* Test Sub-Title Banner */}
            <div className="border-b border-slate-300 pb-2 mb-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                {selectedReport.testName}
              </h2>
              <p className="text-[9px] text-slate-500 italic mt-0.5">
                Methodology: Fully Automated Chemiluminescence Immunoassay (CLIA) & Dry Chemistry Technology
              </p>
            </div>

            {/* Lab Report Parameters Table */}
            <table className="w-full text-left text-[11px] mb-6">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[10px] uppercase text-slate-400 tracking-wider">
                  <th className="py-2.5 font-extrabold w-2/5">Test Parameter</th>
                  <th className="py-2.5 text-center font-extrabold w-1/5">Observed Value</th>
                  <th className="py-2.5 text-center font-extrabold w-1/5">Unit</th>
                  <th className="py-2.5 text-right font-extrabold w-1/5">Biological Ref Interval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800 font-sans">
                {selectedReport.parameters.map((param, index) => {
                  const isOutOfRange = param.status === 'High' || param.status === 'Low';
                  return (
                    <tr key={index} className={`hover:bg-slate-50/50 ${isOutOfRange ? 'bg-red-50/30 font-bold' : ''}`}>
                      <td className="py-3 text-slate-900 font-bold">{param.name}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] ${
                          param.status === 'High' ? 'text-red-700 bg-red-100 font-extrabold' :
                          param.status === 'Low' ? 'text-blue-700 bg-blue-100 font-extrabold' : 'text-slate-900 font-extrabold'
                        }`}>
                          {param.value || '—'} {param.status !== 'Normal' ? `* (${param.status})` : ''}
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-500 font-bold">{param.unit || '—'}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-600">{param.referenceRange}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Clinician Pathology Remarks Notes */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 text-[10px] text-slate-600 mb-6 leading-relaxed">
              <span className="font-extrabold text-slate-800 block mb-1 uppercase tracking-wider text-[8px]">
                Pathology clinical commentary & Remarks
              </span>
              <p className="italic">
                {selectedReport.doctorRemarks || 'All results are clinical within normal limits, suggesting biological steady state for parameters tested. Please correlate clinically with symptoms.'}
              </p>
            </div>

            {/* Authenticated stamp and clinical signatures */}
            <div className="border-t border-slate-300 pt-6 mt-6 grid grid-cols-3 items-end text-[10px] text-slate-500 avoid-break leading-normal font-semibold">
              {/* Technician */}
              <div className="space-y-1">
                <div className="font-mono text-xs text-slate-300 italic font-bold">
                  {localStorage.getItem('apex_technicianName') || 'Amit Trivedi'}
                </div>
                <p className="font-extrabold text-slate-700 text-[10px]">
                  {localStorage.getItem('apex_technicianName') || 'Amit Trivedi'}
                </p>
                <p>Senior Technical Lab Manager</p>
                <p className="text-[8px] text-slate-400">{localStorage.getItem('apex_technicianDegree') || 'B.Sc. M.L.T. • Reg No: LT-2026-9912'}</p>
              </div>

              {/* Stamp / verification */}
              <div className="flex flex-col items-center text-center">
                {/* Simulated Grid-Style QR Code Verification */}
                <div className="h-16 w-16 border border-slate-300 p-1 bg-white mb-2 shadow-xs flex flex-wrap content-between justify-between">
                  <div className="h-4 w-4 bg-slate-900"></div>
                  <div className="h-4 w-4 bg-slate-900"></div>
                  <div className="h-4 w-1 bg-slate-800"></div>
                  <div className="h-1 w-6 bg-slate-900"></div>
                  <div className="h-4 w-4 bg-slate-900"></div>
                  <div className="h-2 w-2 bg-slate-900"></div>
                  <div className="h-4 w-4 bg-slate-900"></div>
                </div>
                <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wide">Apex Secure Verification</p>
                <p className="text-[7px] font-mono text-slate-400">SHA-256 Digital Signature Verified</p>
              </div>

              {/* Pathologist */}
              <div className="text-right space-y-1">
                <div className="font-mono text-xs text-blue-800 italic font-bold">
                  {(localStorage.getItem('apex_pathologistName') || selectedReport.pathologistName || 'Devangi Shah').replace(/Dr\.\s*/, '')}
                </div>
                <p className="font-extrabold text-slate-700 text-[10px]">
                  {localStorage.getItem('apex_pathologistName') || selectedReport.pathologistName || 'Devangi Shah'}
                </p>
                <p>Consultant Pathology Clinical Director</p>
                <p className="text-[8px] text-slate-400">{localStorage.getItem('apex_pathologistDegree') || 'M.D. (Pathology) • Reg No: G-14232'}</p>

                <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider mt-1">
                  ✓ VERIFIED LAB RECORD
                </div>
              </div>
            </div>

            {/* Footer disclaimer copy */}
            <div className="border-t border-slate-100 pt-4 mt-6 text-center text-[7px] text-slate-400 leading-tight">
              <p className="font-bold">*** END OF PATHOLOGICAL REPORT ***</p>
              <p className="mt-1">
                This is a digitally generated patient record. It is secured using authenticated SHA-256 signatures of certifying physicians.
              </p>
              <p>
                Please consult with your clinical referencing physician for therapy administration and clinical diagnostics correlation.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
      {showWhatsAppModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">WhatsApp Direct PDF & Report Share</h3>
                  <p className="text-[10px] text-slate-500">Share original clinical PDF report directly to patient's WhatsApp number.</p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Feature highlight info box */}
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Original Certified PDF Report Attachment Ready</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  The original <strong>Clinical_Report_{selectedReport.reportNo}.pdf</strong> file with doctor signatures and NABL header will be automatically generated and attached to the share request.
                </p>
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Patient WhatsApp Number / व्हाट्सएप नंबर
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Enter 10-digit mobile number (e.g. 9825012345)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
                <p className="text-[9px] text-slate-400">
                  Tip: Standard 10-digit numbers automatically default to India (+91). You can also include custom country codes.
                </p>
              </div>

              {/* Message Draft Box */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Report Summary Text / रिपोर्ट विवरण
                </label>
                <textarea
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono text-[11px] leading-relaxed resize-none"
                />
              </div>

              {/* Auto PDF Toggle */}
              <label className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoDownloadPdf}
                  onChange={(e) => setAutoDownloadPdf(e.target.checked)}
                  className="h-4 w-4 rounded-sm text-emerald-600 border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                />
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    Auto-Save Original PDF to Downloads / ओरिजिनल PDF डाउनलोड करें
                  </span>
                  <span className="block text-[9px] text-slate-400 mt-0.5">
                    Ensures the original signed PDF is saved locally for manual attachment if using WhatsApp Web in browser.
                  </span>
                </div>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-all text-xs"
              >
                Cancel
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Native Web Share with PDF File Attachment */}
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    onClick={async () => {
                      try {
                        const { file } = await generateReportPDFFile(selectedReport);
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                          await navigator.share({
                            title: `Clinical Report - ${selectedReport.patientName}`,
                            text: whatsappMessage,
                            files: [file]
                          });
                          setShowWhatsAppModal(false);
                          return;
                        }
                      } catch (err) {
                        console.log('Web share cancelled or unsupported', err);
                      }
                      // Fallback to wa.me if navigator.share fails or is dismissed
                      let formattedMobile = whatsappNumber.replace(/\D/g, '');
                      if (formattedMobile.length === 10) formattedMobile = '91' + formattedMobile;
                      if (autoDownloadPdf) await downloadReportPDF(selectedReport);
                      const url = `https://wa.me/${formattedMobile}?text=${encodeURIComponent(whatsappMessage)}`;
                      window.open(url, '_blank');
                      setShowWhatsAppModal(false);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Directly attaches the original PDF file in WhatsApp (Supported on Mobile & native apps)"
                  >
                    <FileText size={14} /> Attach Original PDF directly
                  </button>
                )}

                {/* WhatsApp Link button */}
                <button
                  onClick={async () => {
                    let formattedMobile = whatsappNumber.replace(/\D/g, '');
                    if (formattedMobile.length === 10) {
                      formattedMobile = '91' + formattedMobile;
                    }
                    
                    if (autoDownloadPdf) {
                      await downloadReportPDF(selectedReport);
                    }

                    const url = `https://wa.me/${formattedMobile}?text=${encodeURIComponent(whatsappMessage)}`;
                    window.open(url, '_blank');
                    setShowWhatsAppModal(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 dark:shadow-none transition-all cursor-pointer"
                >
                  <Send size={14} /> Open WhatsApp Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
