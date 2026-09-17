/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Search,
  PlusCircle,
  Home,
  MessageSquare,
  Clock,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Mail,
  Users
} from 'lucide-react';
import { Appointment, StaffMember } from '../types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  staff: StaffMember[];
  onBookAppointment: (appointment: Appointment) => void;
  onUpdateAppointmentStatus: (id: string, status: 'Booked' | 'Completed' | 'Cancelled') => void;
  t: any;
}

export default function AppointmentsView({
  appointments,
  staff,
  onBookAppointment,
  onUpdateAppointmentStatus,
  t
}: AppointmentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Form Booking fields
  const [patientName, setPatientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [doctorRef, setDoctorRef] = useState('');
  const [date, setDate] = useState('2026-07-18');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [homeCollection, setHomeCollection] = useState(false);
  const [address, setAddress] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');

  const slots = [
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM'
  ];

  // Auto APT ID
  const generateNewAptId = () => {
    const existingNums = appointments.map(a => {
      const match = a.id.match(/APT-2026-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextNum = maxNum + 1;
    return `APT-2026-${String(nextNum).padStart(4, '0')}`;
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !mobile) {
      alert('Patient name and mobile are required.');
      return;
    }

    const assignedStaff = staff.find(s => s.id === assignedStaffId);

    const newApt: Appointment = {
      id: generateNewAptId(),
      patientName,
      mobile,
      email,
      age,
      gender,
      doctorRef: doctorRef || 'Self Reference',
      date,
      timeSlot,
      homeCollection,
      address: homeCollection ? address : '',
      status: 'Booked',
      assignedStaffId: homeCollection ? assignedStaffId : '',
      assignedStaffName: homeCollection ? assignedStaff?.name : ''
    };

    onBookAppointment(newApt);
    setIsBooking(false);

    // reset
    setPatientName('');
    setMobile('');
    setEmail('');
    setAge(30);
    setGender('Male');
    setDoctorRef('');
    setHomeCollection(false);
    setAddress('');
    setAssignedStaffId('');
  };

  const handleSendReminderMock = (apt: Appointment, type: 'SMS' | 'WhatsApp') => {
    alert(`Secure ${type} notification reminder dispatched successfully to patient ${apt.patientName} (${apt.mobile}).\nText: "Dear ${apt.patientName}, your diagnostic appointment APT No: ${apt.id} is scheduled on ${apt.date} at ${apt.timeSlot}. Thank you."`);
  };

  const filteredAppointments = appointments.filter(a => {
    const term = searchTerm.toLowerCase();
    return (
      a.patientName.toLowerCase().includes(term) ||
      a.id.toLowerCase().includes(term) ||
      a.mobile.includes(term)
    );
  });

  return (
    <div className="space-y-6" id="appointments-view-container">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="appointments-header-section">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.appointments}</h2>
          <p className="text-sm text-slate-500">Schedule clinical walk-ins, dispatch home collections, and send automated notifications.</p>
        </div>
        {!isBooking && (
          <button
            onClick={() => setIsBooking(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
            id="btn-schedule-apt"
          >
            <Calendar size={18} />
            Book Appointment
          </button>
        )}
      </div>

      {isBooking && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 max-w-3xl" id="book-apt-form-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-lg font-bold text-slate-800">New Clinical Booking & Scheduling</h3>
            <button onClick={() => setIsBooking(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
              <XCircle size={20} />
            </button>
          </div>

          <form onSubmit={handleBook} className="space-y-5" id="form-book-apt">
            {/* Input grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="Enter patient full name"
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
                    value={age}
                    onChange={e => setAge(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden"
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
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. info@domain.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Slot</label>
                <select
                  value={timeSlot}
                  onChange={e => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden"
                >
                  {slots.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reference Doctor</label>
                <input
                  type="text"
                  value={doctorRef}
                  onChange={e => setDoctorRef(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Shah (Self if none)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={homeCollection}
                    onChange={e => setHomeCollection(e.target.checked)}
                    className="w-4.5 h-4.5 text-blue-600 bg-white border-slate-200 rounded-sm focus:ring-blue-500"
                  />
                  <span>Request Phlebotomy Home Collection Visit</span>
                </label>
              </div>

              {homeCollection && (
                <div className="md:col-span-2 space-y-4 bg-blue-50/40 p-4 border border-blue-100 rounded-xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Home Collection Address *</label>
                    <textarea
                      required={homeCollection}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Enter precise home address for sample collection"
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Assign Collection Field Staff</label>
                    <select
                      value={assignedStaffId}
                      onChange={e => setAssignedStaffId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden"
                    >
                      <option value="">-- Choose Field Technician --</option>
                      {staff.filter(s => s.role === 'Technician' && s.status === 'Active').map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Field Technician)</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Form Action Row */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBooking(false)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
              >
                Book Appointment Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointment calendar slots list */}
      {!isBooking && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="appointments-list-view">
          {/* Search bar row */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search appointments by name or mobile..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="py-3 px-2">Appointment ID</th>
                  <th className="py-3 px-2">Patient Profile</th>
                  <th className="py-3 px-2">Date & Time Slot</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Staff Assigned</th>
                  <th className="py-3 px-2 text-center">Dispatch Reminders</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors" id={`row-apt-${apt.id}`}>
                    {/* ID */}
                    <td className="py-3.5 px-2 font-mono">
                      <span className="font-bold text-slate-800 block">{apt.id}</span>
                    </td>

                    {/* Profile */}
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600 text-[10px]">
                          {apt.patientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{apt.patientName}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{apt.mobile} • {apt.gender} ({apt.age})</span>
                        </div>
                      </div>
                    </td>

                    {/* Date/Slot */}
                    <td className="py-3.5 px-2 font-medium">
                      <p className="flex items-center gap-1"><Calendar size={12} className="text-slate-400" /> {apt.date}</p>
                      <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5"><Clock size={11} className="text-slate-400" /> {apt.timeSlot}</p>
                    </td>

                    {/* Walk-in vs home visit */}
                    <td className="py-3.5 px-2">
                      {apt.homeCollection ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                          <Home size={10} /> Home Visit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                          <Users size={10} /> Clinic walk-in
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        apt.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {apt.status}
                      </span>
                    </td>

                    {/* Phlebotomist assignment */}
                    <td className="py-3.5 px-2 font-medium text-slate-600">
                      {apt.homeCollection ? (
                        apt.assignedStaffName ? (
                          <span className="font-bold text-slate-700">{apt.assignedStaffName}</span>
                        ) : (
                          <span className="text-red-500 italic font-bold">Unassigned</span>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Send Reminders trigger */}
                    <td className="py-3.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleSendReminderMock(apt, 'WhatsApp')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-100"
                          title="Send WhatsApp Reminder"
                        >
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleSendReminderMock(apt, 'SMS')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md border border-blue-100"
                          title="Send SMS Reminder"
                        >
                          SMS
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {apt.status === 'Booked' && (
                          <>
                            <button
                              onClick={() => onUpdateAppointmentStatus(apt.id, 'Completed')}
                              className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-md"
                              title="Mark as Completed"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => onUpdateAppointmentStatus(apt.id, 'Cancelled')}
                              className="p-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-md"
                              title="Cancel Appointment"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        {apt.status !== 'Booked' && (
                          <span className="text-slate-300 italic text-[10px]">Archived</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                      No matching clinical appointments recorded for selection date.
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
