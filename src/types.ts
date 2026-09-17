/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  id: string; // e.g., PAT-2026-0001
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email: string;
  address: string;
  doctorRef: string;
  appointmentDate: string;
  sampleCollectionDate: string;
  photoUrl?: string;
  createdDate: string;
}

export interface TestParameter {
  name: string;
  unit: string;
  maleRange: string;
  femaleRange: string;
  generalRange: string;
  minNormal: number;
  maxNormal: number;
}

export interface TestTemplate {
  id: string;
  name: string;
  category: string;
  price: number;
  sampleType: string;
  turnaroundTime: string; // e.g., "12 Hours"
  parameters: TestParameter[];
}

export interface ParameterValue {
  name: string;
  value: string; // user entered
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low';
}

export interface TestReport {
  reportNo: string; // e.g., REP-2026-0001
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  doctorRef: string;
  testId: string;
  testName: string;
  category: string;
  sampleType: string;
  barcode: string; // e.g., BAR-12345678
  status: 'Processing' | 'Completed'; // Report manager status
  sampleStatus?: 'Completed' | 'Processing' | 'Rejected' | 'Collected'; // Sample tracking status
  technicianVerified?: boolean;
  pathologistVerified?: boolean;
  technicianName: string;
  pathologistName: string;
  parameters: ParameterValue[];
  doctorRemarks: string;
  digitalSignatureUrl?: string;
  collectedDate: string;
  completedDate?: string;
  invoiceNo?: string;
  aiSummary?: string;
  tenantId?: string;
}

export interface InvoiceItem {
  testId: string;
  testName: string;
  price: number;
}

export interface Invoice {
  invoiceNo: string; // e.g., INV-2026-0001
  patientId: string;
  patientName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number; // percentage
  discountAmount: number;
  gstPercent: number; // default 18%
  gstAmount: number;
  total: number;
  paidAmount: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Online';
  outstandingBalance: number;
  date: string;
  tenantId?: string;
}

export interface Appointment {
  id: string; // e.g., APT-2026-0001
  patientName: string;
  mobile: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  doctorRef: string;
  date: string;
  timeSlot: string;
  homeCollection: boolean;
  address?: string;
  status: 'Booked' | 'Completed' | 'Cancelled';
  assignedStaffId?: string;
  assignedStaffName?: string;
}

export interface HomeCollectionVisit {
  id: string;
  appointmentId: string;
  patientName: string;
  address: string;
  mobile: string;
  assignedStaffName: string;
  status: 'Pending' | 'On the Way' | 'Collected' | 'Completed';
  locationCoordinates: string; // mock map location text
  scheduledTime: string;
  tenantId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Test Kit' | 'Reagent' | 'Chemical' | 'Consumable';
  quantity: number;
  unit: string;
  minThreshold: number;
  expiryDate: string;
  supplierName: string;
  supplierContact: string;
  lastStockedDate: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Admin' | 'Receptionist' | 'Technician' | 'Pathologist' | 'Accountant';
  attendanceRate?: number; // e.g., 96 for 96%
  salary: number;
  mobile: string;
  email: string;
  status: 'Active' | 'Inactive';
  isPresentToday?: boolean;
  salaryPaidThisMonth?: boolean;
  joiningDate?: string;
}

export interface LabSettings {
  labName: string;
  logoText: string;
  logoUrl?: string; // Added logoUrl
  address: string;
  phoneNumber: string;
  email: string;
  gstNumber: string;
  reportHeader: string;
  reportFooter: string;
  theme: 'light' | 'dark';
  branches?: string[];
  language?: string;
  pathologistSignatureUrl?: string;
  pathologistName?: string;
  // Multi-country SaaS settings
  countryCode?: string;
  countryName?: string;
  currencySymbol?: string;
  currencyCode?: string;
  taxName?: string;
  taxPercent?: number;
  tenantId?: string;
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
}

export interface Expense {
  id: string;
  category: 'Salary' | 'Reagents & Kits' | 'Utilities' | 'Rent' | 'Other';
  amount: number;
  date: string;
  description: string;
  taxAmount?: number;
  taxPercent?: number;
  baseAmount?: number;
}

export type UserRole = 'SuperAdmin' | 'Admin' | 'Receptionist' | 'Technician' | 'Doctor' | 'Patient' | 'Accountant';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
  createdAt?: string;
  lastLogin?: string;
  tenantId?: string; // Links to LabTenant for multi-tenant SaaS
  isDemo?: boolean; // Flag indicating if user is operating in Demo / Sample Data mode
}

export interface CountryConfig {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  taxName: string;
  defaultTaxPercent: number;
  phoneCode: string;
  flag: string;
}

export interface LabTenant {
  id: string;
  labName: string;
  ownerName: string;
  email: string;
  phone: string;
  countryCode: string;
  countryName: string;
  currencySymbol: string;
  currencyCode: string;
  taxName: string;
  taxPercent: number;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  status: 'Active' | 'Suspended' | 'Expired';
  expiryDate: string;
  adminUsername: string;
  adminPassword: string;
  maxStaffLimit: number;
  monthlyFee: number;
  createdAt: string;
  activationKey?: string;
}

export interface RolePermissions {
  role: UserRole;
  allowedViews: string[];
}
