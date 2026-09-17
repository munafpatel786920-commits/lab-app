/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Beaker,
  ClipboardList,
  FileText,
  Receipt,
  Calendar,
  Home,
  Package,
  UserSquare2,
  DollarSign,
  PlusCircle,
  Settings,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Globe,
  Bell,
  CheckCircle,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  Building2,
  Lock
} from 'lucide-react';

// Core imports
import {
  Patient,
  TestTemplate,
  TestReport,
  Invoice,
  Appointment,
  HomeCollectionVisit,
  InventoryItem,
  StaffMember,
  Expense,
  UserAccount,
  UserRole,
  LabTenant,
  RolePermissions,
  CountryConfig
} from './types';

// SaaS Data & Initial Seed
import {
  INITIAL_TENANTS,
  DEFAULT_ROLE_PERMISSIONS,
  SUPPORTED_COUNTRIES,
  SUPER_ADMIN_ACCOUNT
} from './data/saasData';

// Mock Seed lists
import {
  DEFAULT_TESTS,
  INITIAL_PATIENTS,
  INITIAL_REPORTS,
  INITIAL_INVOICES,
  INITIAL_APPOINTMENTS,
  INITIAL_HOME_VISITS,
  INITIAL_INVENTORY,
  INITIAL_STAFF,
  INITIAL_EXPENSES,
  TRANSLATIONS
} from './mockData';
import { DEFAULT_USERS } from './data/defaultUsers';

// Component Views
import DashboardView from './components/DashboardView';
import PatientsView from './components/PatientsView';
import TestsCatalogView from './components/TestsCatalogView';
import SampleTrackingView from './components/SampleTrackingView';
import ReportsView from './components/ReportsView';
import BillingView from './components/BillingView';
import AppointmentsView from './components/AppointmentsView';
import HomeCollectionView from './components/HomeCollectionView';
import InventoryView from './components/InventoryView';
import StaffView from './components/StaffView';
import FinanceView from './components/FinanceView';
import RecordExpenseView from './components/RecordExpenseView';
import SettingsView from './components/SettingsView';
import SuperAdminPanelView from './components/SuperAdminPanelView';
import RolePermissionsView from './components/RolePermissionsView';
import LoginModal from './components/LoginModal';

// Firebase Firestore Service
import {
  initFirebaseAuth,
  subscribeCollection,
  saveDocument,
  removeDocument,
  clearDocumentsBatch,
  seedIfEmpty
} from './firebase';

const DEFAULT_LAB_SETTINGS = [
  {
    id: 'default',
    labName: 'Apex Diagnostic & Research Center',
    slogan: 'Precision Diagnostics, Healthy Lives',
    gstin: '24AAAAA0000A1Z5',
    licenseNo: 'MC-2026-66712/DL',
    telephone: '+91 261 2451122',
    address: 'Apex Mansion, Opp. Civil Hospital, Surat, Gujarat',
    logoUrl: null,
    pathologistSignatureUrl: null,
    pathologistName: 'Devangi Shah',
    pathologistDegree: 'M.D. (Pathology) • Reg No: G-14232',
    technicianSignatureUrl: null,
    technicianName: 'Amit Trivedi',
    technicianDegree: 'B.Sc. M.L.T. • Reg No: LT-2026-9912',
    branches: ['Central Lab', 'Ahmedabad', 'Vadodara'],
    countryCode: 'IN',
    tenantId: 'default'
  }
];

export default function App() {
  const [settings, setSettings] = useState<any[]>([]);
  // SaaS Tenants & Multi-Country Config State
  const [tenants, setTenants] = useState<LabTenant[]>(() => {
    try {
      const saved = localStorage.getItem('apex_saas_tenants');
      return saved ? JSON.parse(saved) : INITIAL_TENANTS;
    } catch {
      return INITIAL_TENANTS;
    }
  });

  const [permissions, setPermissions] = useState<RolePermissions[]>(() => {
    try {
      const saved = localStorage.getItem('apex_saas_permissions');
      return saved ? JSON.parse(saved) : DEFAULT_ROLE_PERMISSIONS;
    } catch {
      return DEFAULT_ROLE_PERMISSIONS;
    }
  });

  const [currentCountryCode, setCurrentCountryCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('apex_country_code');
      return saved || 'IN';
    } catch {
      return 'IN';
    }
  });

  const activeCountry = SUPPORTED_COUNTRIES.find(c => c.code === currentCountryCode) || SUPPORTED_COUNTRIES[0];

  const handleAddTenant = async (newTenant: LabTenant) => {
    try {
      await saveDocument('tenants', newTenant.id, newTenant);
    } catch (e) {
      console.error('Failed to save tenant to Firestore:', e);
    }
    const updated = [newTenant, ...tenants];
    setTenants(updated);
    localStorage.setItem('apex_saas_tenants', JSON.stringify(updated));
  };

  const handleUpdateTenant = async (updatedTenant: LabTenant) => {
    try {
      await saveDocument('tenants', updatedTenant.id, updatedTenant);
    } catch (e) {
      console.error('Failed to update tenant in Firestore:', e);
    }
    const updated = tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t);
    setTenants(updated);
    localStorage.setItem('apex_saas_tenants', JSON.stringify(updated));
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      await removeDocument('tenants', tenantId);
    } catch (e) {
      console.error('Failed to delete tenant from Firestore:', e);
    }
    const updated = tenants.filter(t => t.id !== tenantId);
    setTenants(updated);
    localStorage.setItem('apex_saas_tenants', JSON.stringify(updated));
  };

  const handleSavePermissions = (updatedPerms: RolePermissions[]) => {
    setPermissions(updatedPerms);
    localStorage.setItem('apex_saas_permissions', JSON.stringify(updatedPerms));
  };

  const handleUpdateCountryCode = (code: string) => {
    setCurrentCountryCode(code);
    localStorage.setItem('apex_country_code', code);
  };

  // System configurations
  const [currentBranch, setCurrentBranch] = useState('Central Lab');
  const [branches, setBranches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_branches');
      return saved ? JSON.parse(saved) : ['Central Lab', 'Ahmedabad', 'Vadodara'];
    } catch {
      return ['Central Lab', 'Ahmedabad', 'Vadodara'];
    }
  });

  const handleAddBranch = (branch: string) => {
    const newBranches = [...branches, branch];
    setBranches(newBranches);
    localStorage.setItem('apex_branches', JSON.stringify(newBranches));
  };

  const handleDeleteBranch = (branch: string) => {
    const newBranches = branches.filter(b => b !== branch);
    setBranches(newBranches);
    localStorage.setItem('apex_branches', JSON.stringify(newBranches));
    if (currentBranch === branch) {
      setCurrentBranch(newBranches[0] || '');
    }
  };
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('apex_currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('apex_currentUser');
      if (saved) {
        const u = JSON.parse(saved);
        return u.role || 'Admin';
      }
      return 'Admin';
    } catch {
      return 'Admin';
    }
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('apex_theme');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  // Apply theme class to document root
  React.useEffect(() => {
    try {
      localStorage.setItem('apex_theme', isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Theme storage error:', e);
    }
  }, [isDarkMode]);

  // Core reactive data stores connected to Google Firebase Firestore
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [tests, setTests] = useState<TestTemplate[]>(DEFAULT_TESTS);
  const [reports, setReports] = useState<TestReport[]>(INITIAL_REPORTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [homeVisits, setHomeVisits] = useState<HomeCollectionVisit[]>(INITIAL_HOME_VISITS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

  // Isolated local demo mode states (resets on logout / re-login)
  const [demoPatients, setDemoPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [demoTests, setDemoTests] = useState<TestTemplate[]>(DEFAULT_TESTS);
  const [demoReports, setDemoReports] = useState<TestReport[]>(INITIAL_REPORTS);
  const [demoInvoices, setDemoInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [demoAppointments, setDemoAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [demoHomeVisits, setDemoHomeVisits] = useState<HomeCollectionVisit[]>(INITIAL_HOME_VISITS);
  const [demoInventory, setDemoInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [demoStaff, setDemoStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [demoExpenses, setDemoExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

  const resetDemoData = () => {
    setDemoPatients([...INITIAL_PATIENTS]);
    setDemoTests([...DEFAULT_TESTS]);
    setDemoReports([...INITIAL_REPORTS]);
    setDemoInvoices([...INITIAL_INVOICES]);
    setDemoAppointments([...INITIAL_APPOINTMENTS]);
    setDemoHomeVisits([...INITIAL_HOME_VISITS]);
    setDemoInventory([...INITIAL_INVENTORY]);
    setDemoStaff([...INITIAL_STAFF]);
    setDemoExpenses([...INITIAL_EXPENSES]);
  };

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Initialize Firebase and set up real-time collection listeners
  React.useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function initFirebaseStore() {
      try {
        await initFirebaseAuth();

        // Seed initial data to Firestore if collection is empty
        await seedIfEmpty('users', DEFAULT_USERS, 'id');
        await seedIfEmpty('patients', INITIAL_PATIENTS, 'id');
        await seedIfEmpty('tests', DEFAULT_TESTS, 'id');
        await seedIfEmpty('reports', INITIAL_REPORTS, 'reportNo');
        await seedIfEmpty('invoices', INITIAL_INVOICES, 'invoiceNo');
        await seedIfEmpty('appointments', INITIAL_APPOINTMENTS, 'id');
        await seedIfEmpty('homeVisits', INITIAL_HOME_VISITS, 'id');
        await seedIfEmpty('inventory', INITIAL_INVENTORY, 'id');
        await seedIfEmpty('staff', INITIAL_STAFF, 'id');
        await seedIfEmpty('expenses', INITIAL_EXPENSES, 'id');
        await seedIfEmpty('settings', DEFAULT_LAB_SETTINGS, 'id');
        await seedIfEmpty('tenants', INITIAL_TENANTS, 'id');

        setIsFirebaseConnected(true);

        // Subscribe to Firestore collections in real-time after auth is established
        unsubs.push(subscribeCollection<UserAccount>('users', (data) => setUsers(data.length ? data : DEFAULT_USERS)));
        unsubs.push(subscribeCollection<Patient>('patients', (data) => setPatients(data.length ? data : INITIAL_PATIENTS)));
        unsubs.push(subscribeCollection<TestTemplate>('tests', (data) => setTests(data.length ? data : DEFAULT_TESTS)));
        unsubs.push(subscribeCollection<TestReport>('reports', (data) => setReports(data.length ? data : INITIAL_REPORTS)));
        unsubs.push(subscribeCollection<Invoice>('invoices', (data) => setInvoices(data.length ? data : INITIAL_INVOICES)));
        unsubs.push(subscribeCollection<Appointment>('appointments', (data) => setAppointments(data.length ? data : INITIAL_APPOINTMENTS)));
        unsubs.push(subscribeCollection<HomeCollectionVisit>('homeVisits', (data) => setHomeVisits(data.length ? data : INITIAL_HOME_VISITS)));
        unsubs.push(subscribeCollection<InventoryItem>('inventory', (data) => setInventory(data.length ? data : INITIAL_INVENTORY)));
        unsubs.push(subscribeCollection<StaffMember>('staff', (data) => setStaff(data.length ? data : INITIAL_STAFF)));
        unsubs.push(subscribeCollection<Expense>('expenses', (data) => setExpenses(data.length ? data : INITIAL_EXPENSES)));
        unsubs.push(subscribeCollection<any>('settings', (data) => setSettings(data.length ? data : DEFAULT_LAB_SETTINGS)));
        unsubs.push(subscribeCollection<LabTenant>('tenants', (data) => setTenants(data.length ? data : INITIAL_TENANTS)));
      } catch (err) {
        console.warn('Error setting up Firebase store:', err);
      }
    }

    initFirebaseStore();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  const handleClearAllData = async (adminId: string, adminPass: string): Promise<{ success: boolean; error?: string }> => {
    const inputIdClean = adminId.trim().toLowerCase();
    const inputPassClean = adminPass.trim();

    // 1. Check Super Admin hardcoded match
    const isSuperAdminMatch =
      (inputIdClean === 'superadmin' ||
       inputIdClean === 'patelmunaf90@gmail.com' ||
       inputIdClean === 'munafpatel786920@gmail.com' ||
       inputIdClean === 'munaf' ||
       inputIdClean === SUPER_ADMIN_ACCOUNT.username.toLowerCase() ||
       inputIdClean === (SUPER_ADMIN_ACCOUNT.email || '').toLowerCase()) &&
      (inputPassClean === 'munaf786' ||
       inputPassClean === 'superpassword123' ||
       inputPassClean === SUPER_ADMIN_ACCOUNT.password);

    // 2. Check tenant admin accounts
    const matchedTenantAdmin = tenants.find(
      t =>
        ((t.adminUsername && t.adminUsername.toLowerCase() === inputIdClean) ||
         (t.email && t.email.toLowerCase() === inputIdClean)) &&
        t.adminPassword === inputPassClean
    );

    // 3. Check registered users list or DEFAULT_USERS fallback
    const activeUsersList = users.length > 0 ? users : DEFAULT_USERS;
    const matchedStandardAdmin = activeUsersList.find(
      u =>
        (u.username.toLowerCase() === inputIdClean ||
         (u.email && u.email.toLowerCase() === inputIdClean)) &&
        u.password === inputPassClean &&
        (u.role === 'Admin' || u.role === 'SuperAdmin')
    );

    // 4. Check currently logged in user
    const isCurrentUserMatched =
      currentUser &&
      (currentUser.username.toLowerCase() === inputIdClean ||
       (currentUser.email && currentUser.email.toLowerCase() === inputIdClean)) &&
      currentUser.password === inputPassClean &&
      (currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin');

    const isValidAdmin = isSuperAdminMatch || !!matchedTenantAdmin || !!matchedStandardAdmin || !!isCurrentUserMatched;

    if (!isValidAdmin) {
      return { success: false, error: "अमान्य क्रेडेंशियल! कृपया सही Admin ID और Password दर्ज करें।" };
    }

    // Determine target datasets to clear based on role
    // If SuperAdmin, clear global collections. If standard tenant admin, only clear their own tenant's records.
    const isGlobalSuperAdmin = isSuperAdminMatch || (currentUser && currentUser.role === 'SuperAdmin');
    const targetPatients = isGlobalSuperAdmin ? patients : tenantPatients;
    const targetReports = isGlobalSuperAdmin ? reports : tenantReports;
    const targetInvoices = isGlobalSuperAdmin ? invoices : tenantInvoices;
    const targetAppointments = isGlobalSuperAdmin ? appointments : tenantAppointments;
    const targetHomeVisits = isGlobalSuperAdmin ? homeVisits : tenantHomeVisits;
    const targetExpenses = isGlobalSuperAdmin ? expenses : tenantExpenses;

    // Prepare robust list of items to delete
    const itemsToDelete: { collectionName: string; id: string }[] = [];
    
    targetPatients.forEach(p => { if (p && p.id) itemsToDelete.push({ collectionName: 'patients', id: p.id }); });
    targetReports.forEach(r => { if (r && r.reportNo) itemsToDelete.push({ collectionName: 'reports', id: r.reportNo }); });
    targetInvoices.forEach(i => { if (i && i.invoiceNo) itemsToDelete.push({ collectionName: 'invoices', id: i.invoiceNo }); });
    targetAppointments.forEach(a => { if (a && a.id) itemsToDelete.push({ collectionName: 'appointments', id: a.id }); });
    targetHomeVisits.forEach(v => { if (v && v.id) itemsToDelete.push({ collectionName: 'homeVisits', id: v.id }); });
    targetExpenses.forEach(e => { if (e && e.id) itemsToDelete.push({ collectionName: 'expenses', id: e.id }); });

    try {
      if (itemsToDelete.length > 0) {
        await clearDocumentsBatch(itemsToDelete);
      }
      return { success: true };
    } catch (err: any) {
      console.error('Failed to clear Firebase documents during Master Reset:', err);
      return { success: false, error: "डेटा हटाने में विफलता: " + (err.message || err) };
    }
  };

  const handleRestoreData = async (backupData: any) => {
    if (!backupData || typeof backupData !== 'object') {
      return { success: false, error: "कोई डेटा नहीं मिला या फ़ाइल प्रारूप अमान्य है!" };
    }

    // Deep clean object helper to remove undefined values since Firestore throws on undefined
    const cleanForFirestore = (obj: any): any => {
      if (obj === null || obj === undefined) return null;
      if (Array.isArray(obj)) {
        return obj.map(cleanForFirestore);
      }
      if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const val = obj[key];
            if (val !== undefined) {
              cleaned[key] = cleanForFirestore(val);
            }
          }
        }
        return cleaned;
      }
      return obj;
    };

    try {
      const activeTenantId = currentUser?.tenantId || 'default';
      const promises: Promise<void>[] = [];

      // Helper to find key in backupData (case-insensitive and plural/singular)
      const findDataArray = (keys: string[]): any[] => {
        for (const k of keys) {
          // exact check
          if (Array.isArray(backupData[k])) return backupData[k];
          // lower case check
          const lowerK = k.toLowerCase();
          for (const realKey of Object.keys(backupData)) {
            const realLower = realKey.toLowerCase();
            if (realLower === lowerK || realLower === lowerK + 's' || realLower + 's' === lowerK) {
              if (Array.isArray(backupData[realKey])) {
                return backupData[realKey];
              }
            }
          }
        }
        return [];
      };

      // Support flat array backup (if user uploads a direct list of patients/records)
      let patientsList = findDataArray(['patients', 'patient', 'patientList']);
      let reportsList = findDataArray(['reports', 'report', 'testReports', 'clinicalReports']);
      let invoicesList = findDataArray(['invoices', 'invoice', 'billing', 'bills']);
      let appointmentsList = findDataArray(['appointments', 'appointment', 'booking']);
      let homeVisitsList = findDataArray(['homeVisits', 'homeVisit', 'homeCollection']);
      let inventoryList = findDataArray(['inventory', 'inventoryItem', 'stock']);
      let expensesList = findDataArray(['expenses', 'expense', 'outflow']);
      const settingsObj = backupData.settings || backupData.labSettings || backupData.branding || null;

      if (Array.isArray(backupData) && backupData.length > 0) {
        // If it's a flat array at the root, analyze the first item to categorize it
        const first = backupData[0];
        if (first && typeof first === 'object') {
          if ('reportNo' in first || 'testName' in first) {
            reportsList = backupData;
          } else if ('invoiceNo' in first || 'billAmount' in first) {
            invoicesList = backupData;
          } else if ('timeSlot' in first || 'appointmentDate' in first) {
            appointmentsList = backupData;
          } else if ('itemName' in first || 'minStock' in first) {
            inventoryList = backupData;
          } else if ('amount' in first && 'category' in first && !('reportNo' in first)) {
            expensesList = backupData;
          } else {
            // default to patients
            patientsList = backupData;
          }
        }
      }

      // Restore activeSettings / Lab settings if present
      if (settingsObj && typeof settingsObj === 'object') {
        const settingsToSave = cleanForFirestore({
          ...settingsObj,
          tenantId: activeTenantId,
          id: activeTenantId
        });
        promises.push(Promise.resolve(saveDocument('settings', activeTenantId, settingsToSave)));
      }

      // Restore patients
      patientsList.forEach((p: any, idx: number) => {
        if (p && typeof p === 'object') {
          const id = p.id || p.patientId || `PAT-${Date.now()}-${idx}-${Math.floor(1000 + Math.random() * 9000)}`;
          const pToSave = cleanForFirestore({
            ...p,
            id,
            tenantId: activeTenantId
          });
          promises.push(saveDocument('patients', id, pToSave));
        }
      });

      // Restore reports
      reportsList.forEach((r: any, idx: number) => {
        if (r && typeof r === 'object') {
          const reportNo = r.reportNo || r.reportId || `REP-2026-${String(idx + 1).padStart(4, '0')}-${Math.floor(100 + Math.random() * 900)}`;
          const rToSave = cleanForFirestore({
            ...r,
            reportNo,
            tenantId: activeTenantId
          });
          promises.push(saveDocument('reports', reportNo, rToSave));
        }
      });

      // Restore invoices
      invoicesList.forEach((i: any, idx: number) => {
        if (i && typeof i === 'object') {
          const invoiceNo = i.invoiceNo || i.invoiceId || `INV-2026-${String(idx + 1).padStart(4, '0')}-${Math.floor(100 + Math.random() * 900)}`;
          const iToSave = cleanForFirestore({
            ...i,
            invoiceNo,
            tenantId: activeTenantId
          });
          promises.push(saveDocument('invoices', invoiceNo, iToSave));
        }
      });

      // Restore appointments
      appointmentsList.forEach((a: any, idx: number) => {
        if (a && typeof a === 'object') {
          const id = a.id || a.appointmentId || `APT-${Date.now()}-${idx}-${Math.floor(100 + Math.random() * 900)}`;
          const aToSave = cleanForFirestore({
            ...a,
            id,
            tenantId: activeTenantId
          });
          promises.push(saveDocument('appointments', id, aToSave));
        }
      });

      // Restore homeVisits
      homeVisitsList.forEach((v: any, idx: number) => {
        if (v && typeof v === 'object') {
          const id = v.id || v.visitId || `VIS-${Date.now()}-${idx}-${Math.floor(100 + Math.random() * 900)}`;
          const vToSave = cleanForFirestore({
            ...v,
            id,
            tenantId: activeTenantId
          });
          promises.push(saveDocument('homeVisits', id, vToSave));
        }
      });

      // Restore inventory
      inventoryList.forEach((item: any, idx: number) => {
        if (item && typeof item === 'object') {
          const id = item.id || `INV-ITEM-${Date.now()}-${idx}-${Math.floor(100 + Math.random() * 900)}`;
          const itemToSave = cleanForFirestore({
            ...item,
            id,
            tenantId: activeTenantId
          });
          promises.push(saveDocument('inventory', id, itemToSave));
        }
      });

      // Restore expenses
      expensesList.forEach((e: any, idx: number) => {
        if (e && typeof e === 'object') {
          const id = e.id || `EXP-${Date.now()}-${idx}-${Math.floor(100 + Math.random() * 900)}`;
          const eToSave = cleanForFirestore({
            ...e,
            id,
            tenantId: activeTenantId
          });
          promises.push(saveDocument('expenses', id, eToSave));
        }
      });

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Failed to restore clinical data from JSON:', err);
      return { success: false, error: err.message || 'फाइल रिस्टोर करने में त्रुटि आई।' };
    }
  };

  // Sync config options to localStorage (ui preference only)
  React.useEffect(() => {
    try {
      localStorage.setItem('apex_currentBranch', currentBranch);
    } catch (e) {
      console.warn(e);
    }
  }, [currentBranch]);

  React.useEffect(() => {
    try {
      localStorage.setItem('apex_currentRole', currentRole);
    } catch (e) {
      console.warn(e);
    }
  }, [currentRole]);

  // Active Dictionary translation helper - Default to English
  const t = TRANSLATIONS['en'];

  // Active Tenant ID & details
  const activeTenantId = currentUser?.tenantId;

  const currentTenantObj = useMemo(() => {
    if (!activeTenantId) return null;
    return tenants.find(t => t.id === activeTenantId);
  }, [tenants, activeTenantId]);

  const activeSettings = useMemo(() => {
    const tenantId = activeTenantId || 'default';
    const found = settings.find(s => s.id === tenantId);
    return found || DEFAULT_LAB_SETTINGS[0];
  }, [settings, activeTenantId]);

  // Sync activeSettings values to localStorage so synchronous legacy code continues to function correctly
  React.useEffect(() => {
    if (activeSettings) {
      try {
        localStorage.setItem('apex_labLogo', activeSettings.logoUrl || '');
        localStorage.setItem('apex_pathologistSignature', activeSettings.pathologistSignatureUrl || '');
        localStorage.setItem('apex_pathologistName', activeSettings.pathologistName || 'Devangi Shah');
        localStorage.setItem('apex_pathologistDegree', activeSettings.pathologistDegree || 'M.D. (Pathology) • Reg No: G-14232');
        localStorage.setItem('apex_technicianSignature', activeSettings.technicianSignatureUrl || '');
        localStorage.setItem('apex_technicianName', activeSettings.technicianName || 'Amit Trivedi');
        localStorage.setItem('apex_technicianDegree', activeSettings.technicianDegree || 'B.Sc. M.L.T. • Reg No: LT-2026-9912');
        if (activeSettings.countryCode) {
          localStorage.setItem('apex_country_code', activeSettings.countryCode);
          if (activeSettings.countryCode !== currentCountryCode) {
            setCurrentCountryCode(activeSettings.countryCode);
          }
        }
        if (activeSettings.branches) {
          localStorage.setItem('apex_branches', JSON.stringify(activeSettings.branches));
          setBranches(activeSettings.branches);
        }
      } catch (e) {
        console.warn('LocalStorage settings synchronization error:', e);
      }
    }
  }, [activeSettings]);

  const handleSaveSettings = async (updatedSettings: any) => {
    try {
      const tenantId = activeTenantId || 'default';
      await saveDocument('settings', tenantId, {
        ...updatedSettings,
        id: tenantId,
        tenantId: tenantId
      });
    } catch (e) {
      console.error('Failed to save settings to Firestore:', e);
    }
  };

  const currentBrandTitle = useMemo(() => {
    if (currentRole === 'SuperAdmin') return 'Global SaaS Admin';
    if (activeSettings?.labName) return activeSettings.labName;
    if (currentTenantObj) return currentTenantObj.labName;
    if (currentUser?.name && currentUser.name.includes('(Admin)')) {
      return currentUser.name.replace(' (Admin)', '');
    }
    return 'Apex Diagnostics';
  }, [currentRole, currentTenantObj, currentUser, activeSettings]);

  // Derived tenant-scoped datasets:
  // When a demo user logs in, populate with rich sample data so demo is never blank.
  // When an actual tenant user logs in, filter data by activeTenantId.
  const tenantPatients = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) return demoPatients;
    if (activeTenantId) {
      return patients.filter(p => p.tenantId === activeTenantId);
    }
    return patients.filter(p => !p.tenantId || p.tenantId === 'default');
  }, [patients, activeTenantId, currentUser, demoPatients]);

  const tenantReports = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) return demoReports;
    if (activeTenantId) {
      return reports.filter(r => r.tenantId === activeTenantId);
    }
    return reports.filter(r => !r.tenantId || r.tenantId === 'default');
  }, [reports, activeTenantId, currentUser, demoReports]);

  const tenantInvoices = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) return demoInvoices;
    if (activeTenantId) {
      return invoices.filter(i => i.tenantId === activeTenantId);
    }
    return invoices.filter(i => !i.tenantId || i.tenantId === 'default');
  }, [invoices, activeTenantId, currentUser, demoInvoices]);

  const tenantAppointments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) return demoAppointments;
    if (activeTenantId) {
      return appointments.filter(a => a.tenantId === activeTenantId);
    }
    return appointments.filter(a => !a.tenantId || a.tenantId === 'default');
  }, [appointments, activeTenantId, currentUser, demoAppointments]);

  const tenantHomeVisits = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) return demoHomeVisits;
    if (activeTenantId) {
      return homeVisits.filter(h => h.tenantId === activeTenantId);
    }
    return homeVisits.filter(h => !h.tenantId || h.tenantId === 'default');
  }, [homeVisits, activeTenantId, currentUser, demoHomeVisits]);

  const tenantInventory = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) return demoInventory;
    if (activeTenantId) {
      return inventory.filter(i => i.tenantId === activeTenantId);
    }
    return inventory.filter(i => !i.tenantId || i.tenantId === 'default');
  }, [inventory, activeTenantId, currentUser, demoInventory]);

  const tenantStaff = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) return demoStaff;
    if (activeTenantId) {
      return staff.filter(s => s.tenantId === activeTenantId);
    }
    return staff.filter(s => !s.tenantId || s.tenantId === 'default');
  }, [staff, activeTenantId, currentUser, demoStaff]);

  const tenantExpenses = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) return demoExpenses;
    if (activeTenantId) {
      return expenses.filter(e => e.tenantId === activeTenantId);
    }
    return expenses.filter(e => !e.tenantId || e.tenantId === 'default');
  }, [expenses, activeTenantId, currentUser, demoExpenses]);

  const tenantTests = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.isDemo) return demoTests;
    if (activeTenantId) {
      return tests.filter(t => !t.tenantId || t.tenantId === activeTenantId);
    }
    return tests;
  }, [tests, activeTenantId, currentUser, demoTests]);

  // Callback logic - Patient directory (Saves directly to Firebase Firestore or Demo State)
  const handleAddPatient = async (newPatient: Patient, assignedTestId?: string) => {
    if (currentUser?.isDemo) {
      const patientToSave = { ...newPatient, tenantId: 'TNT-DEMO-PREVIEW' };
      setDemoPatients(prev => [patientToSave, ...prev]);

      if (assignedTestId) {
        const matchedTest = demoTests.find(t => t.id === assignedTestId);
        if (matchedTest) {
          const globalPathologistName = localStorage.getItem('apex_pathologistName') || 'Dr. Devangi Shah (MD Pathology)';
          const newReport: TestReport = {
            reportNo: `REP-2026-${String(demoReports.length + 1).padStart(4, '0')}`,
            patientId: patientToSave.id,
            patientName: patientToSave.name,
            patientAge: patientToSave.age,
            patientGender: patientToSave.gender,
            doctorRef: patientToSave.doctorRef || 'Self Reference',
            testId: matchedTest.id,
            testName: matchedTest.name,
            category: matchedTest.category || 'Biochemistry',
            sampleType: matchedTest.sampleType || 'Serum',
            barcode: `BAR-${Math.floor(10000000 + Math.random() * 90000000)}`,
            status: 'Processing',
            sampleStatus: 'Collected',
            technicianVerified: false,
            pathologistVerified: false,
            technicianName: 'Amit Trivedi',
            pathologistName: globalPathologistName,
            parameters: matchedTest.parameters?.map(p => ({
              name: p.name,
              value: '',
              unit: p.unit,
              referenceRange: p.generalRange,
              status: 'Normal'
            })) || [],
            doctorRemarks: '',
            collectedDate: patientToSave.sampleCollectionDate || '2026-07-18',
            tenantId: 'TNT-DEMO-PREVIEW'
          };
          setDemoReports(prev => [newReport, ...prev]);
        }
      }
      return;
    }

    const patientToSave = activeTenantId ? { ...newPatient, tenantId: activeTenantId } : newPatient;
    await saveDocument('patients', patientToSave.id, patientToSave);

    if (assignedTestId) {
      const matchedTest = tenantTests.find(t => t.id === assignedTestId);
      if (matchedTest) {
        const globalPathologistName = localStorage.getItem('apex_pathologistName') || 'Dr. Devangi Shah (MD Pathology)';
        const newReport: TestReport = {
          reportNo: `REP-2026-${String(reports.length + 1).padStart(4, '0')}`,
          patientId: patientToSave.id,
          patientName: patientToSave.name,
          patientAge: patientToSave.age,
          patientGender: patientToSave.gender,
          doctorRef: patientToSave.doctorRef || 'Self Reference',
          testId: matchedTest.id,
          testName: matchedTest.name,
          category: matchedTest.category || 'Biochemistry',
          sampleType: matchedTest.sampleType || 'Serum',
          barcode: `BAR-${Math.floor(10000000 + Math.random() * 90000000)}`,
          status: 'Processing',
          sampleStatus: 'Collected',
          technicianVerified: false,
          pathologistVerified: false,
          technicianName: 'Amit Trivedi',
          pathologistName: globalPathologistName,
          parameters: matchedTest.parameters?.map(p => ({
            name: p.name,
            value: '',
            unit: p.unit,
            referenceRange: p.generalRange,
            status: 'Normal'
          })) || [],
          doctorRemarks: '',
          collectedDate: patientToSave.sampleCollectionDate || '2026-07-18',
          ...(activeTenantId ? { tenantId: activeTenantId } : {})
        };
        await saveDocument('reports', newReport.reportNo, newReport);
      }
    }
  };

  const handleCreateReportForPatient = async (patientId: string, testId: string, sampleCollectionDate?: string, doctorRef?: string) => {
    if (currentUser?.isDemo) {
      const patient = demoPatients.find(p => p.id === patientId);
      const matchedTest = demoTests.find(t => t.id === testId);
      if (patient && matchedTest) {
        const globalPathologistName = localStorage.getItem('apex_pathologistName') || 'Dr. Devangi Shah (MD Pathology)';
        const newReport: TestReport = {
          reportNo: `REP-2026-${String(demoReports.length + 1).padStart(4, '0')}`,
          patientId: patient.id,
          patientName: patient.name,
          patientAge: patient.age,
          patientGender: patient.gender,
          doctorRef: doctorRef || patient.doctorRef || 'Self Reference',
          testId: matchedTest.id,
          testName: matchedTest.name,
          category: matchedTest.category || 'Biochemistry',
          sampleType: matchedTest.sampleType || 'Serum',
          barcode: `BAR-${Math.floor(10000000 + Math.random() * 90000000)}`,
          status: 'Processing',
          sampleStatus: 'Collected',
          technicianVerified: false,
          pathologistVerified: false,
          technicianName: 'Amit Trivedi',
          pathologistName: globalPathologistName,
          parameters: matchedTest.parameters?.map(p => ({
            name: p.name,
            value: '',
            unit: p.unit,
            referenceRange: p.generalRange,
            status: 'Normal'
          })) || [],
          doctorRemarks: '',
          collectedDate: sampleCollectionDate || new Date().toISOString().split('T')[0],
          tenantId: 'TNT-DEMO-PREVIEW'
        };
        setDemoReports(prev => [newReport, ...prev]);
      }
      return;
    }

    const patient = tenantPatients.find(p => p.id === patientId);
    const matchedTest = tenantTests.find(t => t.id === testId);
    if (patient && matchedTest) {
      const globalPathologistName = localStorage.getItem('apex_pathologistName') || 'Dr. Devangi Shah (MD Pathology)';
      const newReport: TestReport = {
        reportNo: `REP-2026-${String(reports.length + 1).padStart(4, '0')}`,
        patientId: patient.id,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        doctorRef: doctorRef || patient.doctorRef || 'Self Reference',
        testId: matchedTest.id,
        testName: matchedTest.name,
        category: matchedTest.category || 'Biochemistry',
        sampleType: matchedTest.sampleType || 'Serum',
        barcode: `BAR-${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'Processing',
        sampleStatus: 'Collected',
        technicianVerified: false,
        pathologistVerified: false,
        technicianName: 'Amit Trivedi',
        pathologistName: globalPathologistName,
        parameters: matchedTest.parameters?.map(p => ({
          name: p.name,
          value: '',
          unit: p.unit,
          referenceRange: p.generalRange,
          status: 'Normal'
        })) || [],
        doctorRemarks: '',
        collectedDate: sampleCollectionDate || new Date().toISOString().split('T')[0],
        ...(activeTenantId ? { tenantId: activeTenantId } : {})
      };
      await saveDocument('reports', newReport.reportNo, newReport);
    }
  };

  const handleUpdatePatient = async (updated: Patient) => {
    if (currentUser?.isDemo) {
      setDemoPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
      return;
    }
    const patientToSave = activeTenantId ? { ...updated, tenantId: activeTenantId } : updated;
    await saveDocument('patients', patientToSave.id, patientToSave);
  };

  const handleDeletePatient = async (id: string) => {
    if (currentUser?.isDemo) {
      setDemoPatients(prev => prev.filter(p => p.id !== id));
      setDemoReports(prev => prev.filter(r => r.patientId !== id));
      return;
    }
    await removeDocument('patients', id);
    const relatedReports = reports.filter(r => r.patientId === id);
    await Promise.all(relatedReports.map(r => removeDocument('reports', r.reportNo)));
  };

  // Callback logic - Test catalogue
  const handleAddTestTemplate = async (newTest: TestTemplate) => {
    if (currentUser?.isDemo) {
      setDemoTests(prev => [newTest, ...prev]);
      return;
    }
    const testToSave = activeTenantId ? { ...newTest, tenantId: activeTenantId } : newTest;
    await saveDocument('tests', testToSave.id, testToSave);
  };

  const handleDeleteTestTemplate = async (id: string) => {
    if (currentUser?.isDemo) {
      setDemoTests(prev => prev.filter(t => t.id !== id));
      return;
    }
    await removeDocument('tests', id);
  };

  // Callback logic - Sample collection tracking
  const handleUpdateReportStatus = async (reportNo: string, sampleStatus: 'Collected' | 'Completed' | 'Processing' | 'Rejected', technicianName?: string, technicianVerified?: boolean) => {
    if (currentUser?.isDemo) {
      setDemoReports(prev => prev.map(r => r.reportNo === reportNo ? {
        ...r,
        sampleStatus,
        technicianName: technicianName || r.technicianName,
        ...(technicianVerified !== undefined ? { technicianVerified } : {})
      } : r));
      return;
    }
    const target = reports.find(r => r.reportNo === reportNo);
    if (target) {
      const updateData: any = {
        ...target,
        sampleStatus,
        technicianName: technicianName || target.technicianName,
        ...(technicianVerified !== undefined ? { technicianVerified } : {})
      };

      // Ensure no undefined values are passed to Firestore
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      await saveDocument('reports', reportNo, updateData);
    }
  };

  // Callback logic - Reports editor
  const handleSaveReportResults = async (reportNo: string, params: any[], doctorRemarks: string, pathologistName: string, status: 'Completed' | 'Processing') => {
    if (currentUser?.isDemo) {
      setDemoReports(prev => prev.map(r => r.reportNo === reportNo ? {
        ...r,
        parameters: params,
        doctorRemarks,
        pathologistName,
        status,
        pathologistVerified: status === 'Completed',
        ...(status === 'Completed' ? { completedDate: '2026-07-18' } : {})
      } : r));
      return;
    }
    const target = reports.find(r => r.reportNo === reportNo);
    if (target) {
      const updateData: any = {
        ...target,
        parameters: params,
        doctorRemarks,
        pathologistName,
        status,
        pathologistVerified: status === 'Completed',
      };
      
      // Ensure no undefined values are passed to Firestore
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      if (status === 'Completed') {
        updateData.completedDate = '2026-07-18';
      } else {
        delete updateData.completedDate;
      }
      await saveDocument('reports', reportNo, updateData);
    }
  };

  const handleSaveAiSummary = async (reportNo: string, aiSummary: string) => {
    if (currentUser?.isDemo) {
      setDemoReports(prev => prev.map(r => r.reportNo === reportNo ? { ...r, aiSummary } : r));
      return;
    }
    const target = reports.find(r => r.reportNo === reportNo);
    if (target) {
      await saveDocument('reports', reportNo, {
        ...target,
        aiSummary
      });
    }
  };

  // Callback logic - Financial invoicing (receives bill and saves to Firebase or Demo State)
  const handleAddInvoice = async (inv: Invoice) => {
    if (currentUser?.isDemo) {
      setDemoInvoices(prev => [inv, ...prev]);
      return;
    }
    const invoiceToSave = activeTenantId ? { ...inv, tenantId: activeTenantId } : inv;
    await saveDocument('invoices', invoiceToSave.invoiceNo, invoiceToSave);
  };

  // Callback logic - Appointment scheduler
  const handleBookAppointment = async (apt: Appointment) => {
    if (currentUser?.isDemo) {
      setDemoAppointments(prev => [apt, ...prev]);
      if (apt.homeCollection) {
        const newVisit: HomeCollectionVisit = {
          id: `VISIT-2026-${String(demoHomeVisits.length + 1).padStart(4, '0')}`,
          appointmentId: apt.id,
          patientName: apt.patientName,
          address: apt.address || 'Registered Residential Address',
          mobile: apt.mobile,
          assignedStaffName: apt.assignedStaffName || 'Haresh Solanki',
          status: 'Pending',
          locationCoordinates: 'Lat: 21.1702, Lng: 72.8311 (Surat Central)',
          scheduledTime: '02:00 PM',
          tenantId: 'TNT-DEMO-PREVIEW'
        };
        setDemoHomeVisits(prev => [newVisit, ...prev]);
      }
      return;
    }
    const aptToSave = activeTenantId ? { ...apt, tenantId: activeTenantId } : apt;
    await saveDocument('appointments', aptToSave.id, aptToSave);

    // If home collection requested, spin up a field technician visit ticket
    if (apt.homeCollection) {
      const newVisit: HomeCollectionVisit = {
        id: `VISIT-2026-${String(homeVisits.length + 1).padStart(4, '0')}`,
        appointmentId: apt.id,
        patientName: apt.patientName,
        address: apt.address || 'Registered Residential Address',
        mobile: apt.mobile,
        assignedStaffName: apt.assignedStaffName || 'Haresh Solanki',
        status: 'Pending',
        locationCoordinates: 'Lat: 21.1702, Lng: 72.8311 (Surat Central)',
        scheduledTime: '02:00 PM',
        ...(activeTenantId ? { tenantId: activeTenantId } : {})
      };
      await saveDocument('homeVisits', newVisit.id, newVisit);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: 'Booked' | 'Completed' | 'Cancelled') => {
    if (currentUser?.isDemo) {
      setDemoAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      return;
    }
    const target = appointments.find(a => a.id === id);
    if (target) {
      await saveDocument('appointments', id, { ...target, status });
    }
  };

  // Callback logic - Field specimen visit
  const handleUpdateVisitStatus = async (id: string, status: 'Pending' | 'On the Way' | 'Collected' | 'Completed') => {
    if (currentUser?.isDemo) {
      setDemoHomeVisits(prev => prev.map(v => v.id === id ? { ...v, status } : v));
      return;
    }
    const target = homeVisits.find(v => v.id === id);
    if (target) {
      await saveDocument('homeVisits', id, { ...target, status });
    }
  };

  const handleAssignStaffToVisit = async (id: string, staffName: string) => {
    if (currentUser?.isDemo) {
      setDemoHomeVisits(prev => prev.map(v => v.id === id ? { ...v, assignedStaffName: staffName } : v));
      return;
    }
    const target = homeVisits.find(v => v.id === id);
    if (target) {
      await saveDocument('homeVisits', id, { ...target, assignedStaffName: staffName });
    }
  };

  // Callback logic - Warehouse stock
  const handleAddInventoryItem = async (item: InventoryItem) => {
    if (currentUser?.isDemo) {
      setDemoInventory(prev => [item, ...prev]);
      return;
    }
    const itemToSave = activeTenantId ? { ...item, tenantId: activeTenantId } : item;
    await saveDocument('inventory', itemToSave.id, itemToSave);
  };

  const handleUpdateStock = async (id: string, qty: number) => {
    if (currentUser?.isDemo) {
      setDemoInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
      return;
    }
    const target = inventory.find(i => i.id === id);
    if (target) {
      await saveDocument('inventory', id, { ...target, quantity: qty });
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    if (currentUser?.isDemo) {
      setDemoInventory(prev => prev.filter(i => i.id !== id));
      return;
    }
    await removeDocument('inventory', id);
  };

  // Callback logic - Team rosters attendance salary
  const handleUpdateAttendance = async (id: string, isPresent: boolean) => {
    if (currentUser?.isDemo) {
      setDemoStaff(prev => prev.map(s => s.id === id ? { ...s, isPresentToday: isPresent } : s));
      return;
    }
    const target = staff.find(s => s.id === id);
    if (target) {
      await saveDocument('staff', id, { ...target, isPresentToday: isPresent });
    }
  };

  const handleDisburseSalary = async (id: string) => {
    if (currentUser?.isDemo) {
      setDemoStaff(prev => prev.map(s => s.id === id ? { ...s, salaryPaidThisMonth: true } : s));
      return;
    }
    const target = staff.find(s => s.id === id);
    if (target) {
      await saveDocument('staff', id, { ...target, salaryPaidThisMonth: true });
    }
  };

  // Callback logic - Expenses ledger
  const handleAddExpense = async (exp: Expense) => {
    if (currentUser?.isDemo) {
      setDemoExpenses(prev => [exp, ...prev]);
      return;
    }
    const expToSave = activeTenantId ? { ...exp, tenantId: activeTenantId } : exp;
    await saveDocument('expenses', expToSave.id, expToSave);
  };

  const handleDeleteExpense = async (id: string) => {
    if (currentUser?.isDemo) {
      setDemoExpenses(prev => prev.filter(e => e.id !== id));
      return;
    }
    await removeDocument('expenses', id);
  };

  // Add new user account to Firebase Firestore users collection
  const handleAddUser = async (user: UserAccount) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = user;
        return copy;
      }
      return [user, ...prev];
    });
    await saveDocument('users', user.id, user);
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    await removeDocument('users', userId);
  };

  // Authentication login and logout handling
  const handleLogin = (user: UserAccount) => {
    if (user.isDemo) {
      resetDemoData();
    }
    setCurrentUser(user);
    setCurrentRole(user.role);
    try {
      localStorage.setItem('apex_currentUser', JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage error saving currentUser:', e);
    }
    setShowLoginModal(false);

    // Auto navigate to appropriate default view for the role
    if (user.role === 'SuperAdmin') {
      setCurrentView('super-admin');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    resetDemoData();
    setCurrentUser(null);
    try {
      localStorage.removeItem('apex_currentUser');
    } catch (e) {
      console.warn('LocalStorage error removing currentUser:', e);
    }
    setShowLoginModal(true);
  };

  // Dynamic Role Permissions Access Checker
  const isViewAllowed = (view: string) => {
    if (!currentUser) return false;
    if (currentRole === 'SuperAdmin') {
      return view === 'super-admin';
    }
    if (currentRole === 'Admin') {
      return true; // Admin has complete access to all views
    }
    // Check dynamic configurable Role Permissions matrix
    const rolePerm = permissions.find(p => p.role === currentRole);
    if (rolePerm) {
      return rolePerm.allowedViews.includes(view);
    }
    return false;
  };

  // Navigation click routing helper
  const handleNavigationRoute = (tab: string) => {
    if (isViewAllowed(tab)) {
      setCurrentView(tab);
      setIsMobileMenuOpen(false);
    } else {
      alert(`Role Restriction: Access to tab "${tab}" is disabled for '${currentRole}'. The Admin can configure view permissions inside Settings -> Role Permissions.`);
    }
  };

  // Sidebar links template
  const sidebarLinks = currentRole === 'SuperAdmin'
    ? [{ id: 'super-admin', label: 'Super Admin Control', icon: Sparkles }]
    : [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'patients', label: t.patients, icon: Users },
        { id: 'tests', label: t.tests, icon: ClipboardList },
        { id: 'samples', label: t.samples, icon: Beaker },
        { id: 'reports', label: t.reports, icon: FileText },
        { id: 'billing', label: t.billing, icon: Receipt },
        { id: 'appointments', label: t.appointments, icon: Calendar },
        { id: 'home-collection', label: t.homeCollection, icon: Home },
        { id: 'inventory', label: t.inventory, icon: Package },
        { id: 'staff', label: t.staff, icon: UserSquare2 },
        { id: 'finance', label: t.finance, icon: DollarSign },
        { id: 'record-expense', label: t.recordExpense || 'Record Expense', icon: PlusCircle },
        ...(currentRole === 'Admin'
          ? [{ id: 'role-permissions', label: 'Role Permissions', icon: ShieldCheck }]
          : []),
        { id: 'settings', label: t.settings, icon: Settings }
      ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100" id="main-layout-wrapper">
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden lg:flex flex-col h-full w-60 bg-slate-100/90 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none" id="desktop-sidebar">
        {/* Brand Header */}
        <div className="h-16 shrink-0 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-200/40 dark:bg-slate-950/40">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0 overflow-hidden">
            {activeSettings?.logoUrl ? (
              <img src={activeSettings.logoUrl} alt="Lab Logo" className="h-full w-full object-contain" />
            ) : (
              <Beaker className="text-white animate-pulse" size={18} />
            )}
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm tracking-tight font-sans">
              {currentBrandTitle}
            </h1>
            <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase font-mono">
              {currentRole === 'SuperAdmin' ? 'SaaS Control' : currentBranch}
            </p>
          </div>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
          {sidebarLinks.map(link => {
            const Icon = link.icon;
            const allowed = isViewAllowed(link.id);
            const active = currentView === link.id;

            return (
              <button
                key={link.id}
                onClick={() => handleNavigationRoute(link.id)}
                disabled={!allowed && currentRole !== 'Admin'}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : allowed
                    ? 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
                    : 'opacity-35 cursor-not-allowed text-slate-400 dark:text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={active ? "text-white" : "text-slate-500 dark:text-slate-400"} />
                  <span>{link.label}</span>
                </div>
                {!allowed && <span className="text-[8px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1 py-0.5 rounded-sm font-bold font-mono">LOCK</span>}
              </button>
            );
          })}
        </nav>

        {/* Pathologist / User active metadata footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-200/30 dark:bg-slate-950/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shadow-inner font-mono">
                {currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DS'}
              </div>
              <div>
                <p className="text-[11px] text-slate-900 dark:text-slate-100 font-bold leading-tight truncate max-w-[110px]">
                  {currentUser ? currentUser.name : 'Dr. Devangi Shah'}
                </p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold leading-none flex items-center gap-1 mt-0.5">
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">ID: {currentUser?.username || 'admin'}</span> • {currentUser?.role || 'Admin'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 min-h-0 overflow-hidden" id="main-content-area">
        {/* Top bar header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-2xs select-none relative z-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:gap-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="lg:hidden flex items-center gap-1.5">
              <Beaker className="text-blue-600 animate-pulse" size={18} />
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {currentBrandTitle}
              </span>
            </div>
          </div>

          {/* User Account Auth, Theme Toggle, Locale & Role Switcher */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Demo Mode Badge if active */}
            {currentUser?.isDemo && (
              <div className="hidden sm:flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-xl text-[10px] font-black font-mono shadow-2xs">
                <Sparkles size={13} className="text-amber-600 dark:text-amber-400" />
                <span>DEMO MODE (SAMPLE DATA)</span>
              </div>
            )}

            {/* Light / Dark Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all shadow-2xs text-[11px] font-bold cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkMode ? (
                <>
                  <Sun size={15} className="text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-slate-600 shrink-0" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Google Firebase Firestore Live Indicator */}
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900 px-2.5 py-1 rounded-xl shadow-2xs text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Firebase Live</span>
            </div>

            {/* Logged in User Profile Card & ID/Password Login Toggle */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-900/80 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs text-left"
                title="Click to Switch Account or Login with ID & Password"
              >
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-extrabold shadow-inner font-mono">
                  {currentUser ? currentUser.name[0] : 'U'}
                </div>
                <div className="hidden md:block">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-none">
                    {currentUser ? currentUser.name : 'Guest User'}
                  </div>
                  <div className="text-[9px] font-mono text-blue-600 dark:text-blue-400 font-semibold leading-none mt-0.5">
                    ID: {currentUser?.username || 'login'} • {currentUser?.role || 'Guest'}
                  </div>
                </div>
                <ChevronDown size={12} className="text-blue-500 ml-0.5" />
              </button>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                title="Log Out Session"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Demo Mode Alert Banner */}
        {currentUser?.isDemo && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 px-4 py-2 flex items-center justify-between text-xs font-black shadow-xs shrink-0 z-10">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="shrink-0 text-slate-950" />
              <span>
                <strong>DEMO MODE ACTIVE (Sample Data Only)</strong> — You are previewing software features with sample records. Log out anytime to log in with a licensed account.
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-950 text-white hover:bg-slate-800 px-3 py-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer shrink-0 ml-2 shadow-xs"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 flex">
            {/* Overlay background */}
            <div className="fixed inset-0 bg-slate-900/60" onClick={() => setIsMobileMenuOpen(false)}></div>

            <aside id="mobile-sidebar-container" className="relative flex flex-col w-64 max-w-xs bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 h-full p-4 space-y-6 shadow-xl border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {currentBrandTitle}
                </span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {sidebarLinks.map(link => {
                  const Icon = link.icon;
                  const allowed = isViewAllowed(link.id);
                  const active = currentView === link.id;

                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavigationRoute(link.id)}
                      disabled={!allowed && currentRole !== 'Admin'}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                        active
                          ? 'bg-blue-600 text-white shadow-xs'
                          : allowed
                          ? 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          : 'opacity-35 cursor-not-allowed text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={14} className={active ? "text-white" : "text-slate-500 dark:text-slate-400"} />
                        <span>{link.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Render Active Tab Component View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6" id="dashboard-tab-content">
          {currentView === 'dashboard' && (
            <DashboardView
              patients={tenantPatients}
              reports={tenantReports}
              invoices={tenantInvoices}
              inventory={tenantInventory}
              t={t}
              onNavigate={handleNavigationRoute}
              onSelectReport={(rep) => {
                setCurrentView('reports');
              }}
            />
          )}

          {currentView === 'patients' && (
            <PatientsView
              patients={tenantPatients}
              reports={tenantReports}
              invoices={tenantInvoices}
              tests={tenantTests}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
              onAddTestReportForPatient={handleCreateReportForPatient}
              t={t}
            />
          )}

          {currentView === 'tests' && (
            <TestsCatalogView
              tests={tenantTests}
              onAddTest={handleAddTestTemplate}
              onDeleteTest={handleDeleteTestTemplate}
              t={t}
            />
          )}

          {currentView === 'samples' && (
            <SampleTrackingView
              reports={tenantReports}
              onUpdateReportStatus={handleUpdateReportStatus}
              t={t}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              reports={tenantReports}
              patients={tenantPatients}
              onSaveReportResults={handleSaveReportResults}
              onSaveAiSummary={handleSaveAiSummary}
              isDemo={currentUser?.isDemo || false}
              t={t}
            />
          )}

          {currentView === 'billing' && (
            <BillingView
              patients={tenantPatients}
              tests={tenantTests}
              reports={tenantReports}
              invoices={tenantInvoices}
              onAddInvoice={handleAddInvoice}
              isDemo={currentUser?.isDemo || false}
              t={t}
            />
          )}

          {currentView === 'appointments' && (
            <AppointmentsView
              appointments={tenantAppointments}
              staff={tenantStaff}
              onBookAppointment={handleBookAppointment}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              t={t}
            />
          )}

          {currentView === 'home-collection' && (
            <HomeCollectionView
              visits={tenantHomeVisits}
              staff={tenantStaff}
              onUpdateVisitStatus={handleUpdateVisitStatus}
              onAssignStaffToVisit={handleAssignStaffToVisit}
              t={t}
            />
          )}

          {currentView === 'inventory' && (
            <InventoryView
              inventory={tenantInventory}
              onAddInventoryItem={handleAddInventoryItem}
              onUpdateStock={handleUpdateStock}
              onDeleteInventoryItem={handleDeleteInventoryItem}
              onAddExpense={handleAddExpense}
              activeCountry={activeCountry}
              t={t}
            />
          )}

          {currentView === 'staff' && (
            <StaffView
              staff={tenantStaff}
              onAddStaff={async (m) => {
                const staffToSave = activeTenantId ? { ...m, tenantId: activeTenantId } : m;
                await saveDocument('staff', m.id, staffToSave);
                const userRole = (m.role === 'Pathologist' ? 'Doctor' : m.role) as UserRole;
                const newUser: UserAccount = {
                  id: `USR-${m.id}`,
                  username: m.name.toLowerCase().replace(/\s+/g, '_'),
                  password: 'password123',
                  name: m.name,
                  role: userRole,
                  email: m.email || `${m.name.toLowerCase().replace(/\s+/g, '')}@apexlab.com`,
                  tenantId: activeTenantId,
                  createdAt: new Date().toISOString().split('T')[0]
                };
                await handleAddUser(newUser);
              }}
              onUpdateAttendance={handleUpdateAttendance}
              onDisburseSalary={handleDisburseSalary}
              t={t}
            />
          )}

          {currentView === 'finance' && (
            <FinanceView
              invoices={tenantInvoices}
              expenses={tenantExpenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onNavigate={handleNavigationRoute}
              isDemo={currentUser?.isDemo || false}
              activeCountry={activeCountry}
              t={t}
            />
          )}

          {currentView === 'record-expense' && (
            <RecordExpenseView
              expenses={tenantExpenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              isDemo={currentUser?.isDemo || false}
              activeCountry={activeCountry}
              t={t}
            />
          )}

          {currentView === 'super-admin' && (
            <SuperAdminPanelView
              tenants={tenants}
              onAddTenant={handleAddTenant}
              onUpdateTenant={handleUpdateTenant}
              onDeleteTenant={handleDeleteTenant}
            />
          )}

          {currentView === 'role-permissions' && (
            <RolePermissionsView
              currentUserRole={currentRole}
              permissions={permissions}
              onSavePermissions={handleSavePermissions}
              users={users}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              currentBranch={currentBranch}
              branches={branches}
              onChangeBranch={setCurrentBranch}
              onAddBranch={handleAddBranch}
              onDeleteBranch={handleDeleteBranch}
              onClearAllData={handleClearAllData}
              currentUserRole={currentRole}
              permissions={permissions}
              onSavePermissions={handleSavePermissions}
              currentCountryCode={currentCountryCode}
              onUpdateCountryCode={handleUpdateCountryCode}
              activeSettings={activeSettings}
              onSaveSettings={handleSaveSettings}
              currentUser={currentUser}
              tenantPatients={tenantPatients}
              tenantReports={tenantReports}
              tenantInvoices={tenantInvoices}
              tenantAppointments={tenantAppointments}
              tenantHomeVisits={tenantHomeVisits}
              tenantInventory={tenantInventory}
              tenantExpenses={tenantExpenses}
              onRestoreData={handleRestoreData}
              t={t}
            />
          )}
        </main>
      </div>

      {/* Login Authentication Modal when trigger button is clicked */}
      {showLoginModal && (
        <LoginModal
          users={users}
          tenants={tenants}
          onLogin={handleLogin}
          onAddUser={handleAddUser}
          onUpdateTenant={handleUpdateTenant}
          onClose={() => setShowLoginModal(false)}
          isModalMode={true}
        />
      )}

      {/* Full screen Login authentication screen when no active user session */}
      {!currentUser && (
        <div className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto">
          <LoginModal
            users={users}
            tenants={tenants}
            onLogin={handleLogin}
            onAddUser={handleAddUser}
            onUpdateTenant={handleUpdateTenant}
            isModalMode={false}
          />
        </div>
      )}
    </div>
  );
}
