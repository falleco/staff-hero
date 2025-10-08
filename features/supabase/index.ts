// Re-export supabase client

// Export API functions
export * from './api/challenges';
export * from './api/currency';
export * from './api/user-profile';
// Export auth context
export { AuthProvider, useAuth } from './auth-context';
export { supabase } from './client';

// Export types
export type * from './types';
