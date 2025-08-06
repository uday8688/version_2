// Security utilities for input validation and sanitization

import DOMPurify from 'dompurify';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Strong password regex (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Sanitize HTML input to prevent XSS
export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// Validate email format
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  
  return { isValid: true };
};

// Validate name fields
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }
  
  const sanitized = sanitizeHtml(name);
  if (sanitized !== name) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }
  
  if (sanitized.length < 2 || sanitized.length > 50) {
    return { isValid: false, error: 'Name must be between 2 and 50 characters' };
  }
  
  return { isValid: true };
};

// Validate numeric amounts
export const validateAmount = (amount: number | string): { isValid: boolean; error?: string } => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (numAmount > 1000000) {
    return { isValid: false, error: 'Amount cannot exceed $1,000,000' };
  }
  
  return { isValid: true };
};

// Rate limiting utility
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const isRateLimited = (identifier: string, maxRequests: number = 5, windowMs: number = 300000): boolean => {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (limit.count >= maxRequests) {
    return true;
  }
  
  limit.count++;
  return false;
};

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Secure session storage
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to store item in session storage:', error);
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to retrieve item from session storage:', error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove item from session storage:', error);
    }
  }
};