// utils/decodeJwt.ts

import { Buffer } from 'buffer';

interface JwtPayload {
  sub: string; // User's identifier (e.g., username)
  name?: string; // Optional name field if available in the token
  // Add other fields as needed
}

/**
 * Decodes a JWT token and returns its payload.
 * @param token - The JWT token string.
 * @returns The decoded payload or null if decoding fails.
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format.');
    }

    const payload = parts[1];

    // Base64URL decoding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = Buffer.from(base64, 'base64').toString('utf-8');

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};
