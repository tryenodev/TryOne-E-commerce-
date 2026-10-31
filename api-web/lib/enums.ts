// User Roles
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

// Order Status
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Payment Methods
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  NET_BANKING = 'netbanking',
}

export enum PaymentStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export const ONLINE_PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.CARD,
  PaymentMethod.UPI,
  PaymentMethod.NET_BANKING,
];

export function isOnlinePaymentMethod(method: PaymentMethod): boolean {
  return ONLINE_PAYMENT_METHODS.includes(method);
}

// Filter constants
export const FILTER_ALL = 'ALL' as const;
export const STATUS_FILTER_ALL = 'all' as const;
