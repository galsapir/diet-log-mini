# Diet Log Mini - Implementation Plan

## Overview
Simple diet logging app with Google integration, hosted on GitHub Pages.

## Tech Stack
- **Framework**: Vanilla JS + Vite
- **UI**: Material Web Components (MD3)
- **APIs**: Google Sheets API, Google Drive API, Google OAuth 2.0 (PKCE)
- **Testing**: Vitest (unit tests only)
- **Hosting**: GitHub Pages

## Sheet Structure
```
| Timestamp | Meal | Description | Image | Calories | Protein | Carbs | Fats |
```
- Timestamp: ISO 8601 format (sortable)
- Meal: Text description
- Description: Additional notes
- Image: GDrive public link
- Macros: Empty (future implementation)

**Sheet naming**: `Diet Log_YYYY_MM_USERNAME`

---

## Phase 1: Project Foundation

### 1.1 Setup & Configuration
- [ ] Init Vite project with vanilla JS template
- [ ] Install Material Web Components
- [ ] Setup Vitest for testing
- [ ] Configure GitHub Pages deployment
- [ ] Setup OAuth client ID (Google Cloud Console)
- [ ] Add `.env.example` for config

### 1.2 Basic Structure
- [ ] Create folder structure (`src/auth/`, `src/api/`, `src/components/`, `src/utils/`, `tests/`)
- [ ] Setup base HTML with Material Design

---

## Phase 2: Authentication (TDD)

### 2.1 OAuth Flow
- [ ] Test & Impl: OAuth init with PKCE challenge generation
- [ ] Test & Impl: Redirect to Google OAuth
- [ ] Test & Impl: Handle callback with auth code
- [ ] Test & Impl: Exchange code for tokens
- [ ] Test & Impl: Token storage in localStorage
- [ ] Test & Impl: Token refresh on expiry

### 2.2 Auth UI
- [ ] Login button (Material button component)
- [ ] Loading state
- [ ] Error handling display
- [ ] Logout functionality

**Required Scopes**:
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.file`

---

## Phase 3: Google Sheets Integration (TDD)

### 3.1 Sheet Detection/Creation
- [ ] Test & Impl: Search for existing sheet by name pattern
- [ ] Test & Impl: Create sheet if not found
- [ ] Test & Impl: Initialize headers row

### 3.2 CRUD Operations
- [ ] Test & Impl: Append meal row to sheet
- [ ] Test & Impl: Read recent meals (for duplication)
- [ ] Test & Impl: Update existing row (time edit)

---

## Phase 4: Google Drive Integration (TDD)

### 4.1 Image Upload
- [ ] Test & Impl: Create folder structure `Diet Log Photos/YYYY/MM`
- [ ] Test & Impl: Upload image file
- [ ] Test & Impl: Make file public, get shareable link
- [ ] Test & Impl: Handle upload errors (size limits, network)

### 4.2 Camera Integration
- [ ] Use `<input type="file" accept="image/*" capture="camera">`
- [ ] Image preview before upload
- [ ] Compress large images (client-side)

---

## Phase 5: UI Components (Material Design)

### 5.1 Main Layout
- [ ] App bar with user info + logout
- [ ] FAB (Floating Action Button) for "Log Meal"
- [ ] Meal list view (recent meals)

### 5.2 Meal Logging Dialog
- [ ] Material dialog component
- [ ] Camera/file input button
- [ ] Image preview
- [ ] Text input for meal name
- [ ] Textarea for description
- [ ] DateTime picker (with "Now" default)
- [ ] Save/Cancel buttons
- [ ] Loading state during save

### 5.3 Duplicate Meal Feature
- [ ] Show recent meals list
- [ ] "Duplicate" button per meal
- [ ] Pre-fill dialog with meal data
- [ ] Allow editing before save
- [ ] Reset timestamp to "Now"

---

## Phase 6: Core Features Implementation

### 6.1 Meal Logging Flow (TDD)
- [ ] Test & Impl: Capture photo from camera
- [ ] Test & Impl: Upload to Drive, get link
- [ ] Test & Impl: Append to sheet with all data
- [ ] Test & Impl: Success/error feedback

### 6.2 Retrospective Editing (TDD)
- [ ] Test & Impl: Parse user-provided datetime
- [ ] Test & Impl: Update timestamp in sheet

### 6.3 Duplicate Meal (TDD)
- [ ] Test & Impl: Fetch recent N meals from sheet
- [ ] Test & Impl: Copy meal data, update timestamp
- [ ] Test & Impl: Save as new entry

---

## Phase 7: Error Handling & UX

### 7.1 Offline Support
- [ ] Detect offline state
- [ ] Queue actions for retry
- [ ] Show offline indicator

### 7.2 Error States
- [ ] API rate limiting handling
- [ ] Network errors
- [ ] Permission errors
- [ ] User-friendly error messages

### 7.3 Loading States
- [ ] Skeleton screens
- [ ] Progress indicators
- [ ] Optimistic UI updates

---

## Phase 8: Testing

### 8.1 Unit Tests (TDD - throughout implementation)
- Auth utilities
- Date formatting
- API response parsing
- Data validation

### 8.2 Integration Tests
- Mock Google API responses
- Test full meal logging flow
- Test sheet creation flow
- Test duplicate meal flow

**Note**: Skipping E2E (can't use real Google APIs in CI)

---

## Phase 9: Deployment

### 9.1 GitHub Pages Setup
- [ ] Configure Vite build for GH Pages
- [ ] Setup GitHub Actions workflow
- [ ] Test OAuth redirect with GH Pages URL
- [ ] Add custom domain (optional)

### 9.2 Documentation
- [ ] README with setup instructions
- [ ] How to get Google OAuth client ID
- [ ] Environment variables guide
- [ ] User guide (how to use app)

---

## Phase 10: Future Enhancements (Deferred)

- [ ] Macros tracking (calories, protein, carbs, fats)
- [ ] Nutrition API integration (FatSecret/Nutritionix)
- [ ] Meal templates
- [ ] Export functionality
- [ ] Dark mode
- [ ] PWA capabilities (service worker, installable)

---

## Development Principles (from claude.md)

- TDD for all features
- YAGNI - no unnecessary features
- Commit frequently
- Small, focused changes
- No shortcuts - do it right
