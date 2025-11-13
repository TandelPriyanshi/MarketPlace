import { USER_ROLES } from './constants';

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const getRoleDashboardPath = (role: UserRole): string => {
  switch (role) {
    case USER_ROLES.SELLER:
      return '/seller/dashboard';
    case USER_ROLES.DELIVERY:
      return '/delivery/dashboard';
    case USER_ROLES.SALESMAN:
      return '/salesman/dashboard';
    case USER_ROLES.CUSTOMER:
      return '/customer/dashboard';
    default:
      return '/login';
  }
};

export const getRoleName = (role: UserRole): string => {
  switch (role) {
    case USER_ROLES.SELLER:
      return 'Seller';
    case USER_ROLES.DELIVERY:
      return 'Delivery Person';
    case USER_ROLES.SALESMAN:
      return 'Salesman';
    case USER_ROLES.CUSTOMER:
      return 'Customer';
    default:
      return 'User';
  }
};
