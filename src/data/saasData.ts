import { CountryConfig, LabTenant, RolePermissions, UserAccount } from '../types';

export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  {
    code: 'IN',
    name: 'India',
    currencyCode: 'INR',
    currencySymbol: '₹',
    taxName: 'GST',
    defaultTaxPercent: 18,
    phoneCode: '+91',
    flag: '🇮🇳'
  },
  {
    code: 'US',
    name: 'United States',
    currencyCode: 'USD',
    currencySymbol: '$',
    taxName: 'Sales Tax',
    defaultTaxPercent: 8.25,
    phoneCode: '+1',
    flag: '🇺🇸'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currencyCode: 'GBP',
    currencySymbol: '£',
    taxName: 'VAT',
    defaultTaxPercent: 20,
    phoneCode: '+44',
    flag: '🇬🇧'
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    currencyCode: 'AED',
    currencySymbol: 'AED ',
    taxName: 'VAT',
    defaultTaxPercent: 5,
    phoneCode: '+971',
    flag: '🇦🇪'
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    currencyCode: 'SAR',
    currencySymbol: 'SAR ',
    taxName: 'VAT',
    defaultTaxPercent: 15,
    phoneCode: '+966',
    flag: '🇸🇦'
  },
  {
    code: 'MY',
    name: 'Malaysia',
    currencyCode: 'MYR',
    currencySymbol: 'RM ',
    taxName: 'SST',
    defaultTaxPercent: 6,
    phoneCode: '+60',
    flag: '🇲🇾'
  },
  {
    code: 'AU',
    name: 'Australia',
    currencyCode: 'AUD',
    currencySymbol: 'A$',
    taxName: 'GST',
    defaultTaxPercent: 10,
    phoneCode: '+61',
    flag: '🇦🇺'
  },
  {
    code: 'CA',
    name: 'Canada',
    currencyCode: 'CAD',
    currencySymbol: 'C$',
    taxName: 'HST',
    defaultTaxPercent: 13,
    phoneCode: '+1',
    flag: '🇨🇦'
  },
  {
    code: 'SG',
    name: 'Singapore',
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    taxName: 'GST',
    defaultTaxPercent: 9,
    phoneCode: '+65',
    flag: '🇸🇬'
  },
  {
    code: 'DE',
    name: 'Germany / EU',
    currencyCode: 'EUR',
    currencySymbol: '€',
    taxName: 'VAT',
    defaultTaxPercent: 19,
    phoneCode: '+49',
    flag: '🇩🇪'
  }
];

export const INITIAL_TENANTS: LabTenant[] = [
  {
    id: 'TNT-IN-101',
    labName: 'Sun Pathology & Diagnostic Center',
    ownerName: 'Dr. Rajesh Patel',
    email: 'contact@sunpath.in',
    phone: '+91 9876543210',
    countryCode: 'IN',
    countryName: 'India',
    currencySymbol: '₹',
    currencyCode: 'INR',
    taxName: 'GST',
    taxPercent: 18,
    plan: 'Enterprise',
    status: 'Active',
    expiryDate: '2028-12-31',
    adminUsername: 'admin_in',
    adminPassword: 'password123',
    maxStaffLimit: 25,
    monthlyFee: 15000,
    createdAt: '2026-01-15'
  },
  {
    id: 'TNT-US-202',
    labName: 'BioHealth Diagnostic Center',
    ownerName: 'Dr. Sarah Jenkins',
    email: 'info@biohealthlabs.us',
    phone: '+1 415 555 0192',
    countryCode: 'US',
    countryName: 'United States',
    currencySymbol: '$',
    currencyCode: 'USD',
    taxName: 'Sales Tax',
    taxPercent: 8.25,
    plan: 'Professional',
    status: 'Active',
    expiryDate: '2027-10-31',
    adminUsername: 'admin_us',
    adminPassword: 'password123',
    maxStaffLimit: 15,
    monthlyFee: 299,
    createdAt: '2026-02-01'
  },
  {
    id: 'TNT-UK-303',
    labName: 'Harley Pathology Services',
    ownerName: 'Dr. Oliver Smith',
    email: 'admin@harleypathology.co.uk',
    phone: '+44 20 7946 0912',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    currencySymbol: '£',
    currencyCode: 'GBP',
    taxName: 'VAT',
    taxPercent: 20,
    plan: 'Professional',
    status: 'Active',
    expiryDate: '2027-08-15',
    adminUsername: 'admin_uk',
    adminPassword: 'password123',
    maxStaffLimit: 15,
    monthlyFee: 249,
    createdAt: '2026-03-10'
  },
  {
    id: 'TNT-AE-404',
    labName: 'Gulf Specialized Medical Lab',
    ownerName: 'Dr. Tariq Al-Mansoor',
    email: 'contact@gulflabs.ae',
    phone: '+971 4 321 8899',
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    currencySymbol: 'AED ',
    currencyCode: 'AED',
    taxName: 'VAT',
    taxPercent: 5,
    plan: 'Enterprise',
    status: 'Active',
    expiryDate: '2028-05-30',
    adminUsername: 'admin_uae',
    adminPassword: 'password123',
    maxStaffLimit: 30,
    monthlyFee: 1200,
    createdAt: '2026-04-05'
  }
];

export const SUPER_ADMIN_ACCOUNT: UserAccount = {
  id: 'USR-SUPERADMIN-001',
  username: 'patelmunaf90@gmail.com',
  password: 'munaf786',
  name: 'Munaf Patel (Super Admin)',
  role: 'SuperAdmin',
  email: 'patelmunaf90@gmail.com',
  createdAt: '2026-01-01'
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'SuperAdmin',
    allowedViews: [
      'superAdminPanel',
      'dashboard',
      'patients',
      'tests',
      'samples',
      'reports',
      'billing',
      'appointments',
      'homeCollection',
      'inventory',
      'staff',
      'finance',
      'record-expense',
      'settings',
      'rolePermissions'
    ]
  },
  {
    role: 'Admin',
    allowedViews: [
      'dashboard',
      'patients',
      'tests',
      'samples',
      'reports',
      'billing',
      'appointments',
      'homeCollection',
      'inventory',
      'staff',
      'finance',
      'record-expense',
      'settings',
      'rolePermissions' // ONLY Admin has rolePermissions!
    ]
  },
  {
    role: 'Doctor',
    allowedViews: [
      'dashboard',
      'patients',
      'tests',
      'samples',
      'reports',
      'appointments',
      'settings'
    ]
  },
  {
    role: 'Technician',
    allowedViews: [
      'dashboard',
      'patients',
      'tests',
      'samples',
      'reports',
      'inventory',
      'appointments',
      'settings'
    ]
  },
  {
    role: 'Receptionist',
    allowedViews: [
      'dashboard',
      'patients',
      'tests',
      'reports',
      'billing',
      'appointments',
      'homeCollection',
      'record-expense',
      'settings'
    ]
  },
  {
    role: 'Accountant',
    allowedViews: [
      'dashboard',
      'billing',
      'finance',
      'record-expense',
      'reports',
      'staff',
      'settings'
    ]
  },
  {
    role: 'Patient',
    allowedViews: [
      'reports',
      'appointments'
    ]
  }
];
