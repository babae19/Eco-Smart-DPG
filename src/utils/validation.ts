/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitizes text input to prevent XSS attacks
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  // Basic HTML entity encoding to prevent script injection
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates text length
 */
export const isValidLength = (text: string, min: number = 1, max: number = 1000): boolean => {
  const trimmed = text.trim();
  return trimmed.length >= min && trimmed.length <= max;
};

/**
 * Validates that input contains only safe characters
 */
export const containsOnlySafeCharacters = (input: string): boolean => {
  // Allow alphanumeric, spaces, and common punctuation
  const safePattern = /^[a-zA-Z0-9\s.,!?'-]+$/;
  return safePattern.test(input);
};

/**
 * Validates image file type and size
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large. Maximum size is 5MB.' };
  }
  
  return { isValid: true };
};

/**
 * Validates campaign input data
 */
export const validateCampaignInput = (data: {
  title: string;
  description?: string;
  goal: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!isValidLength(data.title, 3, 100)) {
    errors.push('Title must be between 3 and 100 characters');
  }
  
  if (!containsOnlySafeCharacters(data.title)) {
    errors.push('Title contains invalid characters');
  }
  
  if (data.description) {
    const wordCount = data.description.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 500) {
      errors.push('Description must be 500 words or fewer');
    }
  }
  
  if (!isValidLength(data.goal, 10, 500)) {
    errors.push('Goal must be between 10 and 500 characters');
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Validates report input data
 */
export const validateReportInput = (data: {
  title: string;
  description: string;
  location?: string;
  issueType: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!isValidLength(data.title, 3, 100)) {
    errors.push('Title must be between 3 and 100 characters');
  }
  
  if (!containsOnlySafeCharacters(data.title)) {
    errors.push('Title contains invalid characters');
  }
  
  if (!isValidLength(data.description, 10, 1000)) {
    errors.push('Description must be between 10 and 1000 characters');
  }
  
  if (data.location && !isValidLength(data.location, 0, 200)) {
    errors.push('Location must be less than 200 characters');
  }
  
  if (!isValidLength(data.issueType, 1, 50)) {
    errors.push('Issue type is required');
  }
  
  return { isValid: errors.length === 0, errors };
};