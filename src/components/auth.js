// ABOUTME: Authentication UI component for login/logout
// ABOUTME: Handles OAuth flow initiation and displays user authentication state

import {
  initializeGis,
  requestAccessToken,
  revokeToken,
  isAuthenticated as checkAuth
} from '../auth/gis.js'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email'
]

// Initialize GIS on module load
let gisInitialized = false
async function ensureGisInitialized() {
  if (gisInitialized) return

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error('Google Client ID not configured')
  }

  await initializeGis(clientId, SCOPES)
  gisInitialized = true
}

/**
 * Creates authentication UI component
 * @returns {HTMLElement} Auth component DOM element
 */
export function createAuthComponent() {
  const container = document.createElement('div')
  container.className = 'auth-container'

  const authenticated = checkAuth()

  if (authenticated) {
    container.innerHTML = `
      <div class="auth-status">
        <span class="status-text">Signed in</span>
        <md-text-button id="logout-btn">Sign out</md-text-button>
      </div>
    `

    container.querySelector('#logout-btn').addEventListener('click', async () => {
      try {
        await revokeToken()
        window.location.reload()
      } catch (error) {
        console.error('Logout failed:', error)
        alert('Failed to sign out. Please try again.')
      }
    })
  } else {
    container.innerHTML = `
      <div class="login-prompt">
        <md-filled-button id="login-btn">
          Sign in with Google
        </md-filled-button>
      </div>
    `

    container.querySelector('#login-btn').addEventListener('click', async () => {
      await initiateLogin()
    })
  }

  return container
}

/**
 * Initiates OAuth login flow using GIS
 */
async function initiateLogin() {
  try {
    await ensureGisInitialized()
    await requestAccessToken()
    // On success, reload to show authenticated state
    window.location.reload()
  } catch (error) {
    console.error('Failed to initiate login:', error)
    if (error.message.includes('not configured')) {
      alert('OAuth client ID not configured. Please check .env file.')
    } else {
      alert('Failed to start login. Please try again.')
    }
  }
}

/**
 * Checks if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return checkAuth()
}
