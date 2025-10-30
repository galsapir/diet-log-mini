// ABOUTME: Authentication UI component for login/logout
// ABOUTME: Handles OAuth flow initiation and displays user authentication state

import { buildAuthUrl } from '../auth/oauth.js'
import { getTokens, clearTokens, isTokenExpired } from '../auth/token-storage.js'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email'
]

/**
 * Creates authentication UI component
 * @returns {HTMLElement} Auth component DOM element
 */
export function createAuthComponent() {
  const container = document.createElement('div')
  container.className = 'auth-container'

  const tokens = getTokens()
  const isAuthenticated = tokens && !isTokenExpired(tokens)

  if (isAuthenticated) {
    container.innerHTML = `
      <div class="auth-status">
        <span class="status-text">Signed in</span>
        <md-text-button id="logout-btn">Sign out</md-text-button>
      </div>
    `

    container.querySelector('#logout-btn').addEventListener('click', () => {
      clearTokens()
      window.location.reload()
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
 * Initiates OAuth login flow
 */
async function initiateLogin() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const redirectUri = import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/callback'

  if (!clientId) {
    alert('OAuth client ID not configured. Please check .env file.')
    return
  }

  const config = {
    clientId,
    redirectUri,
    scopes: SCOPES
  }

  try {
    const { url, verifier, state } = await buildAuthUrl(config)

    // Store verifier and state for callback validation
    sessionStorage.setItem('oauth_verifier', verifier)
    sessionStorage.setItem('oauth_state', state)

    // Redirect to Google OAuth
    window.location.href = url
  } catch (error) {
    console.error('Failed to initiate login:', error)
    alert('Failed to start login. Please try again.')
  }
}

/**
 * Checks if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  const tokens = getTokens()
  return tokens && !isTokenExpired(tokens)
}
