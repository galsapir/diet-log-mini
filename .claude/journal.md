# Diet Log Mini - Project Journal

## 2025-10-30 - Initial Project Planning

### Project Overview
Building simple diet logging app with Google integration
- User: Gal
- Goal: Track meals w/ pics + text in Google Sheet
- Host: GitHub Pages (static site, free HTTPS)
- Auth: Google OAuth

### Requirements Summary
1. **Auth Flow**: Login with Google account
2. **Sheet Management**: Auto-find or create "Diet Log_YEAR_MONTH_USERNAME"
3. **Meal Logging**:
   - Button (Material Design)
   - Add pic (stored in GDrive, link in sheet)
   - Add text description
   - Auto timestamp
   - Allow retrospective time edits
4. **Duplication**: Copy recent meals (editable)
5. **Sheet Columns**: Timestamp, Description, Image URL (GDrive link), Date, Time
   - Macros (calories, protein, carbs, fats) - DEFERRED for later
6. **Tech Stack Decisions**:
   - Client-side only (vanilla JS or React/Vue)
   - Google Sheets API + Drive API
   - OAuth with PKCE flow
   - Material Design (need to decide lib)

### Key Technical Decisions ✅
- [x] Framework: Vanilla JS + Vite
- [x] Material Design: Material Web Components (MD3)
- [x] Sheet columns: Timestamp, Meal, Description, Image, Calories, Protein, Carbs, Fats (macros empty for now)
- [x] Images: Upload to GDrive, public links OK
- [x] Testing: Vitest unit tests, skip E2E

### Important Notes from claude.md
- TDD required for all features
- YAGNI principle
- Must commit frequently
- Use gh CLI for issues
- All files need ABOUTME: comments
- Must push back on bad ideas

### Completed Tasks
- [x] Planning phase discussion with Gal
- [x] Created PLAN.md with full implementation roadmap
- [x] Saved to repo (gh CLI blocked by hooks)

## 2025-10-30 - Phase 1: Project Foundation ✅

### What We Built
- Vite project with vanilla JS
- Material Web Components integrated
- Vitest testing setup (happy-dom)
- Folder structure: src/auth/, src/api/, src/components/, src/utils/, tests/
- GitHub Actions workflow for GH Pages deployment
- Basic Material Design UI with hero section
- README with complete setup instructions
- .env.example for OAuth configuration

### Technical Decisions
- Updated deps to fix vulnerabilities (Vite 6.4, Vitest 3.0, happy-dom 20.0)
- Using happy-dom instead of jsdom (lighter, faster)
- GH Pages base path: /diet-log-mini/
- Material theme color: #6750A4

### Tests
- ✅ Build works
- ✅ Dev server runs
- ✅ Vitest runs
- ✅ No npm vulnerabilities

### Deployment
- ✅ Fixed package-lock.json issue
- ✅ GH Actions workflow successful
- ✅ Live at: https://galsapir.github.io/diet-log-mini/

---

## Phase 2: OAuth Authentication (Starting Now)

### Objectives
1. Implement OAuth 2.0 PKCE flow
2. Token management (store, refresh)
3. Login UI with Material Design

### Implementation Plan (TDD)
1. **PKCE Utils** (tests first):
   - Generate code verifier (random string)
   - Generate code challenge (SHA-256 hash)
   - Base64 URL encoding

2. **OAuth Flow**:
   - Build auth URL with scopes
   - Handle callback
   - Exchange code for tokens

3. **Token Management**:
   - Store in localStorage
   - Auto-refresh on expiry
   - Logout (clear tokens)

4. **Login UI**:
   - Login button
   - Loading states
   - Error handling

### Required Google Scopes
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.file`
