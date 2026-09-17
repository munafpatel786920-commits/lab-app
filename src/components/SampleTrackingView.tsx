/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Beaker,
  QrCode,
  CheckCircle,
  XCircle,
  FileClock,
  Search,
  User,
  FlaskConical,
  Printer,
  ChevronRight
} from 'lucide-react';
import { TestReport } from '../types';

interface SampleTrackingViewProps {
  reports: TestReport[];
  onUpdateReportStatus: (reportNo: string, status: 'Collected' | 'Processing' | 'Completed' | 'Rejected', technicianName?: string, technicianVerified?: boolean) => void;
  t: any;
}

export default function SampleTrackingView({
  reports,
  onUpdateReportStatus,
  t
}: SampleTrackingViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null);
  const [technicianName, setTechnicianName] = useState('Haresh Solanki');

  // Filter reports
  const activeSampleOrders = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = r.patientName.toLowerCase().includes(term) ||
      r.reportNo.toLowerCase().includes(term) ||
      r.testName.toLowerCase().includes(term) ||
      r.barcode.toLowerCase().includes(term);
    return matchesSearch;
  });

  return (
    <div className="space-y-6" id="sample-tracking-view">
      {/* Header section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t.samples}</h2>
        <p className="text-sm text-slate-500">Scan specimen barcodes, trace specimen tray routes, and coordinate processing pipelines.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="sample-main-layout">
        {/* Work List column */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="sample-orders-panel">
          {/* Search bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Barcode, Report No, Patient Name..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="py-3 px-2">Barcode & Report No</th>
                  <th className="py-3 px-2">Patient Details</th>
                  <th className="py-3 px-2">Test Panel</th>
                  <th className="py-3 px-2">Specimen Matrix</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeSampleOrders.map(r => (
                  <tr
                    key={r.reportNo}
                    onClick={() => setSelectedReport(r)}
                    className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${
                      selectedReport?.reportNo === r.reportNo ? 'bg-blue-50/40' : ''
                    }`}
                    id={`row-sample-${r.reportNo}`}
                  >
                    {/* Barcode & Rep No */}
                    <td className="py-3.5 px-2">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] font-bold text-blue-600 block">{r.barcode}</span>
                        <span className="font-mono text-[10px] text-slate-400 font-medium">{r.reportNo}</span>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-3.5 px-2">
                      <p className="font-bold text-slate-700">{r.patientName}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{r.patientGender} / {r.patientAge} Yrs</span>
                    </td>

                    {/* Test Title */}
                    <td className="py-3.5 px-2 font-semibold text-slate-600">{r.testName}</td>

                    {/* Sample type */}
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        <FlaskConical size={10} className="text-blue-500" /> {r.sampleType}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-2">
                      {(() => {
                        const sampleStat = r.sampleStatus || 'Completed';
                        return (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sampleStat === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            sampleStat === 'Processing' ? 'bg-indigo-100 text-indigo-800' :
                            sampleStat === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {sampleStat === 'Completed' && <CheckCircle size={10} />}
                            {sampleStat === 'Processing' && <FlaskConical size={10} className="animate-spin" />}
                            {sampleStat === 'Rejected' && <XCircle size={10} />}
                            {sampleStat}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Chevron action */}
                    <td className="py-3.5 px-2 text-right">
                      <ChevronRight size={14} className="text-slate-300 inline" />
                    </td>
                  </tr>
                ))}
                {activeSampleOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No matching specimen logs registered in system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Detail & Barcode generation sidebar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="sample-sidebar-barcode">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
            <QrCode size={18} className="text-blue-600" /> Barcode & Specimen Routing
          </h3>

          {selectedReport ? (
            <div className="space-y-6" id="sample-specimen-details">
              {/* Fake Generated Barcode rendering */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                {/* Simulated SVG Barcode lines */}
                <div className="flex items-center justify-center h-10 w-44 bg-white px-2 py-1.5 border border-slate-200">
                  <div className="h-full w-full flex justify-between">
                    {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3].map((w, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 h-full inline-block"
                        style={{ width: `${w}px` }}
                      ></span>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-mono font-bold text-xs tracking-widest text-slate-700">{selectedReport.barcode}</p>
                  <span className="text-[9px] text-slate-400 font-medium uppercase">ApexLab Pathology Container ID</span>
                </div>

                <button
                  onClick={() => alert('Barcode printer mock triggered. Label is sent to secondary clinical printer.')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 underline"
                >
                  <Printer size={12} /> Print Barcode Label
                </button>
              </div>

              {/* Specimen Info */}
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-3">
                  <div>
                    <span className="text-slate-400 block font-medium">Specimen matrix</span>
                    <span className="font-bold text-slate-700">{selectedReport.sampleType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Test Required</span>
                    <span className="font-bold text-blue-600">{selectedReport.testName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-3">
                  <div>
                    <span className="text-slate-400 block font-medium">Patient Name</span>
                    <span className="font-bold text-slate-700">{selectedReport.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Report No</span>
                    <span className="font-mono text-slate-700">{selectedReport.reportNo}</span>
                  </div>
                </div>

                {/* Technician name input */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Technician on Duty</label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={e => setTechnicianName(e.target.value)}
                    placeholder="Duty Technician name"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sample State Transition button tools */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Advance Processing pipeline</p>

                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      disabled={(selectedReport.sampleStatus || 'Collected') === 'Collected'}
                      onClick={() => {
                        onUpdateReportStatus(selectedReport.reportNo, 'Collected', technicianName);
                        setSelectedReport({ ...selectedReport, sampleStatus: 'Collected', technicianName });
                      }}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-[11px] transition-colors border border-amber-100 disabled:opacity-50"
                    >
                      <FlaskConical size={13} /> Set Collected
                    </button>

                    <button
                      disabled={(selectedReport.sampleStatus || 'Collected') === 'Processing'}
                      onClick={() => {
                        onUpdateReportStatus(selectedReport.reportNo, 'Processing', technicianName);
                        setSelectedReport({ ...selectedReport, sampleStatus: 'Processing', technicianName });
                      }}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] transition-colors border border-indigo-100 disabled:opacity-50"
                    >
                      <FlaskConical size={13} /> Set Processing
                    </button>

                    <button
                      disabled={(selectedReport.sampleStatus || 'Collected') === 'Rejected'}
                      onClick={() => {
                        onUpdateReportStatus(selectedReport.reportNo, 'Rejected', technicianName);
                        setSelectedReport({ ...selectedReport, sampleStatus: 'Rejected', technicianName });
                      }}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[11px] transition-colors border border-red-100 disabled:opacity-50"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onUpdateReportStatus(selectedReport.reportNo, 'Completed', technicianName, true);
                    setSelectedReport({ ...selectedReport, sampleStatus: 'Completed', technicianVerified: true, technicianName });
                  }}
                  className={`w-full mt-3 flex items-center justify-center gap-1.5 py-2 px-2.5 font-bold rounded-lg text-xs transition-colors shadow-xs ${
                    selectedReport.technicianVerified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CheckCircle size={14} /> {selectedReport.technicianVerified ? '✓ Verified by Lab Technician' : 'Verify & Sign as Lab Technician'}
                </button>

                {(selectedReport.sampleStatus || 'Completed') === 'Processing' && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-800 text-[11px] rounded-lg leading-relaxed">
                    <strong>Sample status: In Processing.</strong> Specimen is inside the clinical analyzer. To enter final parameter values and sign off reports, navigate to the <strong>Report Manager</strong> tab.
                  </div>
                )}

                {(selectedReport.sampleStatus || 'Completed') === 'Completed' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-lg leading-relaxed flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    <span><strong>Sample collected & completed!</strong> Specimen collection registered successfully.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl">
              <Beaker className="text-slate-300 mb-2" size={30} />
              <p className="text-xs text-slate-400">Select a patient sample row from the left panel to display barcode label, scan container routing codes, or transition lab statuses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
