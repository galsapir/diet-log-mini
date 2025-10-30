# Diet Log Mini

Simple diet logging app with Google Sheets integration.

## Features

- Log meals with photos and descriptions
- Photos stored in Google Drive
- Data logged to Google Sheets
- Duplicate recent meals
- Material Design UI
- Hosted on GitHub Pages

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:5173/callback` (dev)
     - `https://yourusername.github.io/diet-log-mini/callback` (production)
5. Copy the Client ID

### 3. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Client ID:

```
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
VITE_REDIRECT_URI=http://localhost:5173/callback
```

### 4. Development

```bash
npm run dev
```

Open http://localhost:5173/diet-log-mini/

### 5. Build

```bash
npm run build
```

### 6. Test

```bash
npm test
```

## Deployment

Pushes to `main` branch automatically deploy to GitHub Pages via GitHub Actions.

## Tech Stack

- Vanilla JavaScript + Vite
- Material Web Components
- Google Sheets API
- Google Drive API
- Vitest for testing
