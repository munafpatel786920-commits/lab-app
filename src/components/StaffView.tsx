/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  ShieldAlert,
  CalendarCheck2,
  DollarSign,
  Phone,
  UserCheck,
  Check,
  XCircle,
  FileCheck,
  Award,
  X
} from 'lucide-react';
import { StaffMember } from '../types';

interface StaffViewProps {
  staff: StaffMember[];
  onAddStaff: (member: StaffMember) => void;
  onUpdateAttendance: (id: string, isPresent: boolean) => void;
  onDisburseSalary: (id: string) => void;
  t: any;
}

export default function StaffView({
  staff,
  onAddStaff,
  onUpdateAttendance,
  onDisburseSalary,
  t
}: StaffViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Pathologist' | 'Technician' | 'Receptionist'>('Technician');
  const [salary, setSalary] = useState<number>(30000);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [joiningDate, setJoiningDate] = useState('2026-07-18');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');

  // Auto update username when name changes if username wasn't edited manually
  const handleNameChange = (val: string) => {
    setName(val);
    const suggestedUser = val.trim().toLowerCase().replace(/\s+/g, '_');
    setUsername(suggestedUser);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert('Staff Name and Mobile number are required.');
      return;
    }

    const finalUsername = username.trim().toLowerCase() || name.trim().toLowerCase().replace(/\s+/g, '_');
    const finalPassword = password.trim() || 'password123';

    const newMember: StaffMember = {
      id: `STF-ID-${String(staff.length + 1).padStart(3, '0')}`,
      name,
      role,
      salary,
      isPresentToday: true,
      salaryPaidThisMonth: false,
      mobile,
      email: email || `${finalUsername}@apexlab.com`,
      joiningDate,
      status: 'Active'
    };

    onAddStaff(newMember);
    setIsAdding(false);

    alert(`✅ New Staff Member Registered Successfully!\n\nName: ${name}\nRole: ${role}\nUser ID / Username: ${finalUsername}\nPassword: ${finalPassword}\n\nPlease share these credentials with the employee so they can Sign In.`);

    // reset
    setName('');
    setMobile('');
    setEmail('');
    setUsername('');
    setPassword('password123');
    setSalary(30000);
  };

  const handlePaySalary = (member: StaffMember) => {
    if (member.salaryPaidThisMonth) {
      alert(`Salary has already been disbursed to ${member.name} for current billing cycle.`);
      return;
    }
    onDisburseSalary(member.id);
    alert(`Payslip Voucher generated successfully.\nDisbursed salary ₹${member.salary.toLocaleString('en-IN')} to ${member.name}.`);
  };

  const filteredStaff = staff.filter(member => {
    const term = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(term) ||
      member.id.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6" id="staff-view-container">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="staff-header-section">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.staff}</h2>
          <p className="text-sm text-slate-500">Oversee role-based credentials, manage monthly payroll payouts, and log clinical staff attendance.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
            id="btn-register-staff"
          >
            <PlusCircle size={18} />
            Add Staff Member
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 max-w-3xl" id="add-staff-form">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h3 className="text-lg font-bold text-slate-800">Register Staff Team Member</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-5" id="form-add-staff">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Enter employee full name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Specialist Role *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden"
                >
                  <option value="Pathologist">M.D. Pathologist / Doc</option>
                  <option value="Technician">Lab Analyst / Technician</option>
                  <option value="Receptionist">Desk Administrator / Receptionist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. +91 9988776655"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. employee@domain.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Monthly Basic Salary (₹) *</label>
                <input
                  type="number"
                  required
                  min="5000"
                  value={salary}
                  onChange={e => setSalary(parseInt(e.target.value) || 20000)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Joining</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={e => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                />
              </div>
            </div>

            {/* System Login Credentials Section */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <CalendarCheck2 size={16} className="text-blue-600" />
                <h4 className="text-xs font-bold text-blue-900">System Login Credentials for New Staff</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Username / User ID *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. rajesh_path"
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-blue-600 mt-1">This Username will be used by the staff member to Sign In.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Set password"
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Default password: password123</p>
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 font-sans">
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
                Enroll Team Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff and salaries list */}
      {!isAdding && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="staff-dashboard-columns">
          {/* Main List & Attendance */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="staff-roster-panel">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Users size={18} className="text-blue-600" /> Laboratory Roster & Access Controls
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-3 px-2">ID & Name</th>
                    <th className="py-3 px-2">Role Access Level</th>
                    <th className="py-3 px-2">Mobile Contact</th>
                    <th className="py-3 px-2">Daily Attendance</th>
                    <th className="py-3 px-2 text-right">Duty Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStaff.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors" id={`row-staff-${member.id}`}>
                      {/* ID and Name */}
                      <td className="py-3.5 px-2">
                        <span className="font-mono text-[10px] text-slate-400 block font-bold">{member.id}</span>
                        <span className="font-bold text-slate-800 block text-xs mt-0.5">{member.name}</span>
                      </td>

                      {/* Role access */}
                      <td className="py-3.5 px-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                          member.role === 'Pathologist' ? 'bg-indigo-50 text-indigo-700' :
                          member.role === 'Technician' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {member.role}
                        </span>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">
                          Login ID: <span className="font-bold text-blue-700">{member.name.toLowerCase().replace(/\s+/g, '_')}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-2 font-medium text-slate-600">
                        <p className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {member.mobile}</p>
                        {member.email && <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">{member.email}</span>}
                      </td>

                      {/* Attendance Toggle */}
                      <td className="py-3.5 px-2">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={member.isPresentToday}
                            onChange={e => onUpdateAttendance(member.id, e.target.checked)}
                            className="w-4.5 h-4.5 text-blue-600 border-slate-200 rounded-sm focus:ring-blue-500 cursor-pointer"
                          />
                          <span className={`text-[10px] font-bold ${member.isPresentToday ? 'text-emerald-600' : 'text-red-500'}`}>
                            {member.isPresentToday ? 'Marked Present' : 'Marked Absent'}
                          </span>
                        </label>
                      </td>

                      {/* Duty status */}
                      <td className="py-3.5 px-2 text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          member.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Salary disbursement sidebar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between" id="staff-salary-panel">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <DollarSign size={18} className="text-blue-600" /> Salary slips & Payroll
              </h3>

              <div className="space-y-3" id="salary-slips-scroller">
                {filteredStaff.map(member => (
                  <div key={member.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-medium text-slate-600">
                    <div>
                      <p className="font-bold text-slate-700">{member.name}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{member.role} • Basic: ₹{member.salary.toLocaleString('en-IN')}</span>
                    </div>

                    <button
                      onClick={() => handlePaySalary(member)}
                      disabled={member.salaryPaidThisMonth}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        member.salaryPaidThisMonth
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700 font-bold'
                          : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-bold shadow-xs'
                      }`}
                    >
                      {member.salaryPaidThisMonth ? 'Voucher Paid' : 'Pay Salary'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-xl flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed font-sans font-medium">
              <ShieldAlert className="text-indigo-600 shrink-0 mt-0.5" size={15} />
              <p>Roles dictate system access rules. Pathologists review results; receptionists configure bill payments; technicians handle logistics pipelines.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
