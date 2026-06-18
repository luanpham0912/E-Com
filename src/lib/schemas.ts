import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const shippingSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  line1: z.string().min(5, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
  country: z.string().min(2, 'Country is required'),
});

export const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, 'Enter a valid card number'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Enter MM/YY'),
  cvc: z.string().regex(/^\d{3,4}$/, 'Enter a valid CVC'),
  nameOnCard: z.string().min(2, 'Name on card is required'),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
});

export const productFormSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  salePrice: z.number().min(0).optional(),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock must be 0 or more'),
  tags: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ShippingFormData = z.infer<typeof shippingSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;
