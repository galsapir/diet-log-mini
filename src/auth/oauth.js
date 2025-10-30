// ABOUTME: OAuth 2.0 flow implementation for Google authentication
// ABOUTME: Handles authorization URL building, callback processing, and token exchange

import { generateCodeVerifier, generateCodeChallenge } from './pkce.js'

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

/**
 * Builds Google OAuth authorization URL with PKCE
 * @param {Object} config - OAuth configuration
 * @param {string} config.clientId - Google OAuth client ID
 * @param {string} config.redirectUri - Callback URL
 * @param {string[]} config.scopes - Required OAuth scopes
 * @returns {Promise<{url: string, verifier: string, state: string}>}
 */
export async function buildAuthUrl(config) {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state = generateCodeVerifier() // Reuse for random state

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: state,
    access_type: 'offline', // Request refresh token
    prompt: 'consent' // Force consent screen to get refresh token
  })

  const url = `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`

  return { url, verifier, state }
}

/**
 * Handles OAuth callback and extracts authorization code
 * @param {string} callbackUrl - Full callback URL with query params
 * @returns {Object} Parsed callback data
 */
export function handleCallback(callbackUrl) {
  const url = new URL(callbackUrl)
  const params = url.searchParams

  const error = params.get('error')
  if (error) {
    return {
      error,
      errorDescription: params.get('error_description')
    }
  }

  const code = params.get('code')
  if (!code) {
    return { error: 'Missing authorization code' }
  }

  return {
    code,
    state: params.get('state')
  }
}

/**
 * Exchanges authorization code for access and refresh tokens
 * @param {string} code - Authorization code from callback
 * @param {string} verifier - PKCE code verifier
 * @param {Object} config - OAuth configuration
 * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number}>}
 */
export async function exchangeCodeForTokens(code, verifier, config) {
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: verifier
  })

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Token exchange failed: ${errorData.error || response.status}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in
  }
}
