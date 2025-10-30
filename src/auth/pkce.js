// ABOUTME: PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0
// ABOUTME: Generates code verifiers, challenges, and handles base64url encoding

/**
 * Generates a cryptographically random code verifier for PKCE flow
 * @returns {string} Random string (43-128 chars) using URL-safe characters
 */
export function generateCodeVerifier() {
  const array = new Uint8Array(32) // 32 bytes = 43 base64url chars
  crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

/**
 * Encodes Uint8Array to base64url string (RFC 4648)
 * @param {Uint8Array} buffer - Data to encode
 * @returns {string} Base64url encoded string
 */
export function base64UrlEncode(buffer) {
  // Convert to base64
  const base64 = btoa(String.fromCharCode(...buffer))

  // Convert to base64url: replace + with -, / with _, remove =
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Generates code challenge from verifier using SHA-256
 * @param {string} verifier - Code verifier string
 * @returns {Promise<string>} Base64url encoded SHA-256 hash
 */
export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(hash))
}
