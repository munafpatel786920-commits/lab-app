/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Home,
  User,
  MapPin,
  Clock,
  Phone,
  Truck,
  CheckCircle,
  Map,
  Navigation,
  Compass,
  AlertCircle
} from 'lucide-react';
import { HomeCollectionVisit, StaffMember } from '../types';

interface HomeCollectionViewProps {
  visits: HomeCollectionVisit[];
  staff: StaffMember[];
  onUpdateVisitStatus: (id: string, status: 'Pending' | 'On the Way' | 'Collected' | 'Completed') => void;
  onAssignStaffToVisit: (id: string, staffName: string) => void;
  t: any;
}

export default function HomeCollectionView({
  visits,
  staff,
  onUpdateVisitStatus,
  onAssignStaffToVisit,
  t
}: HomeCollectionViewProps) {
  const [selectedVisit, setSelectedVisit] = useState<HomeCollectionVisit | null>(null);

  return (
    <div className="space-y-6" id="home-collection-view">
      {/* Header section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t.homeCollection}</h2>
        <p className="text-sm text-slate-500">Dispatch clinical phlebotomists to residential locations, track sample collection routing, and view mock navigation maps.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="home-coll-grid-layout">
        {/* Visits list */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="visits-list-panel">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Active Field Pick-ups</h3>

          <div className="space-y-3" id="visits-list-scroller">
            {visits.map(v => (
              <div
                key={v.id}
                onClick={() => setSelectedVisit(v)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  selectedVisit?.id === v.id
                    ? 'border-blue-500 bg-blue-50/45 shadow-2xs'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
                id={`visit-card-${v.id}`}
              >
                {/* Visit info */}
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm">
                      {v.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      v.status === 'On the Way' ? 'bg-indigo-100 text-indigo-800' :
                      v.status === 'Collected' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm">{v.patientName}</h4>
                  <p className="text-slate-500 text-xs flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" /> {v.address}
                  </p>
                </div>

                {/* Staff Assignment & Statuses */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phlebotomist</span>
                    <span className="font-bold text-slate-700">{v.assignedStaffName || 'Unassigned'}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Scheduled Time</span>
                    <span className="font-bold text-blue-600 flex items-center gap-1">
                      <Clock size={12} /> {v.scheduledTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {visits.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No home collection bookings registered today.</p>
            )}
          </div>
        </div>

        {/* Mock Google Map visual layout */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="mock-map-panel">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Map size={18} className="text-blue-600" /> Live Geolocation & Dispatch Route
          </h3>

          {selectedVisit ? (
            <div className="space-y-5" id="visit-map-details">
              {/* Custom High Fidelity vector map mock layout */}
              <div className="h-44 rounded-xl border border-blue-100 bg-blue-50/30 relative overflow-hidden shadow-2xs flex items-center justify-center" id="vector-map-overlay">
                {/* SVG mock map drawing */}
                <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 300 180">
                  {/* Grid of streets */}
                  <line x1="20" y1="0" x2="20" y2="180" stroke="#2563eb" strokeWidth="4" />
                  <line x1="120" y1="0" x2="120" y2="180" stroke="#2563eb" strokeWidth="5" />
                  <line x1="220" y1="0" x2="220" y2="180" stroke="#2563eb" strokeWidth="4" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#2563eb" strokeWidth="4" />
                  <line x1="0" y1="130" x2="300" y2="130" stroke="#2563eb" strokeWidth="5" />
                  {/* Diagonals */}
                  <line x1="0" y1="0" x2="300" y2="180" stroke="#2563eb" strokeWidth="2" strokeDasharray="3 3" />
                </svg>

                {/* Map Markers */}
                <div className="absolute left-[40%] top-[25%] flex flex-col items-center">
                  <div className="bg-blue-600 text-white rounded-lg p-1.5 shadow-sm">
                    <Truck size={14} className="animate-bounce" />
                  </div>
                  <span className="bg-slate-800 text-white text-[8px] font-bold px-1 py-0.5 rounded-sm shadow-xs mt-1">ApexLab Courier</span>
                </div>

                <div className="absolute right-[25%] bottom-[25%] flex flex-col items-center">
                  <MapPin size={24} className="text-red-500 fill-red-500" />
                  <span className="bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded-sm shadow-xs mt-0.5">Patient Address</span>
                </div>

                {/* Bottom map metadata coordinates bar */}
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 text-white p-2 rounded-lg text-[9px] font-mono flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-1.5">
                    <Compass size={12} className="text-blue-400 animate-spin" />
                    <span>{selectedVisit.locationCoordinates}</span>
                  </div>
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    <Navigation size={8} /> GPS ACTIVE
                  </span>
                </div>
              </div>

              {/* Status details & Assigning widgets */}
              <div className="space-y-4 text-xs font-medium text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Destination Address</span>
                    <span className="text-slate-700 font-semibold">{selectedVisit.address}</span>
                  </div>
                </div>

                {/* Phlebotomist list select */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Dispatch Staff assignment</span>
                  <select
                    value={selectedVisit.assignedStaffName || ''}
                    onChange={e => onAssignStaffToVisit(selectedVisit.id, e.target.value)}
                    className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="">-- Assign Duty Phlebotomist --</option>
                    {staff.filter(s => s.role === 'Technician' && s.status === 'Active').map(s => (
                      <option key={s.id} value={s.name}>{s.name} (Field Technician)</option>
                    ))}
                  </select>
                </div>

                {/* Status transitions buttons */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Transit Status updates</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Pending', 'On the Way', 'Collected', 'Completed'].map(state => (
                      <button
                        key={state}
                        onClick={() => {
                          onUpdateVisitStatus(selectedVisit.id, state as any);
                          setSelectedVisit({ ...selectedVisit, status: state as any });
                        }}
                        className={`py-2 px-2.5 rounded-lg text-center font-bold text-[10px] transition-all border ${
                          selectedVisit.status === state
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl">
              <Compass className="text-slate-300 mb-2" size={30} />
              <p className="text-xs text-slate-400">Select any active pickup ticket from the field list to view live GPS coordinates, coordinate routing, and update transit statuses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
