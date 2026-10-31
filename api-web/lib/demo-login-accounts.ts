/** Seed users from TEST_LOGIN.md — run `npm run db:seed` first. */
export type DemoLoginAccount = {
  group: 'Admin' | 'Staff' | 'Customer';
  label: string;
  email: string;
  password: string;
  role: string;
};

export const DEMO_LOGIN_ACCOUNTS: DemoLoginAccount[] = [
  {
    group: 'Admin',
    label: 'System Admin',
    email: 'admin@tryeno-one.com',
    password: 'Admin@123',
    role: 'ADMIN',
  },
  {
    group: 'Admin',
    label: 'John Anderson',
    email: 'john.admin@tryeno-one.com',
    password: 'JohnAdmin@456',
    role: 'ADMIN',
  },
  {
    group: 'Admin',
    label: 'Sarah Wilson',
    email: 'sarah.admin@tryeno-one.com',
    password: 'SarahAdmin@789',
    role: 'ADMIN',
  },
  {
    group: 'Staff',
    label: 'Staff User',
    email: 'staff@tryeno-one.com',
    password: 'Staff@123',
    role: 'STAFF',
  },
  {
    group: 'Staff',
    label: 'Mike Johnson',
    email: 'mike.staff@tryeno-one.com',
    password: 'MikeStaff@456',
    role: 'STAFF',
  },
  {
    group: 'Customer',
    label: 'Customer User',
    email: 'customer@tryeno-one.com',
    password: 'Customer@123',
    role: 'CUSTOMER',
  },
  {
    group: 'Customer',
    label: 'Emma Davis',
    email: 'emma.customer@tryeno-one.com',
    password: 'EmmaCustomer@456',
    role: 'CUSTOMER',
  },
];

/** One primary account per role — used for one-click demo login on /login. */
export const QUICK_ROLE_LOGINS: DemoLoginAccount[] = [
  DEMO_LOGIN_ACCOUNTS.find((a) => a.email === 'admin@tryeno-one.com')!,
  DEMO_LOGIN_ACCOUNTS.find((a) => a.email === 'staff@tryeno-one.com')!,
  DEMO_LOGIN_ACCOUNTS.find((a) => a.email === 'customer@tryeno-one.com')!,
];
