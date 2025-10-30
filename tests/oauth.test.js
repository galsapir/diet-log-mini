// ABOUTME: Tests for OAuth 2.0 flow with Google
// ABOUTME: Validates authorization URL building, callback handling, and token exchange

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildAuthUrl, handleCallback, exchangeCodeForTokens } from '../src/auth/oauth'

describe('OAuth Flow', () => {
  const mockConfig = {
    clientId: 'test-client-id.apps.googleusercontent.com',
    redirectUri: 'http://localhost:5173/callback',
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
  }

  describe('buildAuthUrl', () => {
    it('should build valid Google OAuth URL', async () => {
      const { url, verifier } = await buildAuthUrl(mockConfig)

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth')
      expect(verifier).toBeTruthy()
    })

    it('should include client_id parameter', async () => {
      const { url } = await buildAuthUrl(mockConfig)
      const urlObj = new URL(url)

      expect(urlObj.searchParams.get('client_id')).toBe(mockConfig.clientId)
    })

    it('should include redirect_uri parameter', async () => {
      const { url } = await buildAuthUrl(mockConfig)
      const urlObj = new URL(url)

      expect(urlObj.searchParams.get('redirect_uri')).toBe(mockConfig.redirectUri)
    })

    it('should include response_type=code', async () => {
      const { url } = await buildAuthUrl(mockConfig)
      const urlObj = new URL(url)

      expect(urlObj.searchParams.get('response_type')).toBe('code')
    })

    it('should include scope parameter with correct scopes', async () => {
      const { url } = await buildAuthUrl(mockConfig)
      const urlObj = new URL(url)
      const scope = urlObj.searchParams.get('scope')

      expect(scope).toContain('https://www.googleapis.com/auth/spreadsheets')
      expect(scope).toContain('https://www.googleapis.com/auth/drive.file')
    })

    it('should include PKCE parameters', async () => {
      const { url } = await buildAuthUrl(mockConfig)
      const urlObj = new URL(url)

      expect(urlObj.searchParams.get('code_challenge')).toBeTruthy()
      expect(urlObj.searchParams.get('code_challenge_method')).toBe('S256')
    })

    it('should include state parameter for CSRF protection', async () => {
      const { url } = await buildAuthUrl(mockConfig)
      const urlObj = new URL(url)

      expect(urlObj.searchParams.get('state')).toBeTruthy()
    })

    it('should generate different state on each call', async () => {
      const { url: url1 } = await buildAuthUrl(mockConfig)
      const { url: url2 } = await buildAuthUrl(mockConfig)

      const state1 = new URL(url1).searchParams.get('state')
      const state2 = new URL(url2).searchParams.get('state')

      expect(state1).not.toBe(state2)
    })
  })

  describe('handleCallback', () => {
    it('should extract code from URL', () => {
      const callbackUrl = 'http://localhost:5173/callback?code=test-auth-code&state=test-state'
      const result = handleCallback(callbackUrl)

      expect(result.code).toBe('test-auth-code')
    })

    it('should extract state from URL', () => {
      const callbackUrl = 'http://localhost:5173/callback?code=test-code&state=test-state-value'
      const result = handleCallback(callbackUrl)

      expect(result.state).toBe('test-state-value')
    })

    it('should return error when code is missing', () => {
      const callbackUrl = 'http://localhost:5173/callback?state=test-state'
      const result = handleCallback(callbackUrl)

      expect(result.error).toBe('Missing authorization code')
    })

    it('should extract error from URL when present', () => {
      const callbackUrl = 'http://localhost:5173/callback?error=access_denied&error_description=User+denied+access'
      const result = handleCallback(callbackUrl)

      expect(result.error).toBe('access_denied')
      expect(result.errorDescription).toBeTruthy()
    })
  })

  describe('exchangeCodeForTokens', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
    })

    it('should call Google token endpoint', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600
        })
      })

      const code = 'test-auth-code'
      const verifier = 'test-code-verifier'

      await exchangeCodeForTokens(code, verifier, mockConfig)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })

    it('should return access token, refresh token, and expiry', async () => {
      const mockResponse = {
        access_token: 'ya29.test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await exchangeCodeForTokens('code', 'verifier', mockConfig)

      expect(result.accessToken).toBe('ya29.test-access-token')
      expect(result.refreshToken).toBe('test-refresh-token')
      expect(result.expiresIn).toBe(3600)
    })

    it('should throw error on failed request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'invalid_grant' })
      })

      await expect(
        exchangeCodeForTokens('bad-code', 'verifier', mockConfig)
      ).rejects.toThrow()
    })

    it('should include code verifier in request body', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token',
          expires_in: 3600
        })
      })

      const verifier = 'specific-verifier-string'
      await exchangeCodeForTokens('code', verifier, mockConfig)

      const callArgs = global.fetch.mock.calls[0][1]
      const body = new URLSearchParams(callArgs.body)

      expect(body.get('code_verifier')).toBe(verifier)
    })
  })
})
