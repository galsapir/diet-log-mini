// ABOUTME: Google Identity Services (GIS) wrapper for OAuth authentication
// ABOUTME: Handles token management using Google's recommended GIS library

let tokenClient = null
let gapiInitialized = false
let gisInitialized = false

/**
 * Initialize Google Identity Services
 * @param {string} clientId - OAuth 2.0 Client ID
 * @param {string[]} scopes - Array of OAuth scopes
 * @returns {Promise<void>}
 */
export async function initializeGis(clientId, scopes) {
  if (!clientId) {
    throw new Error('Client ID required')
  }

  if (!scopes || scopes.length === 0) {
    throw new Error('At least one scope required')
  }

  // Wait for gapi to load
  await new Promise((resolve) => {
    if (typeof gapi !== 'undefined' && gapi.load) {
      gapi.load('client', resolve)
    } else {
      window.gapiLoaded = () => {
        gapi.load('client', resolve)
      }
    }
  })

  gapiInitialized = true

  // Wait for GIS to load
  await new Promise((resolve) => {
    if (typeof google !== 'undefined' && google.accounts) {
      resolve()
    } else {
      window.gisLoaded = resolve
    }
  })

  // Initialize token client
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scopes.join(' '),
    callback: (response) => {
      if (response.error) {
        console.error('Token response error:', response)
      }
    }
  })

  gisInitialized = true
}

/**
 * Request access token (shows consent popup)
 * @returns {Promise<void>}
 */
export async function requestAccessToken() {
  if (!gisInitialized || !tokenClient) {
    throw new Error('GIS not initialized. Call initializeGis() first.')
  }

  return new Promise((resolve, reject) => {
    try {
      // Override callback to handle this specific request
      tokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          // Store token in localStorage for persistence
          localStorage.setItem('gis_token', JSON.stringify({
            access_token: response.access_token,
            expires_in: response.expires_in,
            scope: response.scope,
            token_type: response.token_type
          }))
          resolve()
        }
      }

      // Check if we have an existing token
      const token = gapi.client.getToken()

      if (token === null) {
        // No token - request with consent
        tokenClient.requestAccessToken({ prompt: 'consent' })
      } else {
        // Token exists - request silently
        tokenClient.requestAccessToken({ prompt: '' })
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Get current access token (from gapi or localStorage)
 * @returns {string|null} Access token or null if not authenticated
 */
export function getAccessToken() {
  if (typeof gapi === 'undefined' || !gapi.client) {
    // Try localStorage if gapi not ready
    const stored = localStorage.getItem('gis_token')
    if (stored) {
      try {
        const tokenData = JSON.parse(stored)
        return tokenData.access_token
      } catch {
        return null
      }
    }
    return null
  }

  const token = gapi.client.getToken()
  if (token) {
    return token.access_token
  }

  // Try restoring from localStorage
  const stored = localStorage.getItem('gis_token')
  if (stored) {
    try {
      const tokenData = JSON.parse(stored)
      // Restore to gapi
      gapi.client.setToken(tokenData)
      return tokenData.access_token
    } catch {
      return null
    }
  }

  return null
}

/**
 * Revoke access token and sign out
 * @returns {Promise<void>}
 */
export async function revokeToken() {
  const token = getAccessToken()

  if (!token) {
    return
  }

  return new Promise((resolve, reject) => {
    try {
      google.accounts.oauth2.revoke(token, (done) => {
        // Clear token from gapi and localStorage
        if (gapi?.client) {
          gapi.client.setToken(null)
        }
        localStorage.removeItem('gis_token')
        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  return getAccessToken() !== null
}

/**
 * Reset module state (for testing)
 * @private
 */
export function _resetForTesting() {
  tokenClient = null
  gapiInitialized = false
  gisInitialized = false
}
