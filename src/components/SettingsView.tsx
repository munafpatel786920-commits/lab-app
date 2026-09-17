/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Settings,
  Building,
  Database,
  Printer,
  ShieldCheck,
  CheckCircle,
  FileCheck2,
  Trash2,
  Save,
  Download,
  Upload,
  Globe,
  Lock,
  Sliders,
  DollarSign
} from 'lucide-react';
import { UserRole, RolePermissions, CountryConfig } from '../types';
import { SUPPORTED_COUNTRIES } from '../data/saasData';
import RolePermissionsView from './RolePermissionsView';

interface SettingsViewProps {
  currentBranch: string;
  branches: string[];
  onChangeBranch: (branch: string) => void;
  onAddBranch: (branch: string) => void;
  onDeleteBranch: (branch: string) => void;
  onClearAllData?: (adminId: string, adminPass: string) => Promise<{ success: boolean; error?: string }>;
  currentUserRole?: UserRole;
  permissions?: RolePermissions[];
  onSavePermissions?: (updated: RolePermissions[]) => Promise<void> | void;
  currentCountryCode?: string;
  onUpdateCountryCode?: (code: string) => void;
  activeSettings?: any;
  onSaveSettings?: (settings: any) => Promise<void> | void;
  currentUser?: any;
  tenantPatients?: any[];
  tenantReports?: any[];
  tenantInvoices?: any[];
  tenantAppointments?: any[];
  tenantHomeVisits?: any[];
  tenantInventory?: any[];
  tenantExpenses?: any[];
  onRestoreData?: (data: any) => Promise<{ success: boolean; error?: string }>;
  t: any;
}

export default function SettingsView({
  currentBranch,
  branches,
  onChangeBranch,
  onAddBranch,
  onDeleteBranch,
  onClearAllData,
  currentUserRole = 'Admin',
  permissions = [],
  onSavePermissions = () => {},
  currentCountryCode = 'IN',
  onUpdateCountryCode = () => {},
  activeSettings,
  onSaveSettings = () => {},
  currentUser,
  tenantPatients = [],
  tenantReports = [],
  tenantInvoices = [],
  tenantAppointments = [],
  tenantHomeVisits = [],
  tenantInventory = [],
  tenantExpenses = [],
  onRestoreData,
  t
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'PERMISSIONS'>('GENERAL');

  // Backup & Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupRestoreStatus, setBackupRestoreStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Master Reset State
  const [resetUsername, setResetUsername] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSecureReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUsername.trim() || !resetPassword.trim()) {
      setResetStatus({ type: 'error', message: 'कृपया Admin ID और Password दोनों दर्ज करें!' });
      return;
    }
    setResetStatus({ type: 'idle', message: '' });
    setShowConfirmModal(true);
  };

  const executeReset = async () => {
    setShowConfirmModal(false);
    setIsResetting(true);
    setResetStatus({ type: 'idle', message: '' });

    try {
      if (onClearAllData) {
        const result = await onClearAllData(resetUsername.trim(), resetPassword.trim());
        if (result.success) {
          setResetStatus({ type: 'success', message: '🎉 सफलता! सिस्टम का सारा डेटा (मरीज, इनवॉइस, रिपोर्ट्स, अपॉइंटमेंट्स) सफलतापूर्वक रीसेट कर दिया गया है।' });
          setResetUsername('');
          setResetPassword('');
        } else {
          setResetStatus({ type: 'error', message: result.error || 'रीसेट करने में त्रुटि आई।' });
        }
      } else {
        setResetStatus({ type: 'error', message: 'Master Reset features are currently not configured.' });
      }
    } catch (err: any) {
      setResetStatus({ type: 'error', message: err.message || 'Error occurred during reset.' });
    } finally {
      setIsResetting(false);
    }
  };

  // Brand details state
  const [labName, setLabName] = useState(() => activeSettings?.labName || 'Apex Diagnostic & Research Center');
  const [slogan, setSlogan] = useState(() => activeSettings?.slogan || 'Precision Diagnostics, Healthy Lives');
  const [gstin, setGstin] = useState(() => activeSettings?.gstin || '24AAAAA0000A1Z5');
  const [licenseNo, setLicenseNo] = useState(() => activeSettings?.licenseNo || 'MC-2026-66712/DL');
  const [telephone, setTelephone] = useState(() => activeSettings?.telephone || '+91 261 2451122');
  const [address, setAddress] = useState(() => activeSettings?.address || 'Apex Mansion, Opp. Civil Hospital, Surat, Gujarat');
  const [logoUrl, setLogoUrl] = useState<string | null>(() => activeSettings?.logoUrl || null);
  const [pathologistSignatureUrl, setPathologistSignatureUrl] = useState<string | null>(() => activeSettings?.pathologistSignatureUrl || null);
  const [pathologistName, setPathologistName] = useState<string>(() => activeSettings?.pathologistName || 'Devangi Shah');
  const [pathologistDegree, setPathologistDegree] = useState<string>(() => activeSettings?.pathologistDegree || 'M.D. (Pathology) • Reg No: G-14232');
  const [technicianSignatureUrl, setTechnicianSignatureUrl] = useState<string | null>(() => activeSettings?.technicianSignatureUrl || null);
  const [technicianName, setTechnicianName] = useState<string>(() => activeSettings?.technicianName || 'Amit Trivedi');
  const [technicianDegree, setTechnicianDegree] = useState<string>(() => activeSettings?.technicianDegree || 'B.Sc. M.L.T. • Reg No: LT-2026-9912');
  const [newBranchName, setNewBranchName] = useState('');

  React.useEffect(() => {
    if (activeSettings) {
      setLabName(activeSettings.labName || 'Apex Diagnostic & Research Center');
      setSlogan(activeSettings.slogan || 'Precision Diagnostics, Healthy Lives');
      setGstin(activeSettings.gstin || '24AAAAA0000A1Z5');
      setLicenseNo(activeSettings.licenseNo || 'MC-2026-66712/DL');
      setTelephone(activeSettings.telephone || '+91 261 2451122');
      setAddress(activeSettings.address || 'Apex Mansion, Opp. Civil Hospital, Surat, Gujarat');
      setLogoUrl(activeSettings.logoUrl || null);
      setPathologistSignatureUrl(activeSettings.pathologistSignatureUrl || null);
      setPathologistName(activeSettings.pathologistName || 'Devangi Shah');
      setPathologistDegree(activeSettings.pathologistDegree || 'M.D. (Pathology) • Reg No: G-14232');
      setTechnicianSignatureUrl(activeSettings.technicianSignatureUrl || null);
      setTechnicianName(activeSettings.technicianName || 'Amit Trivedi');
      setTechnicianDegree(activeSettings.technicianDegree || 'B.Sc. M.L.T. • Reg No: LT-2026-9912');
    }
  }, [activeSettings]);

  const isAdminOrSuperAdmin = currentUserRole === 'Admin' || currentUserRole === 'SuperAdmin';
  const selectedCountry = SUPPORTED_COUNTRIES.find(c => c.code === currentCountryCode) || SUPPORTED_COUNTRIES[0];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoUrl(base64String);
        onSaveSettings({
          ...activeSettings,
          logoUrl: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDelete = () => {
    setLogoUrl(null);
    onSaveSettings({
      ...activeSettings,
      logoUrl: null
    });
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPathologistSignatureUrl(base64String);
        onSaveSettings({
          ...activeSettings,
          pathologistSignatureUrl: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureDelete = () => {
    setPathologistSignatureUrl(null);
    onSaveSettings({
      ...activeSettings,
      pathologistSignatureUrl: null
    });
  };

  const handleTechSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setTechnicianSignatureUrl(base64String);
        onSaveSettings({
          ...activeSettings,
          technicianSignatureUrl: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTechSignatureDelete = () => {
    setTechnicianSignatureUrl(null);
    onSaveSettings({
      ...activeSettings,
      technicianSignatureUrl: null
    });
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      ...activeSettings,
      labName,
      slogan,
      gstin,
      licenseNo,
      telephone,
      address,
      pathologistName,
      pathologistDegree,
      technicianName,
      technicianDegree
    });
    alert('Laboratory branding, multi-country locale, and dual clinical signatures updated and saved in Google Firebase successfully.');
  };

  const handleBackup = () => {
    try {
      const dataToExport = {
        patients: tenantPatients || [],
        reports: tenantReports || [],
        invoices: tenantInvoices || [],
        appointments: tenantAppointments || [],
        homeVisits: tenantHomeVisits || [],
        inventory: tenantInventory || [],
        expenses: tenantExpenses || [],
        settings: activeSettings || null,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ApexLab_Backup_${currentCountryCode}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setBackupRestoreStatus({ type: 'success', message: '🎉 बैकअप फ़ाइल सफलतापूर्वक डाउनलोड हो गई है।' });
    } catch (err: any) {
      setBackupRestoreStatus({ type: 'error', message: `❌ बैकअप एक्सपोर्ट करने में त्रुटि: ${err.message || err}` });
    }
  };

  const handleRestore = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (!parsed || typeof parsed !== 'object') {
          setBackupRestoreStatus({ type: 'error', message: '❌ अमान्य JSON फ़ाइल फ़ॉर्मेट!' });
          return;
        }

        if (onRestoreData) {
          setIsResetting(true);
          setBackupRestoreStatus({ type: 'idle', message: 'डेटा रिस्टोर हो रहा है, कृपया प्रतीक्षा करें...' });
          const result = await onRestoreData(parsed);
          setIsResetting(false);
          
          if (result && result.success) {
            setBackupRestoreStatus({ 
              type: 'success', 
              message: '🎉 सफलता! बैकअप फ़ाइल से समस्त डेटा और सेटिंग्स सफलतापूर्वक रिस्टोर कर दिए गए हैं।' 
            });
          } else {
            setBackupRestoreStatus({ 
              type: 'error', 
              message: `❌ रिस्टोर विफल: ${result?.error || 'अज्ञात त्रुटि'}` 
            });
          }
        } else {
          setBackupRestoreStatus({ type: 'error', message: 'रिस्टोर फ़ीचर उपलब्ध नहीं है।' });
        }
      } catch (err: any) {
        setBackupRestoreStatus({ type: 'error', message: `❌ फ़ाइल पार्स करने में त्रुटि आई: ${err.message || err}` });
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6" id="settings-view-container">
      {/* Header & Sub-Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings size={22} className="text-blue-600" />
            {t.settings} & System Configuration
          </h2>
          <p className="text-sm text-slate-500">
            Configure corporate medical letterheads, multi-country currencies, branch portals, and role access permissions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('GENERAL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'GENERAL'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer size={15} />
            <span>General & Country Settings</span>
          </button>

          {isAdminOrSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('PERMISSIONS')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'PERMISSIONS'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={15} className="text-emerald-600" />
              <span>Role Permissions & Access Matrix</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-mono font-bold">Admin Only</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'PERMISSIONS' ? (
        <RolePermissionsView
          currentUserRole={currentUserRole}
          permissions={permissions}
          onSavePermissions={onSavePermissions}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="settings-grid-layout">
          {/* Branding & Country Configurations */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6" id="settings-branding-panel">
            {/* Country & Currency Engine Panel */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 rounded-2xl mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-blue-900 flex items-center gap-1.5">
                  <Globe size={16} className="text-blue-600" />
                  Multi-Country & Multi-Currency Engine
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded-full">
                  SaaS Active
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Select your lab's operating country. Billing receipts, test prices, tax invoices, and financial reports will automatically render in this currency and tax format.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {SUPPORTED_COUNTRIES.map(c => {
                  const isSelected = currentCountryCode === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => onUpdateCountryCode(c.code)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs truncate">
                        <span className="text-base">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-90">{c.currencySymbol}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 bg-white border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-950 font-semibold">
                <div>
                  Active Locale: <strong className="font-extrabold">{selectedCountry.flag} {selectedCountry.name}</strong>
                </div>
                <div className="font-mono text-slate-600">
                  Currency: <strong className="text-blue-700">{selectedCountry.currencySymbol} ({selectedCountry.currencyCode})</strong> | Tax: <strong>{selectedCountry.taxName} ({selectedCountry.defaultTaxPercent}%)</strong>
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
              <Printer size={18} className="text-blue-600" /> Medical Letterhead & Invoice Branding
            </h3>

            <form onSubmit={handleSaveBranding} className="space-y-4" id="form-settings-branding">
              {/* Logo Upload Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                <label className="block text-xs font-semibold text-slate-600 mb-3">Laboratory Logo</label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="relative h-16 w-16 border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <img src={logoUrl} alt="Lab Logo" className="h-full w-full object-contain" />
                      <button
                        type="button"
                        onClick={handleLogoDelete}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                      <Upload size={20} />
                    </div>
                  )}
                  <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    Choose File
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Signature Upload Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-600 mb-3">Pathologist Signature</label>
                  <div className="flex items-center gap-4">
                    {pathologistSignatureUrl ? (
                      <div className="relative h-16 w-32 border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <img src={pathologistSignatureUrl} alt="Signature" className="h-full w-full object-contain" />
                        <button
                          type="button"
                          onClick={handleSignatureDelete}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                        <Upload size={20} />
                      </div>
                    )}
                    <label className="cursor-pointer bg-white px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      Choose File
                      <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-600 mb-3">Lab Technician Signature</label>
                  <div className="flex items-center gap-4">
                    {technicianSignatureUrl ? (
                      <div className="relative h-16 w-32 border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <img src={technicianSignatureUrl} alt="Tech Signature" className="h-full w-full object-contain" />
                        <button
                          type="button"
                          onClick={handleTechSignatureDelete}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                        <Upload size={20} />
                      </div>
                    )}
                    <label className="cursor-pointer bg-white px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      Choose File
                      <input type="file" accept="image/*" onChange={handleTechSignatureUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pathologist Name *</label>
                  <input
                    type="text"
                    value={pathologistName}
                    onChange={e => setPathologistName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pathologist Degree & Reg. No. *</label>
                  <input
                    type="text"
                    value={pathologistDegree}
                    onChange={e => setPathologistDegree(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lab Technician Name *</label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={e => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lab Technician Degree & Reg. No. *</label>
                  <input
                    type="text"
                    value={technicianDegree}
                    onChange={e => setTechnicianDegree(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Clinic / Laboratory Name *</label>
                  <input
                    type="text"
                    required
                    value={labName}
                    onChange={e => setLabName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Corporate Slogan *</label>
                  <input
                    type="text"
                    required
                    value={slogan}
                    onChange={e => setSlogan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{selectedCountry.taxName} Tax Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={gstin}
                    onChange={e => setGstin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Medical License ID *</label>
                  <input
                    type="text"
                    required
                    value={licenseNo}
                    onChange={e => setLicenseNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Support Contact / Telephone *</label>
                  <input
                    type="tel"
                    required
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Letterhead Header Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Update Lab Identity
                </button>
              </div>
            </form>
          </div>

          {/* Locales, branches and backups */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6" id="settings-controls-panel">
            {/* Branch Switcher */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building size={14} className="text-blue-500" /> {t.branch} Settings
              </h3>
              <p className="text-[11px] text-slate-400">Manage patient directories across multi-branch diagnostic offices.</p>

              <div className="grid grid-cols-1 gap-2">
                {branches.map(b => (
                  <div key={b} className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                      currentBranch === b
                        ? 'border-blue-500 bg-blue-50/40 text-blue-600 shadow-2xs'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}>
                    <button
                      type="button"
                      onClick={() => {
                        onChangeBranch(b);
                        alert(`Switched active environment to ${b} branch database.`);
                      }}
                      className="flex-1 text-left text-xs font-bold cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <span>{b}</span>
                        {currentBranch === b && <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-sm">ACTIVE</span>}
                      </div>
                    </button>
                    {branches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteBranch(b)}
                        className="ml-2 p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={e => setNewBranchName(e.target.value)}
                    placeholder="New Branch Name"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newBranchName) {
                        onAddBranch(newBranchName);
                        setNewBranchName('');
                      }
                    }}
                    className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-900 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Backups */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database size={14} className="text-blue-500" /> Database Backup & Restores
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">Schedule backup exports or restore previous audit records.</p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleBackup}
                  className="flex items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <Download size={13} /> Export Backup
                </button>

                <button
                  type="button"
                  onClick={handleRestore}
                  className="flex items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <Upload size={13} /> Restore JSON
                </button>
              </div>

              {/* Hidden file input for file restoration */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />

              {/* Status message for backup & restore */}
              {backupRestoreStatus.message && (
                <div className={`p-2.5 rounded-lg text-[11px] font-bold mt-2 text-left ${
                  backupRestoreStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {backupRestoreStatus.message}
                </div>
              )}

              {onClearAllData && (
                <div className="space-y-3 pt-5 border-t border-red-100 bg-red-50/20 p-4 rounded-2xl border border-red-100/50 mt-4 text-left">
                  <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={14} className="text-red-500" /> Secure Master Reset (डेटा मास्टर रीसेट)
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    सुरक्षा कारणों से, लैब का सारा डेटा (मरीज, रिपोर्ट्स, बिल, अपॉइंटमेंट्स, खर्चे) डिलीट करने के लिए अधिकृत <strong>Admin ID</strong> और <strong>Password</strong> दर्ज करना अनिवार्य है।
                    {currentUser && (
                      <span className="block mt-1 text-[10px] text-red-600 font-semibold bg-red-50/50 p-1 rounded-sm border border-red-100">
                        💡 आपका वर्तमान Admin ID: <strong className="font-mono">{currentUser.username}</strong>
                      </span>
                    )}
                  </p>

                  <form onSubmit={handleSecureReset} className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Admin ID</label>
                        <input
                          type="text"
                          required
                          value={resetUsername}
                          onChange={(e) => setResetUsername(e.target.value)}
                          placeholder="Admin ID दर्ज करें"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-400 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Password</label>
                        <input
                          type="password"
                          required
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-400 transition-colors"
                        />
                      </div>
                    </div>

                    {resetStatus.message && (
                      <div className={`p-2.5 rounded-lg text-[11px] font-bold ${
                        resetStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {resetStatus.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isResetting}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <Trash2 size={13} /> {isResetting ? 'Processing Reset...' : 'Verify Credentials & Master Reset'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Master Reset */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-red-100 shadow-2xl p-6 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                <Trash2 size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-900">
                  💥 डेटा मास्टर रीसेट की पुष्टि करें?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  क्या आप वाकई सारा डेटा (मरीज, टेस्ट रिपोर्ट्स, इनवॉइस, अपॉइंटमेंट्स, खर्चे) पूरी तरह से डिलीट करना चाहते हैं?
                </p>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-[11px] text-red-700 leading-normal space-y-1">
                  <p className="font-extrabold">⚠️ चेतावनी:</p>
                  <ul className="list-disc pl-4 space-y-0.5 font-medium">
                    <li>यह प्रक्रिया अपरिवर्तनीय है (Cannot be undone)।</li>
                    <li>लैब से संबंधित समस्त रिकॉर्ड हमेशा के लिए डिलीट हो जाएंगे।</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={executeReset}
                className="px-4 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                हाँ, डेटा रीसेट करें (Yes, Reset Data)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

