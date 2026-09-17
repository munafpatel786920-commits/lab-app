/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Patient,
  TestTemplate,
  TestReport,
  Invoice,
  Appointment,
  HomeCollectionVisit,
  InventoryItem,
  StaffMember,
  LabSettings,
  AuditLog,
  Expense
} from './types';

export const DEFAULT_TESTS: TestTemplate[] = [
  {
    id: 'CBC',
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    price: 450,
    sampleType: 'Whole Blood (EDTA)',
    turnaroundTime: '6 Hours',
    parameters: [
      { name: 'Hemoglobin', unit: 'g/dL', maleRange: '13.5 - 17.5', femaleRange: '12.0 - 15.5', generalRange: '12.0 - 17.5', minNormal: 12.0, maxNormal: 17.5 },
      { name: 'Red Blood Cell (RBC)', unit: 'million/µL', maleRange: '4.1 - 5.9', femaleRange: '4.1 - 5.9', generalRange: '4.1 - 5.9', minNormal: 4.1, maxNormal: 5.9 },
      { name: 'White Blood Cell (WBC)', unit: '/µL', maleRange: '4500 - 11000', femaleRange: '4500 - 11000', generalRange: '4500 - 11000', minNormal: 4500, maxNormal: 11000 },
      { name: 'Platelets', unit: '/µL', maleRange: '150000 - 450000', femaleRange: '150000 - 450000', generalRange: '150000 - 450000', minNormal: 150000, maxNormal: 450000 }
    ]
  },
  {
    id: 'FBS',
    name: 'Blood Sugar - Fasting (FBS)',
    category: 'Biochemistry',
    price: 150,
    sampleType: 'Fluoride Plasma',
    turnaroundTime: '4 Hours',
    parameters: [
      { name: 'Fasting Blood Glucose', unit: 'mg/dL', maleRange: '70 - 100', femaleRange: '70 - 100', generalRange: '70 - 100', minNormal: 70, maxNormal: 100 }
    ]
  },
  {
    id: 'HBA1C',
    name: 'HbA1c (Glycated Hemoglobin)',
    category: 'Biochemistry',
    price: 600,
    sampleType: 'Whole Blood (EDTA)',
    turnaroundTime: '8 Hours',
    parameters: [
      { name: 'HbA1c Level', unit: '%', maleRange: '4.0 - 5.6', femaleRange: '4.0 - 5.6', generalRange: '4.0 - 5.6', minNormal: 4.0, maxNormal: 5.6 }
    ]
  },
  {
    id: 'LIPID',
    name: 'Lipid Profile',
    category: 'Biochemistry',
    price: 800,
    sampleType: 'Serum',
    turnaroundTime: '12 Hours',
    parameters: [
      { name: 'Total Cholesterol', unit: 'mg/dL', maleRange: '125 - 200', femaleRange: '125 - 200', generalRange: '125 - 200', minNormal: 125, maxNormal: 200 },
      { name: 'HDL Cholesterol', unit: 'mg/dL', maleRange: '> 40', femaleRange: '> 50', generalRange: '> 40', minNormal: 40, maxNormal: 100 },
      { name: 'LDL Cholesterol', unit: 'mg/dL', maleRange: '< 100', femaleRange: '< 100', generalRange: '< 100', minNormal: 0, maxNormal: 100 },
      { name: 'Triglycerides', unit: 'mg/dL', maleRange: '< 150', femaleRange: '< 150', generalRange: '< 150', minNormal: 0, maxNormal: 150 }
    ]
  },
  {
    id: 'LFT',
    name: 'Liver Function Test (LFT)',
    category: 'Biochemistry',
    price: 900,
    sampleType: 'Serum',
    turnaroundTime: '12 Hours',
    parameters: [
      { name: 'Bilirubin Total', unit: 'mg/dL', maleRange: '0.2 - 1.2', femaleRange: '0.2 - 1.2', generalRange: '0.2 - 1.2', minNormal: 0.2, maxNormal: 1.2 },
      { name: 'SGOT (AST)', unit: 'U/L', maleRange: '5 - 40', femaleRange: '5 - 35', generalRange: '5 - 40', minNormal: 5, maxNormal: 40 },
      { name: 'SGPT (ALT)', unit: 'U/L', maleRange: '7 - 56', femaleRange: '7 - 45', generalRange: '7 - 56', minNormal: 7, maxNormal: 56 },
      { name: 'Alkaline Phosphatase (ALP)', unit: 'U/L', maleRange: '44 - 147', femaleRange: '44 - 147', generalRange: '44 - 147', minNormal: 44, maxNormal: 147 }
    ]
  },
  {
    id: 'KFT',
    name: 'Kidney Function Test (KFT)',
    category: 'Biochemistry',
    price: 850,
    sampleType: 'Serum',
    turnaroundTime: '12 Hours',
    parameters: [
      { name: 'Urea', unit: 'mg/dL', maleRange: '15 - 45', femaleRange: '15 - 45', generalRange: '15 - 45', minNormal: 15, maxNormal: 45 },
      { name: 'Creatinine', unit: 'mg/dL', maleRange: '0.7 - 1.3', femaleRange: '0.6 - 1.1', generalRange: '0.6 - 1.3', minNormal: 0.6, maxNormal: 1.3 },
      { name: 'Uric Acid', unit: 'mg/dL', maleRange: '3.5 - 7.2', femaleRange: '2.6 - 6.0', generalRange: '2.6 - 7.2', minNormal: 2.6, maxNormal: 7.2 }
    ]
  },
  {
    id: 'THYROID',
    name: 'Thyroid Profile (T3, T4, TSH)',
    category: 'Hormones',
    price: 1100,
    sampleType: 'Serum',
    turnaroundTime: '24 Hours',
    parameters: [
      { name: 'Total T3', unit: 'ng/dL', maleRange: '80 - 200', femaleRange: '80 - 200', generalRange: '80 - 200', minNormal: 80, maxNormal: 200 },
      { name: 'Total T4', unit: 'µg/dL', maleRange: '4.5 - 12.0', femaleRange: '4.5 - 12.0', generalRange: '4.5 - 12.0', minNormal: 4.5, maxNormal: 12.0 },
      { name: 'TSH', unit: 'µIU/mL', maleRange: '0.4 - 4.5', femaleRange: '0.4 - 4.5', generalRange: '0.4 - 4.5', minNormal: 0.4, maxNormal: 4.5 }
    ]
  },
  {
    id: 'VITD',
    name: 'Vitamin D (25-Hydroxy)',
    category: 'Vitamins',
    price: 1500,
    sampleType: 'Serum',
    turnaroundTime: '24 Hours',
    parameters: [
      { name: 'Vitamin D Total', unit: 'ng/mL', maleRange: '30 - 100', femaleRange: '30 - 100', generalRange: '30 - 100', minNormal: 30, maxNormal: 100 }
    ]
  },
  {
    id: 'VITB12',
    name: 'Vitamin B12',
    category: 'Vitamins',
    price: 1200,
    sampleType: 'Serum',
    turnaroundTime: '24 Hours',
    parameters: [
      { name: 'Vitamin B12', unit: 'pg/mL', maleRange: '211 - 911', femaleRange: '211 - 911', generalRange: '211 - 911', minNormal: 211, maxNormal: 911 }
    ]
  },
  {
    id: 'URINE',
    name: 'Urine Routine & Microscopy',
    category: 'Urinalysis',
    price: 250,
    sampleType: 'Midstream Urine',
    turnaroundTime: '4 Hours',
    parameters: [
      { name: 'Color', unit: '', maleRange: 'Pale Yellow', femaleRange: 'Pale Yellow', generalRange: 'Pale Yellow', minNormal: 0, maxNormal: 0 },
      { name: 'pH', unit: '', maleRange: '4.5 - 8.0', femaleRange: '4.5 - 8.0', generalRange: '4.5 - 8.0', minNormal: 4.5, maxNormal: 8.0 },
      { name: 'Specific Gravity', unit: '', maleRange: '1.005 - 1.030', femaleRange: '1.005 - 1.030', generalRange: '1.005 - 1.030', minNormal: 1.005, maxNormal: 1.030 },
      { name: 'Pus Cells', unit: '/HPF', maleRange: '0 - 5', femaleRange: '0 - 5', generalRange: '0 - 5', minNormal: 0, maxNormal: 5 }
    ]
  },
  {
    id: 'DENGUE',
    name: 'Dengue NS1 Antigen & Antibody (IgG/IgM)',
    category: 'Serology',
    price: 1000,
    sampleType: 'Serum',
    turnaroundTime: '4 Hours',
    parameters: [
      { name: 'Dengue NS1 Antigen', unit: '', maleRange: 'Negative', femaleRange: 'Negative', generalRange: 'Negative', minNormal: 0, maxNormal: 0 },
      { name: 'Dengue IgM', unit: '', maleRange: 'Negative', femaleRange: 'Negative', generalRange: 'Negative', minNormal: 0, maxNormal: 0 },
      { name: 'Dengue IgG', unit: '', maleRange: 'Negative', femaleRange: 'Negative', generalRange: 'Negative', minNormal: 0, maxNormal: 0 }
    ]
  },
  {
    id: 'COVID19',
    name: 'COVID-19 RT-PCR Test',
    category: 'Molecular Biology',
    price: 1200,
    sampleType: 'Nasal / Throat Swab',
    turnaroundTime: '12 Hours',
    parameters: [
      { name: 'SARS-CoV-2 RNA', unit: '', maleRange: 'Negative', femaleRange: 'Negative', generalRange: 'Negative', minNormal: 0, maxNormal: 0 }
    ]
  }
];

export const INITIAL_PATIENTS: Patient[] = [];

export const INITIAL_REPORTS: TestReport[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_HOME_VISITS: HomeCollectionVisit[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-KIT-001',
    name: 'CBC Hemoglobin Reagent kit',
    category: 'Reagent',
    quantity: 12,
    unit: 'Boxes',
    minThreshold: 5,
    expiryDate: '2026-12-15',
    supplierName: 'Tulip Diagnostics Ltd',
    supplierContact: '9898980101',
    lastStockedDate: '2026-06-10'
  },
  {
    id: 'INV-KIT-002',
    name: 'Glucose Oxidase (GOD-POD) Reagent',
    category: 'Reagent',
    quantity: 4,
    unit: 'Bottles',
    minThreshold: 10, // TRIGGERS LOW STOCK ALERT!
    expiryDate: '2026-08-30', // TRIGGERS EXPIRY ALERT SOON!
    supplierName: 'Agappe Diagnostics',
    supplierContact: '9564123589',
    lastStockedDate: '2026-05-18'
  },
  {
    id: 'INV-KIT-003',
    name: 'Lipid Profile Cassettes',
    category: 'Test Kit',
    quantity: 25,
    unit: 'Kits',
    minThreshold: 15,
    expiryDate: '2027-04-20',
    supplierName: 'Abbott Healthcare',
    supplierContact: '8877551122',
    lastStockedDate: '2026-07-01'
  },
  {
    id: 'INV-KIT-004',
    name: 'COVID-19 RT-PCR Detection Kit',
    category: 'Test Kit',
    quantity: 2, // TRIGGERS CRITICAL LOW STOCK ALERT!
    unit: 'Boxes',
    minThreshold: 8,
    expiryDate: '2026-07-28', // EXPIRED OR SOON EXPIRING!
    supplierName: 'MyLab Discovery Solutions',
    supplierContact: '7766554411',
    lastStockedDate: '2026-04-12'
  },
  {
    id: 'INV-KIT-005',
    name: 'Urine Test Strips (10 Parameter)',
    category: 'Consumable',
    quantity: 150,
    unit: 'Vials',
    minThreshold: 50,
    expiryDate: '2027-01-10',
    supplierName: 'Siemens Healthineers',
    supplierContact: '8112233445',
    lastStockedDate: '2026-06-25'
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'STAFF-001',
    name: 'Admin User',
    role: 'Admin',
    attendanceRate: 100,
    salary: 80000,
    mobile: '9000000001',
    email: 'admin@apexlab.com',
    status: 'Active'
  },
  {
    id: 'STAFF-002',
    name: 'Dr. Devangi Shah',
    role: 'Pathologist',
    attendanceRate: 94,
    salary: 120000,
    mobile: '9825091234',
    email: 'devangi.shah@apexlab.com',
    status: 'Active'
  },
  {
    id: 'STAFF-003',
    name: 'Haresh Solanki',
    role: 'Technician',
    attendanceRate: 98,
    salary: 35000,
    mobile: '9924056789',
    email: 'haresh@apexlab.com',
    status: 'Active'
  },
  {
    id: 'STAFF-004',
    name: 'Riddhi Patel',
    role: 'Receptionist',
    attendanceRate: 96,
    salary: 22000,
    mobile: '9898451230',
    email: 'riddhi@apexlab.com',
    status: 'Active'
  },
  {
    id: 'STAFF-005',
    name: 'Milind Mehta',
    role: 'Accountant',
    attendanceRate: 95,
    salary: 40000,
    mobile: '9724153678',
    email: 'milind@apexlab.com',
    status: 'Active'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_SETTINGS: LabSettings = {
  labName: 'Apex Diagnostic & Research Center',
  logoText: 'ApexLab',
  address: 'Apex Mansion, Opposite Civil Hospital, Adajan Road, Surat, Gujarat - 395009',
  phoneNumber: '+91 261 2456789 / +91 98765 43210',
  email: 'info@apexlab.com',
  gstNumber: '24AAAAA0000A1Z5',
  reportHeader: 'APEX DIAGNOSTIC & RESEARCH CENTER - PATIENT MEDICAL REPORT',
  reportFooter: 'This is a computer generated medical report, digitally validated by our board-certified Pathologist Dr. Devangi Shah.',
  theme: 'light',
  language: 'en'
};

// MULTI-LANGUAGE RESOURCE STRINGS
export const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    patients: 'Patients',
    tests: 'Test Catalog',
    samples: 'Sample Tracking',
    reports: 'Report Manager',
    billing: 'Billing & Invoices',
    appointments: 'Appointments',
    homeCollection: 'Home Visits',
    inventory: 'Inventory',
    staff: 'Staff & Attendance',
    finance: 'Finance & Analytics',
    recordExpense: 'Record Expense',
    settings: 'Lab Settings',
    patientPortal: 'Patient Portal',
    doctorPortal: 'Doctor Portal',
    search: 'Search...',
    addPatient: 'Add New Patient',
    welcome: 'Welcome Back',
    totalPatients: 'Total Patients',
    todayTests: 'Today\'s Tests',
    pendingReports: 'Pending Reports',
    completedReports: 'Completed Reports',
    totalIncome: 'Total Income',
    revenueChart: 'Monthly Revenue',
    recentPatients: 'Recent Patients',
    notifications: 'Notifications',
    rolePermissions: 'Role-Based Permissions',
    admin: 'Administrator',
    receptionist: 'Receptionist',
    technician: 'Lab Technician',
    pathologist: 'MD Pathologist',
    accountant: 'Accountant',
    patient: 'Patient Portal',
    doctor: 'Reference Doctor',
    theme: 'Theme',
    language: 'Language',
    aiSummary: 'AI Report Analyst Summary',
    runSummary: 'Analyze Report with AI',
    printReport: 'Print Report',
    downloadPdf: 'Download PDF',
    downloadTip: "💡 Tip: If download doesn't start, please click 'Open in New Tab' (top-right of the preview window) and try again, or use 'Print Report' to save as PDF.",
    normal: 'Normal',
    high: 'High',
    low: 'Low',
    barcode: 'Barcode',
    homeCollectionRequired: 'Home Collection Requested',
    outstanding: 'Outstanding Balance',
    discount: 'Discount',
    gst: 'GST',
    gstNum: 'GST Number',
    paymentMode: 'Payment Mode',
    paymentStatus: 'Payment Status',
    staffAssignment: 'Staff Assignment',
    lowStockAlert: 'Low Stock Alert',
    expiryAlert: 'Expiry Warning'
  },
  gu: {
    dashboard: 'ડેશબોર્ડ',
    patients: 'દર્દીઓ',
    tests: 'ટેસ્ટ કેટલોગ',
    samples: 'સેમ્પલ ટ્રેકિંગ',
    reports: 'રિપોર્ટ મેનેજર',
    billing: 'બીલ અને ઇન્વોઇસ',
    appointments: 'મુલાકાતો',
    homeCollection: 'ઘર બેઠા સંગ્રહ',
    inventory: 'ઇન્વેન્ટરી સ્ટોક',
    staff: 'સ્ટાફ હાજરી',
    finance: 'નાણાકીય વિશ્લેષણ',
    recordExpense: 'ખર્ચ નોંધો',
    settings: 'લેબ સેટિંગ્સ',
    patientPortal: 'દર્દી પોર્ટલ',
    doctorPortal: 'ડોક્ટર પોર્ટલ',
    search: 'શોધો...',
    addPatient: 'નવો દર્દી ઉમેરો',
    welcome: 'આપનું સ્વાગત છે',
    totalPatients: 'કુલ દર્દીઓ',
    todayTests: 'આજના ટેસ્ટ',
    pendingReports: 'બાકી અહેવાલો',
    completedReports: 'પૂર્ણ થયેલા અહેવાલો',
    totalIncome: 'કુલ આવક',
    revenueChart: 'માસિક આવક',
    recentPatients: 'તાજેતરના દર્દીઓ',
    notifications: 'સૂચનાઓ',
    rolePermissions: 'ભૂમિકા આધારિત પરવાનગી',
    admin: 'એડમિનિસ્ટ્રેટર',
    receptionist: 'રિસેપ્શનિસ્ટ',
    technician: 'લેબ ટેકનિશિયન',
    pathologist: 'પેથોલોજિસ્ટ',
    accountant: 'એકાઉન્ટન્ટ',
    patient: 'દર્દી પોર્ટલ',
    doctor: 'રેફરન્સ ડોક્ટર',
    theme: 'થીમ',
    language: 'ભાષા',
    aiSummary: 'AI રિપોર્ટ વિશ્લેષણ સારાંશ',
    runSummary: 'AI સાથે વિશ્લેષણ કરો',
    printReport: 'રિપોર્ટ પ્રિન્ટ કરો',
    downloadPdf: 'પીડીએફ ડાઉનલોડ કરો',
    downloadTip: "💡 સંકેત: જો ડાઉનલોડ શરૂ ન થાય, તો કૃપા કરીને સ્ક્રીનની ઉપર-જમણી બાજુએ 'Open in New Tab' બટન પર ક્લિક કરો, અથવા 'રિપોર્ટ પ્રિન્ટ કરો' નો ઉપયોગ કરો.",
    normal: 'સામાન્ય',
    high: 'ઉચ્ચ',
    low: 'ઓછું',
    barcode: 'બારકોડ',
    homeCollectionRequired: 'ઘરેથી સેમ્પલ સંગ્રહ',
    outstanding: 'બાકી રકમ',
    discount: 'ડિસ્કાઉન્ટ',
    gst: 'જીએસટી',
    gstNum: 'જીએસટી નંબર',
    paymentMode: 'ચુકવણી પદ્ધતિ',
    paymentStatus: 'ચુકવણીની સ્થિતિ',
    staffAssignment: 'સ્ટાફની સોંપણી',
    lowStockAlert: 'ઓછા સ્ટોકની ચેતવણી',
    expiryAlert: 'મેળવવાની અંતિમ તારીખ ચેતવણી'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    patients: 'मरीजों',
    tests: 'परीक्षण सूची',
    samples: 'नमूना ट्रैकिंग',
    reports: 'रिपोर्ट मैनेजर',
    billing: 'बिलिंग और चालान',
    appointments: 'अपॉइंटमेंट',
    homeCollection: 'होम कलेक्शन',
    inventory: 'इन्वेंटरी स्टॉक',
    staff: 'स्टाफ उपस्थिति',
    finance: 'वित्त और विश्लेषण',
    recordExpense: 'खर्च दर्ज करें',
    settings: 'लैब सेटिंग्स',
    patientPortal: 'मरीज पोर्टल',
    doctorPortal: 'डॉक्टर पोर्टल',
    search: 'खोजें...',
    addPatient: 'नया मरीज जोड़ें',
    welcome: 'आपका स्वागत है',
    totalPatients: 'कुल मरीज',
    todayTests: 'आज के टेस्ट',
    pendingReports: 'लंबित रिपोर्ट्स',
    completedReports: 'पूर्ण रिपोर्ट्स',
    totalIncome: 'कुल आय',
    revenueChart: 'मासिक राजस्व',
    recentPatients: 'हाल के मरीज',
    notifications: 'सूचनाएं',
    rolePermissions: 'भूमिका आधारित अनुमतियां',
    admin: 'प्रशासक',
    receptionist: 'रिसेप्शनिस्ट',
    technician: 'लैब तकनीशियन',
    pathologist: 'रोगविज्ञानी',
    accountant: 'लेखाकार',
    patient: 'मरीज पोर्टल',
    doctor: 'संदर्भ डॉक्टर',
    theme: 'थीम',
    language: 'भाषा',
    aiSummary: 'AI रिपोर्ट विश्लेषण सारांश',
    runSummary: 'AI के साथ विश्लेषण करें',
    printReport: 'रिपोर्ट प्रिंट करें',
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    downloadTip: "💡 संकेत: यदि डाउनलोड शुरू नहीं होता है, तो कृपया स्क्रीन के ऊपर-दाईं ओर 'Open in New Tab' बटन पर क्लिक करें, या 'रिपोर्ट प्रिंट करें' का उपयोग करें।",
    normal: 'सामान्य',
    high: 'उच्च',
    low: 'निम्न',
    barcode: 'बारकोड',
    homeCollectionRequired: 'घर से नमूना संग्रह',
    outstanding: 'बकाया राशि',
    discount: 'छूट',
    gst: 'जीएसटी',
    gstNum: 'जीएसटी नंबर',
    paymentMode: 'भुगतान का प्रकार',
    paymentStatus: 'भुगतान की स्थिति',
    staffAssignment: 'कर्मचारी असाइनमेंट',
    lowStockAlert: 'कम स्टॉक अलर्ट',
    expiryAlert: 'समाप्ति की चेतावनी'
  }
};
