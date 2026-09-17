import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  User,
  Eye,
  EyeOff,
  Beaker,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  UserPlus,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Globe,
  Sparkles,
  Building2,
  PhoneCall
} from 'lucide-react';
import { UserAccount, UserRole, LabTenant } from '../types';
import { DEFAULT_USERS } from '../data/defaultUsers';
import { SUPER_ADMIN_ACCOUNT, INITIAL_TENANTS, SUPPORTED_COUNTRIES } from '../data/saasData';
import globalSoftwareLogo from '../assets/images/global_software_logo_1784805416273.jpg';

interface LoginModalProps {
  users: UserAccount[];
  tenants?: LabTenant[];
  onLogin: (user: UserAccount) => void;
  onAddUser?: (user: UserAccount) => Promise<void> | void;
  onUpdateTenant?: (tenant: LabTenant) => Promise<void> | void;
  onClose?: () => void;
  isModalMode?: boolean; // True if opened as a modal dialog, false if full screen login
}

export default function LoginModal({
  users,
  tenants = INITIAL_TENANTS,
  onLogin,
  onAddUser,
  onUpdateTenant,
  onClose,
  isModalMode = false
}: LoginModalProps) {
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [mode, setMode] = useState<'LOGIN' | 'ACTIVATE'>('LOGIN');

  // Login Form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [showDefaultAccList, setShowDefaultAccList] = useState(false);

  // License Activation Form state
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [activationKeyInput, setActivationKeyInput] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [showActivationPassword, setShowActivationPassword] = useState(false);

  // Register Form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Technician');
  const [isRegistering, setIsRegistering] = useState(false);

  const allUsersList = users && users.length > 0 ? users : DEFAULT_USERS;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Please enter your User ID / Username and Password.');
      return;
    }

    const inputLower = usernameInput.trim().toLowerCase();
    const inputPass = passwordInput.trim();

    // 1. Check Super Admin Login
    if (
      (inputLower === 'patelmunaf90@gmail.com' || inputLower === 'superadmin' || inputLower === SUPER_ADMIN_ACCOUNT.username.toLowerCase() || inputLower === SUPER_ADMIN_ACCOUNT.email?.toLowerCase()) &&
      (inputPass === 'munaf786' || inputPass === 'superpassword123' || inputPass === SUPER_ADMIN_ACCOUNT.password)
    ) {
      setSuccessMessage('Welcome, Munaf Patel! Directing to Global Super Admin Panel...');
      setTimeout(() => {
        onLogin(SUPER_ADMIN_ACCOUNT);
      }, 500);
      return;
    }

    // 2. Check if logging in as an issued Lab Tenant Admin (from Super Admin)
    const matchingTenant = tenants.find(
      t =>
        ((t.adminUsername && t.adminUsername.toLowerCase() === inputLower) || (t.email && t.email.toLowerCase() === inputLower)) &&
        t.adminPassword === inputPass
    );

    if (matchingTenant) {
      if (matchingTenant.status !== 'Active') {
        setErrorMessage(
          `Access Denied: The SaaS license for '${matchingTenant.labName}' is currently ${matchingTenant.status}. Please contact the Super Admin.`
        );
        return;
      }

      // Create or synthesize tenant admin user
      const countryObj = SUPPORTED_COUNTRIES.find(c => c.code === matchingTenant.countryCode);
      const tenantAdminUser: UserAccount = {
        id: `USR-TNT-ADMIN-${matchingTenant.id}`,
        username: matchingTenant.adminUsername,
        password: matchingTenant.adminPassword,
        name: `${matchingTenant.labName} (Admin)`,
        role: 'Admin',
        email: matchingTenant.email,
        tenantId: matchingTenant.id,
        createdAt: matchingTenant.createdAt
      };

      setSuccessMessage(`Access Granted! Welcome to ${matchingTenant.labName} (${countryObj?.flag} ${countryObj?.name})`);
      setTimeout(() => {
        onLogin(tenantAdminUser);
      }, 500);
      return;
    }

    // 3. Match general standard users
    const matched = allUsersList.find(
      u =>
        (u.username.toLowerCase() === inputLower || (u.email && u.email.toLowerCase() === inputLower)) &&
        u.password === inputPass
    );

    if (matched) {
      if (selectedRole !== 'ALL' && matched.role !== selectedRole) {
        setErrorMessage(`User '${matched.username}' has assigned role '${matched.role}', not '${selectedRole}'.`);
        return;
      }

      // Find if this user belongs to an issued tenant or generate a dedicated tenantId for clean isolated data
      const associatedTenant = tenants.find(t =>
        t.id === matched.tenantId ||
        (t.email && t.email.toLowerCase() === matched.email?.toLowerCase()) ||
        (t.adminUsername && t.adminUsername.toLowerCase() === matched.username?.toLowerCase())
      );

      const userTenantId = matched.tenantId || associatedTenant?.id || (matched.email && matched.email.toLowerCase() !== SUPER_ADMIN_ACCOUNT.email ? `TNT-${matched.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}` : undefined);

      const userToLogin: UserAccount = {
        ...matched,
        tenantId: userTenantId
      };

      onLogin(userToLogin);
    } else {
      setErrorMessage('Invalid User ID or Password. Check credentials or try Super Admin / Tenant credentials.');
    }
  };


  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMessage('Please fill in required fields (Name, Username, and Password).');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const cleanUsername = regUsername.trim().toLowerCase();

    // Check duplicate
    const exists = allUsersList.some(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      setErrorMessage(`Username '${cleanUsername}' is already taken. Please choose another username.`);
      return;
    }

    setIsRegistering(true);

    const newUser: UserAccount = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      username: cleanUsername,
      password: regPassword.trim(),
      name: regName.trim(),
      role: regRole,
      email: regEmail.trim() || `${cleanUsername}@apexlab.com`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      if (onAddUser) {
        await onAddUser(newUser);
      }
      setSuccessMessage(`Account '${newUser.username}' created successfully in Firebase! Signing in...`);
      setTimeout(() => {
        onLogin(newUser);
      }, 700);
    } catch (err) {
      console.error('Failed to create account:', err);
      setErrorMessage('Failed to save account to database. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedTenantId) {
      setErrorMessage('Please select a Lab / Tenant first.');
      return;
    }

    const tenant = tenants.find(t => t.id === selectedTenantId);
    if (!tenant) {
      setErrorMessage('Selected Lab / Tenant was not found.');
      return;
    }

    const cleanKey = activationKeyInput.trim();
    if (cleanKey !== tenant.activationKey) {
      setErrorMessage('Invalid License Activation Key. Please contact your Super Admin for the correct key.');
      return;
    }

    const cleanUser = newAdminUsername.trim().toLowerCase();
    const cleanPass = newAdminPassword.trim();
    const cleanConfirm = newAdminConfirmPassword.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Please enter an Admin Username and Password.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const usernameTaken = users.some(u => u.username.toLowerCase() === cleanUser) || 
      tenants.some(t => t.adminUsername.toLowerCase() === cleanUser && t.id !== selectedTenantId);
    
    if (usernameTaken) {
      setErrorMessage(`The username '${cleanUser}' is already taken. Please choose another one.`);
      return;
    }

    setIsActivating(true);

    try {
      const updatedTenant: LabTenant = {
        ...tenant,
        adminUsername: cleanUser,
        adminPassword: cleanPass
      };

      if (onUpdateTenant) {
        await onUpdateTenant(updatedTenant);
      }

      setSuccessMessage(`Credentials successfully generated for '${tenant.labName}'! You can now log in.`);
      setTimeout(() => {
        setUsernameInput(cleanUser);
        setPasswordInput(cleanPass);
        setMode('LOGIN');
        setActivationKeyInput('');
        setNewAdminUsername('');
        setNewAdminPassword('');
        setNewAdminConfirmPassword('');
      }, 2000);
    } catch (err) {
      console.error('Failed to activate lab:', err);
      setErrorMessage('Failed to activate license. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleSelectDefaultAccount = (demoUser: UserAccount) => {
    setUsernameInput(demoUser.username);
    setPasswordInput(demoUser.password);
    setSelectedRole(demoUser.role);
    setErrorMessage('');
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Doctor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Technician':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Receptionist':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Accountant':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Patient':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const labLogoUrl = typeof window !== 'undefined' ? localStorage.getItem('apex_labLogo') : null;

  const content = (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-slate-900 overflow-y-auto md:overflow-hidden text-slate-800 font-sans">
      {/* Left side full-height banner - Global Software Advertisement & Logo */}
      <div className="md:w-1/2 lg:w-7/12 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0 min-h-[420px] md:min-h-0">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-8 max-w-2xl my-auto">
          {/* Global Software Logo Branding */}
          <div className="flex items-center gap-4">
            <div className="p-1 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-2xl shadow-xl shadow-cyan-500/20 shrink-0">
              <img
                src={globalSoftwareLogo}
                alt="Global Software Logo"
                className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-xl border border-white/20 bg-slate-900"
              />
            </div>
            <div>
              <h1 className="font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white flex items-center gap-2">
                GLOBAL <span className="text-cyan-400">SOFTWARE</span>
              </h1>
              <p className="text-xs sm:text-sm font-bold text-cyan-200/90 tracking-widest uppercase mt-0.5">
                Empowering Your Digital World
              </p>
            </div>
          </div>

          {/* Optional Lab Logo Badge if configured */}
          {labLogoUrl && (
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
              <img src={labLogoUrl} alt="Laboratory Logo" className="h-7 w-7 object-contain rounded-lg bg-white/20 p-0.5" />
              <div className="text-left">
                <span className="text-[10px] font-mono text-cyan-300 uppercase block leading-none">Connected Lab</span>
                <span className="text-xs font-bold text-white leading-tight">Custom Lab Logo Configured</span>
              </div>
            </div>
          )}

          {/* SaaS Platform Showcase */}
          <div className="space-y-4 pt-2">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-3.5 py-1.5 rounded-full text-xs font-extrabold backdrop-blur-xs">
              <Sparkles size={14} className="text-cyan-300" />
              Next-Gen Pathology & Diagnostic SaaS Platform
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              All-In-One Smart Pathology & Laboratory Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Empowering diagnostic centers & pathology laboratories worldwide with automated sample tracking, instant report generation, multi-currency billing, and real-time operational analytics.
            </p>
          </div>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-xs text-slate-200 backdrop-blur-xs">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
              <span className="font-semibold">Multi-Country & Currency Billing</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-xs text-slate-200 backdrop-blur-xs">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
              <span className="font-semibold">Instant WhatsApp & PDF Reports</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-xs text-slate-200 backdrop-blur-xs">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
              <span className="font-semibold">Sample Barcode & NABL Compliance</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-xs text-slate-200 backdrop-blur-xs">
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
              <span className="font-semibold">Firebase Cloud Protected Data</span>
            </div>
          </div>
        </div>

        {/* Banner Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 mt-8 flex items-center justify-between text-xs text-cyan-100">
          <span className="font-bold flex items-center gap-2">
            <Sparkles size={15} className="text-yellow-400" /> 500+ Medical Diagnostic Labs Operational Worldwide
          </span>
          <span className="text-[10px] font-mono uppercase bg-cyan-400 text-slate-950 px-2.5 py-1 rounded-lg font-black tracking-wider">
            v4.2 Enterprise
          </span>
        </div>
      </div>

      {/* Right side form - Full height panel */}
      <div className="md:w-1/2 lg:w-5/12 bg-slate-50 p-6 sm:p-10 lg:p-16 flex flex-col justify-between relative overflow-y-auto min-h-screen md:min-h-0">
        {isModalMode && onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        )}

        <div className="w-full max-w-md mx-auto my-auto space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/80">
          {/* Form Header with Logo */}
          <div className="text-center space-y-3 pb-3 border-b border-slate-100">
            <div className="inline-block p-1 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-md">
              <img
                src={globalSoftwareLogo}
                alt="Global Software Logo"
                className="h-16 w-16 mx-auto rounded-xl object-cover border border-white/20 bg-slate-900"
              />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'ACTIVATE' ? 'Activate Lab License' : 'Sign In to Laboratory System'}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {mode === 'ACTIVATE'
                  ? 'Select your licensed lab, verify with your activation key, and generate your admin credentials.'
                  : 'Enter your authorized credentials to access your workspace.'}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 shadow-2xs">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 shadow-2xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'ACTIVATE' ? (
            /* License Activation Form */
            <form onSubmit={handleActivateSubmit} className="space-y-4 text-left">
              {/* Lab Selection Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-600" />
                  Select Licensed Laboratory
                </label>
                <select
                  value={selectedTenantId}
                  onChange={e => {
                    setSelectedTenantId(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                  required
                >
                  <option value="">-- Choose your licensed Lab --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.labName} {t.adminUsername ? '✓ (Activated)' : '⏳ (Setup Pending)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* License Activation Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-600" />
                  License Activation Key
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={activationKeyInput}
                  onChange={e => setActivationKeyInput(e.target.value)}
                  placeholder="6-digit Activation Key"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-center tracking-widest"
                  required
                />
              </div>

              {/* Generate Custom Admin Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User size={14} className="text-blue-600" />
                  Create Admin User ID / Username
                </label>
                <input
                  type="text"
                  value={newAdminUsername}
                  onChange={e => setNewAdminUsername(e.target.value)}
                  placeholder="e.g. custom_admin_id"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Generate Custom Admin Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-blue-600" />
                  Create Secret Password
                </label>
                <div className="relative">
                  <input
                    type={showActivationPassword ? 'text' : 'password'}
                    value={newAdminPassword}
                    onChange={e => setNewAdminPassword(e.target.value)}
                    placeholder="Enter secret password"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowActivationPassword(!showActivationPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showActivationPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Custom Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock size={14} className="text-blue-600" />
                  Confirm Secret Password
                </label>
                <input
                  type="password"
                  value={newAdminConfirmPassword}
                  onChange={e => setNewAdminConfirmPassword(e.target.value)}
                  placeholder="Re-enter secret password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isActivating}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 text-white text-sm font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>{isActivating ? 'Activating License...' : 'Activate Lab & Create Credentials'}</span>
                <ArrowRight size={18} />
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="w-full py-2.5 px-4 text-slate-500 hover:text-slate-800 text-xs font-bold transition-all text-center cursor-pointer mt-1"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            /* Sign In Form */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* User ID / Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User size={14} className="text-blue-600" />
                  User ID / Username / Email
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="e.g. patelmunaf90@gmail.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-blue-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>Sign In with Credentials</span>
                <ArrowRight size={18} />
              </button>

              {/* License Activation Section */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Newly issued lab license?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('ACTIVATE');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-blue-600 font-extrabold hover:text-blue-850 underline transition-colors focus:outline-none cursor-pointer"
                  >
                    Activate License & Set Password
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Copyright & Support Link Footer */}
          <div className="pt-5 border-t border-slate-100 space-y-1.5 text-center">
            <p className="text-xs font-bold text-slate-700">
              Copyright © Global Software. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              Contact for support:{' '}
              <a
                href="mailto:patelmunaf90@gmail.com"
                className="text-blue-600 font-extrabold hover:text-blue-800 underline transition-colors"
              >
                patelmunaf90@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModalMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="w-full h-full max-w-7xl max-h-[90vh] my-auto rounded-3xl overflow-hidden shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

