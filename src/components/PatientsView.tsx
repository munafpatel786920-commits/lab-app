/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  History,
  FileText,
  UserPlus,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Patient, TestReport, Invoice, TestTemplate } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  reports: TestReport[];
  invoices: Invoice[];
  tests: TestTemplate[];
  onAddPatient: (patient: Patient, assignedTestId?: string) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onAddTestReportForPatient?: (patientId: string, testId: string, sampleCollectionDate?: string, doctorRef?: string) => void;
  t: any;
}

export default function PatientsView({
  patients,
  reports,
  invoices,
  tests,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  onAddTestReportForPatient,
  t
}: PatientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [duplicatePatientWarning, setDuplicatePatientWarning] = useState<Patient | null>(null);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<Patient | null>(null);

  // New test modal state for returning/existing patients
  const [selectedPatientForNewTest, setSelectedPatientForNewTest] = useState<Patient | null>(null);
  const [newTestId, setNewTestId] = useState('CBC');
  const [newTestSampleDate, setNewTestSampleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTestDoctorRef, setNewTestDoctorRef] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [doctorRef, setDoctorRef] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('2026-07-18');
  const [sampleCollectionDate, setSampleCollectionDate] = useState('2026-07-18');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('CBC');

  const handleOpenNewTestModal = (patient: Patient) => {
    setSelectedPatientForNewTest(patient);
    setNewTestId(tests[0]?.id || 'CBC');
    setNewTestSampleDate(new Date().toISOString().split('T')[0]);
    setNewTestDoctorRef(patient.doctorRef || 'Self Reference');
  };

  const handleCreateNewTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForNewTest) return;

    if (onAddTestReportForPatient) {
      onAddTestReportForPatient(selectedPatientForNewTest.id, newTestId, newTestSampleDate, newTestDoctorRef);
      alert(`New test report ordered successfully for returning patient: ${selectedPatientForNewTest.name} (${selectedPatientForNewTest.id})!`);
    } else {
      // Fallback if prop not provided
      const dummyPatient: Patient = { ...selectedPatientForNewTest, doctorRef: newTestDoctorRef };
      onAddPatient(dummyPatient, newTestId);
      alert(`New test report ordered successfully for ${selectedPatientForNewTest.name}!`);
    }
    setSelectedPatientForNewTest(null);
  };

  const handleAutofillExistingPatient = (patientId: string) => {
    if (!patientId) return;
    const existing = patients.find(p => p.id === patientId);
    if (existing) {
      setName(existing.name);
      setAge(existing.age);
      setGender(existing.gender);
      setMobile(existing.mobile);
      setEmail(existing.email || '');
      setAddress(existing.address || '');
      setDoctorRef(existing.doctorRef || '');
      setPhotoUrl(existing.photoUrl || '');
    }
  };

  // Handle file select simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Generate a mock object URL for preview
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  // Generate Auto-Increment Patient ID
  const generateNewPatientId = () => {
    const existingNums = patients.map(p => {
      const match = p.id.match(/PAT-2026-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextNum = maxNum + 1;
    return `PAT-2026-${String(nextNum).padStart(4, '0')}`;
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setAge(30);
    setGender('Male');
    setMobile('');
    setEmail('');
    setAddress('');
    setDoctorRef('');
    setAppointmentDate('2026-07-18');
    setSampleCollectionDate('2026-07-18');
    setPhotoUrl('');
    setSelectedTestId('CBC');
    setIsAdding(false);
    setEditingPatient(null);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert('Patient Name and Mobile Number are required.');
      return;
    }

    if (editingPatient) {
      // Edit mode
      const updated: Patient = {
        ...editingPatient,
        name,
        age,
        gender,
        mobile,
        email,
        address,
        doctorRef,
        appointmentDate,
        sampleCollectionDate,
        photoUrl: photoUrl || editingPatient.photoUrl
      };
      onUpdatePatient(updated);
    } else {
      // Add mode - check duplicate by patient Name (case-insensitive)
      const trimmedName = name.trim().toLowerCase();
      const existingPatient = patients.find(p => p.name && p.name.trim().toLowerCase() === trimmedName);
      if (existingPatient) {
        setDuplicatePatientWarning(existingPatient);
        return;
      }

      const finalPatientId = generateNewPatientId();
      const newPatient: Patient = {
        id: finalPatientId,
        name,
        age,
        gender,
        mobile,
        email,
        address,
        doctorRef,
        appointmentDate,
        sampleCollectionDate,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        createdDate: new Date().toISOString().split('T')[0]
      };
      onAddPatient(newPatient, selectedTestId !== 'NONE' ? selectedTestId : undefined);
    }
    resetForm();
  };

  const startEdit = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setAge(p.age);
    setGender(p.gender);
    setMobile(p.mobile);
    setEmail(p.email);
    setAddress(p.address);
    setDoctorRef(p.doctorRef);
    setAppointmentDate(p.appointmentDate);
    setSampleCollectionDate(p.sampleCollectionDate);
    setPhotoUrl(p.photoUrl || '');
    setIsAdding(true);
  };

  // Filtered Patients
  const filteredPatients = patients.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      p.mobile.includes(term) ||
      p.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6" id="patients-view">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="patients-header-section">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.patients}</h2>
          <p className="text-sm text-slate-500">Add, register, and review clinical histories of all local patients.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
            id="btn-register-patient"
          >
            <UserPlus size={18} />
            {t.addPatient}
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 max-w-3xl" id="patient-form-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-lg font-bold text-slate-800">
              {editingPatient ? `Edit Patient Profile (${editingPatient.id})` : 'New Patient Registration Form'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" id="form-patient">
            {duplicatePatientWarning && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertCircle size={18} className="text-amber-600 shrink-0" />
                  <span>Duplicate Patient Warning Detected!</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  A patient with name <strong className="font-semibold">{duplicatePatientWarning.name}</strong> is already registered in the database (ID: <span className="font-mono">{duplicatePatientWarning.id}</span>, Mobile: <span className="font-mono">{duplicatePatientWarning.mobile}</span>). Duplicate patient records are not generated.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const patientToOpen = duplicatePatientWarning;
                      setDuplicatePatientWarning(null);
                      resetForm();
                      handleOpenNewTestModal(patientToOpen);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Plus size={13} /> Order New Test For This Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicatePatientWarning(null)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    Dismiss Warning
                  </button>
                </div>
              </div>
            )}

            {!editingPatient && patients.length > 0 && (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <UserPlus size={14} className="text-blue-600" /> Returning / Existing Patient Visit?
                  </p>
                  <p className="text-[11px] text-blue-700">Select an existing registered patient to autofill their profile details instantly.</p>
                </div>
                <select
                  onChange={e => handleAutofillExistingPatient(e.target.value)}
                  defaultValue=""
                  className="bg-white border border-blue-300 text-xs font-bold text-slate-800 rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="" disabled>-- Select Returning Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mobile}) - [{p.id}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Auto ID Display & Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Avatar Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <User size={30} className="text-blue-600" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1 cursor-pointer shadow-xs">
                  <Plus size={12} />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
              <div className="text-center sm:text-left space-y-0.5">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">System Assigned ID</p>
                <p className="text-lg font-mono font-bold text-blue-600">
                  {editingPatient ? editingPatient.id : `${generateNewPatientId()} (Auto-Generated)`}
                </p>
              </div>
            </div>

            {/* General Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name || ''}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter full legal name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="125"
                    value={age}
                    onChange={e => setAge(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={mobile || ''}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email || ''}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. clinical@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Home Address</label>
                <textarea
                  value={address || ''}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Complete residential address"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reference Doctor (Hospital/Clinic)</label>
                <input
                  type="text"
                  value={doctorRef || ''}
                  onChange={e => setDoctorRef(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Shah (Self if none)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {!editingPatient && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prescribed Test / Panel *</label>
                  <select
                    value={selectedTestId}
                    onChange={e => setSelectedTestId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:border-blue-500 font-medium text-slate-700"
                  >
                    {tests.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                    <option value="NONE">None (No test assigned)</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Booking Date</label>
                  <input
                    type="date"
                    value={appointmentDate || ''}
                    onChange={e => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sample Collection</label>
                  <input
                    type="date"
                    value={sampleCollectionDate || ''}
                    onChange={e => setSampleCollectionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
              >
                {editingPatient ? 'Save Updates' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patients List and Search layout */}
      {!isAdding && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="patients-search-and-results">
          {/* Main Patients List Card */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="patients-list-container">
            {/* Search Input Bar */}
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={t.search}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-3 px-2">Patient Profile</th>
                    <th className="py-3 px-2">Contact Details</th>
                    <th className="py-3 px-2">Referrer Doctor</th>
                    <th className="py-3 px-2">Next appointment</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPatients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors" id={`row-pat-${p.id}`}>
                      {/* Patient Name ID Avatar */}
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80'}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-2xs"
                          />
                          <div>
                            <p className="font-bold text-slate-700">{p.name}</p>
                            <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm block w-fit mt-0.5">{p.id}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{p.age} Yrs • {p.gender}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone Email Address */}
                      <td className="py-3.5 px-2 text-slate-600">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1"><Phone size={12} /> {p.mobile}</p>
                          {p.email && <p className="flex items-center gap-1 text-[11px] text-slate-400"><Mail size={11} /> {p.email}</p>}
                        </div>
                      </td>

                      {/* Doctor Referrer */}
                      <td className="py-3.5 px-2 font-medium text-slate-700">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md italic text-[11px] block w-fit">
                          {p.doctorRef}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-2 text-slate-500 font-medium">
                        <p className="flex items-center gap-1"><Calendar size={12} /> {p.appointmentDate}</p>
                        <p className="flex items-center gap-1 text-[11px] text-blue-500 mt-0.5"><Clock size={11} /> Col: {p.sampleCollectionDate}</p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Order New Test / Report for Returning Patient"
                            onClick={() => handleOpenNewTestModal(p)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 border border-emerald-200/60"
                          >
                            <Plus size={13} /> New Test
                          </button>
                          {/* Patient History click */}
                          <button
                            title="View History File"
                            onClick={() => setSelectedPatientHistory(p)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                          >
                            <History size={15} />
                          </button>
                          <button
                            title="Edit Profile"
                            onClick={() => startEdit(p)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            title="Delete Patient Record"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete patient ${p.name}? This will remove all associated reports.`)) {
                                onDeletePatient(p.id);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        No patient matches found in current filters. Click "Add New Patient" to register.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Record Sidebar Panel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="patient-history-sidebar">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <History size={18} className="text-blue-600" /> Patient Medical File Details
            </h3>

            {selectedPatientHistory ? (
              <div className="space-y-5" id="history-details-file">
                {/* Active selection Profile card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedPatientHistory.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80'}
                      alt={selectedPatientHistory.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{selectedPatientHistory.name}</h4>
                      <p className="text-xs font-bold font-mono text-blue-600">{selectedPatientHistory.id}</p>
                      <p className="text-[11px] text-slate-400">{selectedPatientHistory.age} Yrs / {selectedPatientHistory.gender}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenNewTestModal(selectedPatientHistory)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={15} /> Order New Test Report
                </button>

                {/* Patient details list */}
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {selectedPatientHistory.mobile}</p>
                  <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {selectedPatientHistory.email || 'N/A'}</p>
                  <p className="flex items-start gap-2"><MapPin size={14} className="text-slate-400 mt-0.5" /> {selectedPatientHistory.address}</p>
                </div>

                {/* History reports list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historical Test Reports</h4>
                  {reports.filter(r => r.patientId === selectedPatientHistory.id).length > 0 ? (
                    <div className="space-y-2">
                      {reports.filter(r => r.patientId === selectedPatientHistory.id).map(r => (
                        <div key={r.reportNo} className="p-3 bg-blue-50/30 hover:bg-blue-50/50 border border-blue-100/50 rounded-lg text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-700">{r.testName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">No: {r.reportNo} • Col: {r.collectedDate}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'Processing' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No historical test reports registered under this profile.</p>
                  )}
                </div>

                {/* Invoices */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billing History</h4>
                  {invoices.filter(i => i.patientId === selectedPatientHistory.id).length > 0 ? (
                    <div className="space-y-2">
                      {invoices.filter(i => i.patientId === selectedPatientHistory.id).map(i => (
                        <div key={i.invoiceNo} className="p-3 bg-emerald-50/20 hover:bg-emerald-50/40 border border-emerald-100/30 rounded-lg text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-700">₹{i.total.toFixed(1)} (INR)</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Inv: {i.invoiceNo} • {i.paymentMode}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            i.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            i.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {i.paymentStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No invoice or billing history recorded.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl">
                <FileText className="text-slate-300 mb-2" size={30} />
                <p className="text-xs text-slate-400">Select any patient's history folder by clicking the history icon ( <History size={12} className="inline" /> ) to review their complete diagnostic profile.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for ordering new test report for returning patient */}
      {selectedPatientForNewTest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Order New Test Report</h3>
                <p className="text-xs text-slate-500">For returning patient visit</p>
              </div>
              <button
                onClick={() => setSelectedPatientForNewTest(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Patient Info Card */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {selectedPatientForNewTest.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{selectedPatientForNewTest.name}</p>
                <p className="text-xs font-mono font-bold text-blue-600">{selectedPatientForNewTest.id}</p>
                <p className="text-[11px] text-slate-500">
                  {selectedPatientForNewTest.age} Yrs • {selectedPatientForNewTest.gender} • {selectedPatientForNewTest.mobile}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNewTestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Prescribed Test / Panel *</label>
                <select
                  value={newTestId}
                  onChange={e => setNewTestId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                >
                  {tests.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category || 'Diagnostics'}) — ₹{t.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sample Collection Date</label>
                  <input
                    type="date"
                    required
                    value={newTestSampleDate}
                    onChange={e => setNewTestSampleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Reference</label>
                  <input
                    type="text"
                    value={newTestDoctorRef}
                    onChange={e => setNewTestDoctorRef(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Shah"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForNewTest(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Create Test Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
