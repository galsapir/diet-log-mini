// ABOUTME: Main entry point for Diet Log Mini application
// ABOUTME: Initializes app and handles routing between login and main views

import './style.css'
import '@material/web/button/filled-button.js'
import '@material/web/button/text-button.js'
import { createAuthComponent, isAuthenticated } from './components/auth.js'

const app = document.querySelector('#app')

function renderApp() {
  if (isAuthenticated()) {
    // Main app view (authenticated)
    app.innerHTML = `
      <div class="app-layout">
        <header class="app-header">
          <h1 class="app-title">Diet Log</h1>
        </header>
        <main class="app-main">
          <p>Welcome! Meal logging coming soon...</p>
        </main>
      </div>
    `

    // Add auth component to header
    const header = app.querySelector('.app-header')
    header.appendChild(createAuthComponent())
  } else {
    // Login view (not authenticated)
    app.innerHTML = `
      <div class="container">
        <div class="hero">
          <h1>Diet Log Mini</h1>
          <p class="subtitle">Simple diet logging with Google Sheets</p>
        </div>
      </div>
    `

    // Add auth component to hero
    const hero = app.querySelector('.hero')
    hero.appendChild(createAuthComponent())
  }
}

renderApp()
