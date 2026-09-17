import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertOctagon,
  Users,
  KeyRound,
  Save,
  RotateCcw,
  Sliders,
  Check,
  X,
  Info,
  Building2,
  Plus,
  UserPlus,
  Search,
  Eye,
  EyeOff,
  UserCheck,
  Edit2,
  Trash2
} from 'lucide-react';
import { UserRole, RolePermissions, UserAccount } from '../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../data/saasData';
import { DEFAULT_USERS } from '../data/defaultUsers';

interface RolePermissionsViewProps {
  currentUserRole: UserRole;
  permissions: RolePermissions[];
  onSavePermissions: (updatedPermissions: RolePermissions[]) => Promise<void> | void;
  users?: UserAccount[];
  onAddUser?: (user: UserAccount) => Promise<void> | void;
  onDeleteUser?: (userId: string) => Promise<void> | void;
}

interface ModuleDefinition {
  id: string;
  label: string;
  description: string;
}

const MODULES_LIST: ModuleDefinition[] = [
  { id: 'dashboard', label: 'Dashboard & Analytics', description: 'Overview metrics, test statistics, revenue summary' },
  { id: 'patients', label: 'Patient Directory', description: 'Register new patients, patient history and medical profiles' },
  { id: 'tests', label: 'Test Catalog & Pricing', description: 'Manage test parameters, reference ranges, and test packages' },
  { id: 'samples', label: 'Sample Tracking & Barcodes', description: 'Barcode generation, sample collection, and lab workflow' },
  { id: 'reports', label: 'Test Reports & Signatures', description: 'Enter test results, pathologist digital signature, PDF reports' },
  { id: 'billing', label: 'Invoicing & Billing', description: 'Generate invoices, payment status, discounts, and GST/VAT receipts' },
  { id: 'appointments', label: 'Appointment Booking', description: 'Schedule lab visits, time slot management' },
  { id: 'homeCollection', label: 'Home Sample Visits', description: 'Assign phlebotomists, route tracking, home sample status' },
  { id: 'inventory', label: 'Inventory & Reagents', description: 'Reagent stock, kit consumption threshold, supplier management' },
  { id: 'staff', label: 'Staff & HR Management', description: 'Staff directory, attendance, salary payments, and user credentials' },
  { id: 'finance', label: 'Financial Expenses', description: 'Track lab expenses, reagent costs, monthly financial summaries' },
  { id: 'settings', label: 'Lab & Header Settings', description: 'Lab logo, report header/footer, branches, header address' }
];

const EDITABLE_ROLES: { role: UserRole; label: string; badgeColor: string }[] = [
  { role: 'Doctor', label: 'Doctor / Pathologist', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { role: 'Technician', label: 'Lab Technician', badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { role: 'Receptionist', label: 'Reception Desk', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { role: 'Accountant', label: 'Accountant / Finance', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { role: 'Patient', label: 'Patient / Client', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' }
];

export default function RolePermissionsView({
  currentUserRole,
  permissions,
  onSavePermissions,
  users = [],
  onAddUser,
  onDeleteUser
}: RolePermissionsViewProps) {
  const [viewMode, setViewMode] = useState<'PERMISSIONS' | 'STAFF_CREDENTIALS'>('PERMISSIONS');
  const [activeTabRole, setActiveTabRole] = useState<UserRole>('Doctor');
  const [localPermissions, setLocalPermissions] = useState<RolePermissions[]>(() => {
    return permissions && permissions.length > 0 ? permissions : DEFAULT_ROLE_PERMISSIONS;
  });
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Staff Credentials State
  const [userList, setUserList] = useState<UserAccount[]>(() => {
    return users && users.length > 0 ? users : DEFAULT_USERS;
  });
  const [staffSearch, setStaffSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);
  const [staffAlertMsg, setStaffAlertMsg] = useState<string | null>(null);

  // Form State for Adding / Editing Staff Credentials
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('password123');
  const [formRole, setFormRole] = useState<UserRole>('Technician');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Sync users prop if updated externally
  React.useEffect(() => {
    if (users && users.length > 0) {
      setUserList(users);
    }
  }, [users]);

  // Security Check: ONLY Admin and SuperAdmin can access this view
  const isAdminOrSuperAdmin = currentUserRole === 'Admin' || currentUserRole === 'SuperAdmin';

  if (!isAdminOrSuperAdmin) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="p-4 bg-rose-100 text-rose-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <AlertOctagon size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-rose-900">Access Denied - Restricted to Lab Admin Only</h2>
          <p className="text-xs text-rose-700">
            Role-Based Permissions Management is strictly restricted to Laboratory Administrators. Your current role is <strong className="font-bold underline">{currentUserRole}</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Current role's permission object
  const currentRolePerms = localPermissions.find(p => p.role === activeTabRole) || {
    role: activeTabRole,
    allowedViews: []
  };

  const isModuleAllowed = (moduleId: string) => {
    return currentRolePerms.allowedViews.includes(moduleId);
  };

  const toggleModulePermission = (moduleId: string) => {
    setLocalPermissions(prev => {
      return prev.map(p => {
        if (p.role !== activeTabRole) return p;

        const exists = p.allowedViews.includes(moduleId);
        const updatedViews = exists
          ? p.allowedViews.filter(v => v !== moduleId)
          : [...p.allowedViews, moduleId];

        return { ...p, allowedViews: updatedViews };
      });
    });
  };

  const handleSave = async () => {
    await onSavePermissions(localPermissions);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all role permissions to factory defaults?')) {
      setLocalPermissions(DEFAULT_ROLE_PERMISSIONS);
    }
  };

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim() || !formPassword.trim()) {
      alert('Name, Username (ID), and Password are required.');
      return;
    }

    const newUser: UserAccount = {
      id: editingUser ? editingUser.id : `USR-${Date.now()}`,
      name: formName.trim(),
      username: formUsername.trim().toLowerCase(),
      password: formPassword.trim(),
      role: formRole,
      email: `${formUsername.trim().toLowerCase()}@apexlab.com`,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString().split('T')[0]
    };

    if (onAddUser) {
      await onAddUser(newUser);
    }

    setUserList(prev => {
      const idx = prev.findIndex(u => u.id === newUser.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newUser;
        return copy;
      }
      return [newUser, ...prev];
    });

    alert(`✅ Staff Access Credentials Saved Successfully!\n\nName: ${newUser.name}\nUser ID: ${newUser.username}\nPassword: ${newUser.password}\nRole: ${newUser.role}`);

    setShowAddModal(false);
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('password123');
    setFormRole('Technician');
  };

  const openEditUserModal = (user: UserAccount) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormPassword(user.password);
    setFormRole(user.role);
    setShowAddModal(true);
  };

  const handleDeleteStaffUser = (user: UserAccount) => {
    setDeletingUser(user);
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    const targetUser = deletingUser;
    setDeletingUser(null);

    setUserList(prev => prev.filter(u => u.id !== targetUser.id));

    if (onDeleteUser) {
      await onDeleteUser(targetUser.id);
    }

    setStaffAlertMsg(`🗑️ Staff account "${targetUser.name}" (${targetUser.username}) deleted successfully.`);
    setTimeout(() => setStaffAlertMsg(null), 4000);
  };

  const filteredUsers = userList.filter(u => {
    const q = staffSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <ShieldCheck size={13} />
            Admin Access Control & Staff Credentials Center
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Role Permissions & Staff ID-Pass Credentials
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Grant staff access using their unique User ID & Password. Configure module-level visibility and permissions for each role or individual staff credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={15} />
            Save Role Permissions
          </button>
        </div>
      </div>

      {isSavedAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>Role permissions updated successfully! Staff accounts logged in under modified roles will automatically reflect updated menu access.</span>
        </div>
      )}

      {/* Main View Mode Selector Tabs */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl max-w-md border border-slate-300/60">
        <button
          type="button"
          onClick={() => setViewMode('PERMISSIONS')}
          className={`flex-1 py-2.5 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            viewMode === 'PERMISSIONS'
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders size={16} />
          Role Module Permissions
        </button>

        <button
          type="button"
          onClick={() => setViewMode('STAFF_CREDENTIALS')}
          className={`flex-1 py-2.5 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            viewMode === 'STAFF_CREDENTIALS'
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound size={16} />
          Staff ID & Pass Credentials
        </button>
      </div>

      {/* VIEW 1: Role Module Permissions Matrix */}
      {viewMode === 'PERMISSIONS' && (
        <div className="space-y-6">
          {/* Role Selection Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {EDITABLE_ROLES.map(({ role, label }) => {
                const isActive = activeTabRole === role;
                const roleObj = localPermissions.find(p => p.role === role);
                const count = roleObj ? roleObj.allowedViews.length : 0;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setActiveTabRole(role)}
                    className={`px-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Users size={16} />
                    <span>{label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count} modules
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modules Matrix for Selected Role */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders size={18} className="text-blue-600" />
                  Module Access Permissions for Role: <span className="text-blue-700 font-black">{activeTabRole}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Toggle ON to allow users logged in as <span className="font-bold">{activeTabRole}</span> to access that module.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLocalPermissions(prev =>
                      prev.map(p =>
                        p.role === activeTabRole
                          ? { ...p, allowedViews: MODULES_LIST.map(m => m.id) }
                          : p
                      )
                    );
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setLocalPermissions(prev =>
                      prev.map(p => (p.role === activeTabRole ? { ...p, allowedViews: [] } : p))
                    );
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {MODULES_LIST.map(mod => {
                const allowed = isModuleAllowed(mod.id);

                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModulePermission(mod.id)}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                      allowed ? 'bg-blue-50/20 hover:bg-blue-50/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{mod.label}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          viewId: {mod.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{mod.description}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                          allowed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {allowed ? <Check size={14} /> : <X size={14} />}
                        {allowed ? 'Allowed' : 'Restricted'}
                      </span>

                      {/* Toggle Switch */}
                      <div
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          allowed ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-xs absolute top-0.5 transition-transform ${
                            allowed ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Staff ID & Password Access Credentials */}
      {viewMode === 'STAFF_CREDENTIALS' && (
        <div className="space-y-6">
          {staffAlertMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <Check size={18} className="text-emerald-600" />
                <span>{staffAlertMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setStaffAlertMsg(null)}
                className="text-emerald-500 hover:text-emerald-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
            <KeyRound className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-blue-900">
                Staff ID & Password Access Control (स्टाफ ID & Password एक्सेस)
              </h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                Staff members access the system strictly using their assigned <strong>User ID & Password</strong>. Create new staff credentials below or edit existing login details to grant system access.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={staffSearch}
                onChange={e => setStaffSearch(e.target.value)}
                placeholder="Search staff by Name, User ID or Role..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setFormName('');
                setFormUsername('');
                setFormPassword('password123');
                setFormRole('Technician');
                setShowAddModal(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Issue New Staff ID & Password</span>
            </button>
          </div>

          {/* Staff Credentials Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Active Staff Accounts & Credentials ({filteredUsers.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">User ID / Username</th>
                    <th className="py-3 px-4">Password</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Allowed Modules</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => {
                    const isShowPass = !!showPasswordMap[user.id];
                    const rolePermObj = localPermissions.find(p => p.role === user.role);
                    const allowedCount = rolePermObj ? rolePermObj.allowedViews.length : 0;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-100 text-blue-700 font-black rounded-lg flex items-center justify-center text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-900">{user.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">{user.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                            {user.username}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-800 font-bold">
                              {isShowPass ? user.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswordMap(prev => ({
                                  ...prev,
                                  [user.id]: !prev[user.id]
                                }))
                              }
                              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                            >
                              {isShowPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {user.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            {allowedCount} modules accessible
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditUserModal(user)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-all border border-blue-200 inline-flex items-center gap-1 cursor-pointer"
                              title="Edit Credentials"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStaffUser(user)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg transition-all border border-rose-200 inline-flex items-center gap-1 cursor-pointer"
                              title="Delete Staff Account"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        No staff user accounts found matching "{staffSearch}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Issue / Edit Staff Credentials (ID & Password) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <KeyRound size={20} className="text-blue-600" />
                {editingUser ? 'Edit Staff Credentials (ID & Pass)' : 'Issue Staff ID & Password'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Staff Member Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => {
                    setFormName(e.target.value);
                    if (!editingUser) {
                      setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                    }
                  }}
                  placeholder="e.g. Dr. Rajesh Patel"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned User ID / Username *</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={e => setFormUsername(e.target.value)}
                  placeholder="e.g. rajesh_patel or rajesh@apexlab.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  The staff member will enter this User ID to Sign In.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Set Password *</label>
                <input
                  type="text"
                  required
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder="Set login password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role *</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Doctor">Doctor / Pathologist</option>
                  <option value="Technician">Lab Technician</option>
                  <option value="Receptionist">Reception Desk</option>
                  <option value="Accountant">Accountant / Finance</option>
                  <option value="Patient">Patient / Client</option>
                  <option value="Admin">Admin Console</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={15} />
                  <span>{editingUser ? 'Update Credentials' : 'Save & Issue Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal for Confirming Staff Account Deletion */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Staff Account?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <p className="text-xs text-slate-700 font-semibold">
                Are you sure you want to delete staff account for <strong className="text-slate-900 font-bold">{deletingUser.name}</strong>?
              </p>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                <span>User ID: <span className="text-blue-700">{deletingUser.username}</span></span>
                <span>•</span>
                <span>Role: <span className="text-indigo-700">{deletingUser.role}</span></span>
              </div>
              <p className="text-[11px] text-slate-500">
                Once deleted, this staff member will immediately lose access to the system.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Yes, Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

