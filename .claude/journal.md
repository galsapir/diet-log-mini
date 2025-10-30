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

## Phase 2: OAuth Authentication ✅

### What We Built
1. **PKCE Utilities** (TDD - 12 tests):
   - Code verifier generation (crypto random)
   - SHA-256 code challenge
   - Base64 URL encoding

2. **OAuth Flow** (TDD - 16 tests):
   - Auth URL builder with all params
   - Callback handler with error cases
   - Token exchange with Google

3. **Token Management** (TDD - 17 tests):
   - localStorage persistence
   - Expiry checks (5min buffer)
   - Refresh token flow
   - Logout

4. **Login UI**:
   - Auth component (login/logout)
   - Callback handler page
   - Material Design buttons
   - Error states with user feedback
   - Main app routing (authenticated vs login)

### Tests
- ✅ 46 tests passing (all TDD)
- ✅ Build successful
- ✅ No test failures

### Implementation Notes
- PKCE flow = secure (no client secret)
- State parameter for CSRF protection
- sessionStorage for verifier (single use)
- localStorage for tokens (persistent)
- Auto-refresh before expiry

### Google Scopes
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/userinfo.email`

### Architectural Decisions (for future ref)
**Why PKCE?**
- No client secret needed (safe for public clients like SPAs)
- SHA-256 challenge prevents code interception attacks
- Standard for OAuth in browser-based apps

**Why localStorage for tokens?**
- Need persistence across page reloads
- User stays logged in between sessions
- Trade-off: XSS vulnerability (acceptable for personal use)

**Why sessionStorage for verifier?**
- Single-use only (cleared after token exchange)
- Not needed after callback completes
- Prevents replay attacks

**Callback routing**
- Separate `callback.html` page (not SPA route)
- Simpler than client-side routing for OAuth
- Handles error states explicitly

### Current Blockers
- OAuth flow implemented but UNTESTED
- Needs Google OAuth Client ID from GCP Console
- Need to verify token refresh works (requires real tokens)

### Things to Test (when OAuth configured)
1. Full login flow end-to-end
2. Token refresh before expiry
3. Error handling (user denies access, network failure)
4. State validation (CSRF protection)
5. Mobile browser compatibility

### Technical Debt / Notes
- Token refresh logic exists but untested (needs real OAuth session)
- No offline detection yet (Phase 7)
- No user info display yet (email/name from userinfo.email scope)

### Deployment Status
- ✅ PR #4 merged to main (2025-10-30 evening)
- ✅ GH Actions deployed successfully
- ✅ Live at https://galsapir.github.io/diet-log-mini/
- ✅ Tested on mobile - shows login UI correctly
- ❌ OAuth not configured yet (expected error: "OAuth client ID not configured")

### Session End Summary (2025-10-30)
**Completed:**
- Phase 1 & 2 fully deployed
- 46 tests passing
- OAuth flow ready (needs config)

**Current State:**
- On `main` branch
- All code committed and pushed
- Ready for OAuth config OR Phase 3

**Immediate Next Steps (choose one path):**

**Path A: Test OAuth (recommended first)**
1. Get Google OAuth Client ID from GCP Console
2. Enable APIs: Sheets + Drive
3. Add client ID to GitHub repo secrets
4. Test full login flow on mobile
5. Verify token refresh works

**Path B: Continue Phase 3 (Sheets Integration)**
1. Write tests for Sheets API wrapper (TDD)
2. Implement sheet detection/creation
3. Test with OAuth later

**Recommendation:** Test OAuth first (Path A) - validates Phase 2 before building on it.
