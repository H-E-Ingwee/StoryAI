/**
 * Client-side environment variables
 * Only variables prefixed with NEXT_PUBLIC_ are available here
 */

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  appUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
} as const;
