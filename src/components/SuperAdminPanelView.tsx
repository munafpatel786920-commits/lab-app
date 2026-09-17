import React, { useState } from 'react';
import {
  Globe,
  Building2,
  ShieldCheck,
  Key,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  UserCheck,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Filter,
  Layers,
  Sparkles,
  CreditCard,
  RefreshCw,
  ExternalLink,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { LabTenant, CountryConfig } from '../types';
import { SUPPORTED_COUNTRIES } from '../data/saasData';

interface SuperAdminPanelViewProps {
  tenants: LabTenant[];
  onAddTenant: (tenant: LabTenant) => Promise<void> | void;
  onUpdateTenant: (tenant: LabTenant) => Promise<void> | void;
  onDeleteTenant?: (tenantId: string) => Promise<void> | void;
  onSelectTenantToLogin?: (tenant: LabTenant) => void;
}

export default function SuperAdminPanelView({
  tenants,
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
  onSelectTenantToLogin
}: SuperAdminPanelViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<LabTenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<LabTenant | null>(null);
  const [justCreatedTenant, setJustCreatedTenant] = useState<LabTenant | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Form State for Creating/Editing Lab Tenant License
  const [labName, setLabName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
  const [plan, setPlan] = useState<'Starter' | 'Professional' | 'Enterprise'>('Professional');
  const [status, setStatus] = useState<'Active' | 'Suspended' | 'Expired'>('Active');
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('pass123');
  const [maxStaffLimit, setMaxStaffLimit] = useState(15);
  const [monthlyFee, setMonthlyFee] = useState(299);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // Get current country config object
  const currentCountry = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountryCode) || SUPPORTED_COUNTRIES[0];

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const country = SUPPORTED_COUNTRIES.find(c => c.code === code);
    if (country) {
      if (code === 'IN') setMonthlyFee(15000);
      else if (code === 'US' || code === 'CA') setMonthlyFee(299);
      else if (code === 'GB') setMonthlyFee(249);
      else if (code === 'AE') setMonthlyFee(1200);
      else if (code === 'SA') setMonthlyFee(1100);
      else setMonthlyFee(299);
    }
  };

  const openCreateModal = () => {
    setEditingTenant(null);
    setLabName('');
    setOwnerName('');
    setEmail('');
    setPhone('');
    setSelectedCountryCode('IN');
    setPlan('Professional');
    setStatus('Active');
    setExpiryDate('2028-12-31');
    setAdminUsername('admin_lab1');
    setAdminPassword('password123');
    setMaxStaffLimit(15);
    setMonthlyFee(15000);
    setIsModalOpen(true);
  };

  const openEditModal = (t: LabTenant) => {
    setEditingTenant(t);
    setLabName(t.labName);
    setOwnerName(t.ownerName);
    setEmail(t.email);
    setPhone(t.phone);
    setSelectedCountryCode(t.countryCode);
    setPlan(t.plan);
    setStatus(t.status);
    setExpiryDate(t.expiryDate);
    setAdminUsername(t.adminUsername);
    setAdminPassword(t.adminPassword);
    setMaxStaffLimit(t.maxStaffLimit);
    setMonthlyFee(t.monthlyFee);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labName.trim()) {
      alert('Please fill in Lab Name.');
      return;
    }

    const countryObj = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountryCode) || SUPPORTED_COUNTRIES[0];
    const generatedActivationKey = Math.floor(100000 + Math.random() * 900000).toString();

    const tenantData: LabTenant = {
      id: editingTenant ? editingTenant.id : `TNT-${countryObj.code}-${Math.floor(100 + Math.random() * 900)}`,
      labName: labName.trim(),
      ownerName: ownerName.trim() || 'Lab Director',
      email: email.trim() || `contact@${labName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: phone.trim() || `${countryObj.phoneCode} 987654321`,
      countryCode: countryObj.code,
      countryName: countryObj.name,
      currencySymbol: countryObj.currencySymbol,
      currencyCode: countryObj.currencyCode,
      taxName: countryObj.taxName,
      taxPercent: countryObj.defaultTaxPercent,
      plan,
      status,
      expiryDate,
      adminUsername: editingTenant ? editingTenant.adminUsername : '',
      adminPassword: editingTenant ? editingTenant.adminPassword : '',
      maxStaffLimit: Number(maxStaffLimit),
      monthlyFee: Number(monthlyFee),
      createdAt: editingTenant ? editingTenant.createdAt : new Date().toISOString().split('T')[0],
      activationKey: editingTenant ? (editingTenant.activationKey || generatedActivationKey) : generatedActivationKey
    };

    if (editingTenant) {
      await onUpdateTenant(tenantData);
      setIsModalOpen(false);
    } else {
      await onAddTenant(tenantData);
      setIsModalOpen(false); // Close the input modal
      setJustCreatedTenant(tenantData); // Show the success/activation modal
    }
  };

  const toggleStatus = async (tenant: LabTenant) => {
    const newStatus = tenant.status === 'Active' ? 'Suspended' : 'Active';
    const updated = { ...tenant, status: newStatus as any };
    await onUpdateTenant(updated);
  };

  // Filtered tenants (excluding any legacy Apex Diagnostics entry)
  const displayTenants = tenants.filter(t => !t.labName.toLowerCase().includes('apex diagnostic'));

  const filteredTenants = displayTenants.filter(t => {
    const matchesSearch =
      t.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.adminUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.countryName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry = selectedCountryFilter === 'ALL' || t.countryCode === selectedCountryFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || t.status === selectedStatusFilter;

    return matchesSearch && matchesCountry && matchesStatus;
  });

  const activeTenantsCount = displayTenants.filter(t => t.status === 'Active').length;
  const uniqueCountriesCount = new Set(displayTenants.map(t => t.countryCode)).size;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-purple-500 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck size={14} className="text-indigo-400" />
              Global SaaS Master Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              Super Admin SaaS Panel
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl">
              Manage multi-country pathology lab tenants, issue lab admin credentials, set custom currencies/taxes, and control SaaS subscription access across global clients.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>Grant & Issue New Lab License</span>
          </button>
        </div>
      </div>

      {/* Global SaaS Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Lab Tenants</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{tenants.length}</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>{activeTenantsCount} Active SaaS Licenses</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Global Markets Reached</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Globe size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{uniqueCountriesCount} Countries</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">
            {SUPPORTED_COUNTRIES.slice(0, 5).map(c => c.flag).join(' ')} + more
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Global Currency Support</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{SUPPORTED_COUNTRIES.length} Currencies</div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            ₹, $, £, AED, SAR, RM, A$, C$, €
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Multi-Country Tax Engine</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Layers size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">Auto Tax & VAT</div>
          <div className="text-[11px] text-purple-600 font-bold">
            GST 18%, VAT 20%, Sales Tax
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Lab Name, Owner, Country or Admin Username..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 shrink-0">
            <Globe size={14} className="text-indigo-600 ml-1" />
            <select
              value={selectedCountryFilter}
              onChange={e => setSelectedCountryFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL">All Countries ({tenants.length})</option>
              {SUPPORTED_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 shrink-0">
            <Filter size={14} className="text-indigo-600 ml-1" />
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL">All License Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lab Tenants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            Registered Multi-Country Lab Tenants ({filteredTenants.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Only active tenants can log into the system with their issued admin credentials.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Lab Tenant & ID</th>
                <th className="py-3 px-4">Country & Currency</th>
                <th className="py-3 px-4">Issued Admin Credentials</th>
                <th className="py-3 px-4">SaaS Plan</th>
                <th className="py-3 px-4">License Expiry</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No lab tenants found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants.map(tenant => {
                  const countryObj = SUPPORTED_COUNTRIES.find(c => c.code === tenant.countryCode);
                  const isPasswordVisible = showPassword[tenant.id] || false;

                  return (
                    <tr key={tenant.id} className="hover:bg-indigo-50/30 transition-colors">
                      {/* Lab Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{tenant.labName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-semibold text-indigo-600">{tenant.id}</span>
                          <span>•</span>
                          <span>Owner: {tenant.ownerName}</span>
                        </div>
                      </td>

                      {/* Country & Currency */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span className="text-lg">{countryObj?.flag || '🌐'}</span>
                          <span>{tenant.countryName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Currency: <span className="font-bold text-slate-700">{tenant.currencySymbol} ({tenant.currencyCode})</span> | Tax: {tenant.taxName} {tenant.taxPercent}%
                        </div>
                      </td>

                      {/* Admin Credentials / Secure Activation */}
                      <td className="py-3.5 px-4">
                        {tenant.adminUsername ? (
                          <div className="bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl text-[11px] space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-500 font-semibold">User ID:</span>
                              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {tenant.adminUsername}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-500 font-semibold">Password:</span>
                              <span className="font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                •••••••• (Secure)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50/70 border border-amber-200 p-2 rounded-xl text-[11px] space-y-1">
                            <div className="flex items-center gap-1 text-amber-800 font-bold">
                              <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                              <span>Pending Setup</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 bg-white/80 p-1 rounded-lg border border-amber-100">
                              <span className="text-[10px] text-amber-950 font-bold">Key:</span>
                              <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                {tenant.activationKey || 'N/A'}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                          <Sparkles size={12} />
                          {tenant.plan}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Fee: {tenant.currencySymbol}{tenant.monthlyFee} / mo
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{tenant.expiryDate}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Max Staff: {tenant.maxStaffLimit}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {tenant.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={13} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <XCircle size={13} />
                            {tenant.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onSelectTenantToLogin && (
                            <button
                              type="button"
                              onClick={() => onSelectTenantToLogin(tenant)}
                              title="Test Login as this Tenant Admin"
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink size={12} />
                              Login
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(tenant)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit License"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleStatus(tenant)}
                            className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              tenant.status === 'Active'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {tenant.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingTenant(tenant)}
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer border border-rose-200 bg-rose-50/50"
                            title="Delete Tenant"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant / Edit Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-indigo-400" />
                <h3 className="text-lg font-extrabold">
                  {editingTenant ? 'Edit Lab Tenant License' : 'Issue New Lab SaaS License'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pathology Lab Name *</label>
                  <input
                    type="text"
                    required
                    value={labName}
                    onChange={e => setLabName(e.target.value)}
                    placeholder="e.g. Metro Pathology UK"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lab Director / Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. Dr. John Doe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Country Selection */}
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-indigo-950">
                  Select Lab Country (Auto-Configures Currency & Tax Engine) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORTED_COUNTRIES.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountryChange(c.code)}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        selectedCountryCode === c.code
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <span>{c.flag} {c.name}</span>
                      <span className="text-[10px] opacity-80">{c.currencySymbol}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-indigo-700 font-medium">
                  Selected: {currentCountry.flag} {currentCountry.name} | Currency: {currentCountry.currencySymbol} ({currentCountry.currencyCode}) | Tax: {currentCountry.taxName} ({currentCountry.defaultTaxPercent}%)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="lab@domain.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={`${currentCountry.phoneCode} 9876543210`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Security note & activation status */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold text-slate-100">Self-Service Secure Activation</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  For data security compliance, Super Admins cannot configure or view custom passwords. The Lab Admin will set their own User ID & Password using the secure activation page.
                </p>
                {editingTenant ? (
                  <div className="mt-2 pt-2 border-t border-slate-850 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status:</span>
                    {editingTenant.adminUsername ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Activated</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-500/20">Pending Setup</span>
                        <span className="text-xs font-mono font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          Key: {editingTenant.activationKey || 'N/A'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Activation Key:</span>
                    <span className="text-xs font-bold text-indigo-300 italic">Will be auto-generated</span>
                  </div>
                )}
              </div>

              {/* Subscription & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SaaS Plan</label>
                  <select
                    value={plan}
                    onChange={e => setPlan(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly License Fee ({currentCountry.currencySymbol})</label>
                  <input
                    type="number"
                    value={monthlyFee}
                    onChange={e => setMonthlyFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">License Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <option value="Active">Active Access</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Staff Limit</label>
                  <input
                    type="number"
                    value={maxStaffLimit}
                    onChange={e => setMaxStaffLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck size={16} />
                  <span>{editingTenant ? 'Save License Changes' : 'Issue SaaS Access Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Tenant Confirmation Modal */}
      {deletingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Lab Tenant?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <p className="font-semibold text-slate-700">
                Are you sure you want to permanently delete tenant <strong className="text-slate-900 font-bold">{deletingTenant.labName}</strong>?
              </p>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 mt-2">
                <span>ID: <span className="text-indigo-700">{deletingTenant.id}</span></span>
                <span>•</span>
                <span>Owner: <span className="text-slate-800">{deletingTenant.ownerName}</span></span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Once deleted, this tenant lab and its login access will be removed from the system.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingTenant(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (onDeleteTenant) {
                    await onDeleteTenant(deletingTenant.id);
                  }
                  setDeletingTenant(null);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Delete Tenant</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* License Activation Success / Key Modal */}
      {justCreatedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden p-6 space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">SaaS License Issued!</h3>
                <p className="text-xs text-emerald-700 font-bold">लाइसेंस सफलतापूर्वक जनरेट किया गया!</p>
              </div>
            </div>

            {/* Crucial Security Notice */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                <AlertTriangle size={15} className="text-amber-600" />
                <span>🔐 Security Rules: No ID/Password Sent on Email!</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">
                डेटा सुरक्षा के लिए, <strong>आईडी और पासवर्ड ईमेल पर नहीं भेजा जाता है</strong>। सुपर एडमिन भी इस पासवर्ड को नहीं देख सकते। अब लैब संचालक खुद नीचे दिए गए एक्टिवेशन की (Key) से अपना पासवर्ड जनरेट करेंगे।
              </p>
              <p className="text-[11px] text-amber-900 font-semibold">
                For maximum security compliance, credentials are not created or sent. The lab admin will generate their own credentials securely.
              </p>
            </div>

            {/* Tenant Details */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50">
                <span className="text-slate-500 font-semibold">Lab Name (लैब):</span>
                <span className="font-extrabold text-slate-900">{justCreatedTenant.labName}</span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-semibold">Director / Owner:</span>
                <span className="font-bold text-slate-800">{justCreatedTenant.ownerName}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50">
                <span className="text-slate-500 font-semibold">Email:</span>
                <span className="font-mono text-slate-700">{justCreatedTenant.email}</span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-slate-500 font-semibold">Plan:</span>
                <span className="font-bold text-indigo-700">{justCreatedTenant.plan}</span>
              </div>
              <div className="p-4 bg-indigo-50/50 flex flex-col items-center justify-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">License Activation Key</span>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-2xl font-black text-indigo-700 tracking-widest bg-white px-4 py-1.5 rounded-xl border border-indigo-200 shadow-xs">
                    {justCreatedTenant.activationKey}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(justCreatedTenant.activationKey || '');
                      setCopiedText(true);
                      setTimeout(() => setCopiedText(false), 2000);
                    }}
                    className="p-2.5 bg-white text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-xl transition-all hover:bg-indigo-50 shadow-xs cursor-pointer flex items-center gap-1"
                    title="Copy Key"
                  >
                    {copiedText ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp/Email Shareable Message Template */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block">Copy Shareable Invitation Message (क्लाइंट को भेजने के लिए कॉपी करें):</span>
              <textarea
                readOnly
                value={`Hi ${justCreatedTenant.ownerName},\n\nYour pathology lab "${justCreatedTenant.labName}" license has been successfully issued!\n\nFor security compliance, we do not set or email passwords. Please set up your own secret admin ID & Password using your activation key.\n\n🔑 License Activation Key: ${justCreatedTenant.activationKey}\n🔗 Set Up Credentials here: Please click "Activate License & Set Password" on the Login Page.\n\nBest Regards,\nSaaS Support Team`}
                className="w-full h-28 p-2.5 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none resize-none font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  const txt = `Hi ${justCreatedTenant.ownerName},\n\nYour pathology lab "${justCreatedTenant.labName}" license has been successfully issued!\n\nFor security compliance, we do not set or email passwords. Please set up your own secret admin ID & Password using your activation key.\n\n🔑 License Activation Key: ${justCreatedTenant.activationKey}\n🔗 Set Up Credentials here: Please click "Activate License & Set Password" on the Login Page.\n\nBest Regards,\nSaaS Support Team`;
                  navigator.clipboard.writeText(txt);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="w-full py-2 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span>Message Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Invitation Message</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setJustCreatedTenant(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Done (ठीक है)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
