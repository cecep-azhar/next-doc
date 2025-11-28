/**
 * AUTH EXPORTS
 * Re-exports auth from auth-config.ts for backwards compatibility
 */

export { auth, signIn, signOut, handlers } from './auth-config';
export type { Session, User } from 'next-auth';
