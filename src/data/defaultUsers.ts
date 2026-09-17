import { UserAccount } from '../types';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'admin123',
    name: 'Dr. Rajesh Patel',
    role: 'Admin',
    email: 'admin@apexlab.com',
    createdAt: '2026-01-01'
  },
  {
    id: 'USR-002',
    username: 'doctor',
    password: 'doc123',
    name: 'Dr. Ananya Sharma',
    role: 'Doctor',
    email: 'ananya.sharma@apexlab.com',
    createdAt: '2026-01-05'
  },
  {
    id: 'USR-003',
    username: 'tech',
    password: 'tech123',
    name: 'Suresh Kumar',
    role: 'Technician',
    email: 'suresh.tech@apexlab.com',
    createdAt: '2026-01-10'
  },
  {
    id: 'USR-004',
    username: 'receptionist',
    password: 'rec123',
    name: 'Priya Verma',
    role: 'Receptionist',
    email: 'priya.reception@apexlab.com',
    createdAt: '2026-01-12'
  },
  {
    id: 'USR-005',
    username: 'accountant',
    password: 'acc123',
    name: 'Amit Shah',
    role: 'Accountant',
    email: 'amit.accounts@apexlab.com',
    createdAt: '2026-01-15'
  },
  {
    id: 'USR-006',
    username: 'patient',
    password: 'pat123',
    name: 'Ramesh Mehta',
    role: 'Patient',
    email: 'ramesh.mehta@gmail.com',
    createdAt: '2026-02-01'
  }
];
