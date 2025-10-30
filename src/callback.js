// ABOUTME: OAuth callback handler for Google authentication
// ABOUTME: Processes authorization code and exchanges for tokens

import { handleCallback, exchangeCodeForTokens } from './auth/oauth.js'
import { saveTokens } from './auth/token-storage.js'
import './style.css'
import '@material/web/button/filled-button.js'

const app = document.querySelector('#app')

// Show loading state
app.innerHTML = `
  <div class="container">
    <div class="callback-processing">
      <h2>Completing sign in...</h2>
      <p>Please wait</p>
    </div>
  </div>
`

async function processCallback() {
  try {
    // Parse callback URL
    const result = handleCallback(window.location.href)

    if (result.error) {
      throw new Error(result.errorDescription || result.error)
    }

    // Retrieve stored verifier and state
    const verifier = sessionStorage.getItem('oauth_verifier')
    const storedState = sessionStorage.getItem('oauth_state')

    if (!verifier) {
      throw new Error('Missing OAuth verifier. Please try logging in again.')
    }

    // Validate state (CSRF protection)
    if (result.state !== storedState) {
      throw new Error('Invalid state parameter. Possible CSRF attack.')
    }

    // Exchange code for tokens
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const redirectUri = import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/callback'

    const config = { clientId, redirectUri }
    const tokens = await exchangeCodeForTokens(result.code, verifier, config)

    // Save tokens
    saveTokens(tokens)

    // Clean up session storage
    sessionStorage.removeItem('oauth_verifier')
    sessionStorage.removeItem('oauth_state')

    // Redirect to main app
    app.innerHTML = `
      <div class="container">
        <div class="callback-success">
          <h2>Success!</h2>
          <p>Redirecting to app...</p>
        </div>
      </div>
    `

    setTimeout(() => {
      window.location.href = '/'
    }, 1000)

  } catch (error) {
    console.error('Callback error:', error)

    app.innerHTML = `
      <div class="container">
        <div class="callback-error">
          <h2>Sign in failed</h2>
          <p>${error.message}</p>
          <md-filled-button id="retry-btn">
            Try again
          </md-filled-button>
        </div>
      </div>
    `

    document.querySelector('#retry-btn').addEventListener('click', () => {
      window.location.href = '/'
    })
  }
}

// Process callback
processCallback()
