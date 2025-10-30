// ABOUTME: Main entry point for Diet Log Mini application
// ABOUTME: Initializes app and handles routing between login and main views

import './style.css'
import '@material/web/button/filled-button.js'
import '@material/web/button/text-button.js'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="container">
    <div class="hero">
      <h1>Diet Log Mini</h1>
      <p class="subtitle">Simple diet logging with Google Sheets</p>
      <div class="actions">
        <md-filled-button>
          Get Started
        </md-filled-button>
      </div>
    </div>
  </div>
`
