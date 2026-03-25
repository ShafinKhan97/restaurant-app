import * as z from 'zod';

// Reusable email field
export const emailField = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

// Reusable strong password field (used on register, reset-password, profile change-password)
export const strongPasswordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
