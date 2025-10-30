// ABOUTME: OAuth token storage and management using localStorage
// ABOUTME: Handles token persistence, expiry checks, and refresh operations

const TOKEN_STORAGE_KEY = 'auth_tokens'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Saves OAuth tokens to localStorage with expiry timestamp
 * @param {Object} tokens - Token data
 * @param {string} tokens.accessToken - Access token
 * @param {string} tokens.refreshToken - Refresh token
 * @param {number} tokens.expiresIn - Expiry time in seconds
 */
export function saveTokens(tokens) {
  const expiresAt = Date.now() + (tokens.expiresIn * 1000)

  const data = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data))
}

/**
 * Retrieves stored tokens from localStorage
 * @returns {Object|null} Token data or null if not found
 */
export function getTokens() {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!stored) return null

    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to parse stored tokens:', error)
    return null
  }
}

/**
 * Removes tokens from localStorage
 */
export function clearTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Checks if access token is expired or expiring soon
 * @param {Object|null} tokens - Token data
 * @returns {boolean} True if expired or expiring within 5 minutes
 */
export function isTokenExpired(tokens) {
  if (!tokens || !tokens.expiresAt) return true

  const now = Date.now()
  const expiryWithBuffer = tokens.expiresAt - TOKEN_REFRESH_BUFFER

  return now >= expiryWithBuffer
}

/**
 * Refreshes access token using refresh token
 * @param {Object} tokens - Current token data
 * @param {Object} config - OAuth configuration
 * @param {string} config.clientId - Google OAuth client ID
 * @returns {Promise<{accessToken: string, refreshToken: string, expiresIn: number}>}
 */
export async function refreshAccessToken(tokens, config) {
  if (!tokens || !tokens.refreshToken) {
    throw new Error('No refresh token available')
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    grant_type: 'refresh_token',
    refresh_token: tokens.refreshToken
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
    throw new Error(`Token refresh failed: ${errorData.error || response.status}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: tokens.refreshToken, // Preserve existing refresh token
    expiresIn: data.expires_in
  }
}
