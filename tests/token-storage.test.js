// ABOUTME: Tests for OAuth token storage and management
// ABOUTME: Validates localStorage persistence, expiry checks, and token refresh

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveTokens,
  getTokens,
  clearTokens,
  isTokenExpired,
  refreshAccessToken
} from '../src/auth/token-storage'

describe('Token Storage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('saveTokens', () => {
    it('should save tokens to localStorage', () => {
      const tokens = {
        accessToken: 'ya29.test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600
      }

      saveTokens(tokens)

      const stored = localStorage.getItem('auth_tokens')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored)
      expect(parsed.accessToken).toBe(tokens.accessToken)
      expect(parsed.refreshToken).toBe(tokens.refreshToken)
    })

    it('should calculate and store expiry timestamp', () => {
      const beforeSave = Date.now()
      const tokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600
      }

      saveTokens(tokens)

      const stored = JSON.parse(localStorage.getItem('auth_tokens'))
      const expectedExpiry = beforeSave + (3600 * 1000)

      // Allow 1 second tolerance for test execution time
      expect(stored.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - 1000)
      expect(stored.expiresAt).toBeLessThanOrEqual(expectedExpiry + 1000)
    })
  })

  describe('getTokens', () => {
    it('should retrieve stored tokens', () => {
      const tokens = {
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: Date.now() + 3600000
      }

      localStorage.setItem('auth_tokens', JSON.stringify(tokens))

      const retrieved = getTokens()
      expect(retrieved.accessToken).toBe('test-token')
      expect(retrieved.refreshToken).toBe('test-refresh')
    })

    it('should return null when no tokens stored', () => {
      const retrieved = getTokens()
      expect(retrieved).toBeNull()
    })

    it('should return null when localStorage has invalid JSON', () => {
      localStorage.setItem('auth_tokens', 'invalid-json')

      const retrieved = getTokens()
      expect(retrieved).toBeNull()
    })
  })

  describe('clearTokens', () => {
    it('should remove tokens from localStorage', () => {
      localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: 'token',
        refreshToken: 'refresh'
      }))

      clearTokens()

      expect(localStorage.getItem('auth_tokens')).toBeNull()
    })

    it('should not throw error when no tokens exist', () => {
      expect(() => clearTokens()).not.toThrow()
    })
  })

  describe('isTokenExpired', () => {
    it('should return false for unexpired token', () => {
      const tokens = {
        accessToken: 'token',
        expiresAt: Date.now() + 3600000 // 1 hour from now
      }

      expect(isTokenExpired(tokens)).toBe(false)
    })

    it('should return true for expired token', () => {
      const tokens = {
        accessToken: 'token',
        expiresAt: Date.now() - 1000 // 1 second ago
      }

      expect(isTokenExpired(tokens)).toBe(true)
    })

    it('should return true when expiring within 5 minutes', () => {
      const tokens = {
        accessToken: 'token',
        expiresAt: Date.now() + (4 * 60 * 1000) // 4 minutes from now
      }

      expect(isTokenExpired(tokens)).toBe(true)
    })

    it('should return true when tokens is null', () => {
      expect(isTokenExpired(null)).toBe(true)
    })

    it('should return true when expiresAt is missing', () => {
      const tokens = {
        accessToken: 'token'
        // expiresAt missing
      }

      expect(isTokenExpired(tokens)).toBe(true)
    })
  })

  describe('refreshAccessToken', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
    })

    it('should call Google token endpoint with refresh token', async () => {
      const mockTokens = {
        refreshToken: 'test-refresh-token'
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          expires_in: 3600
        })
      })

      const config = { clientId: 'test-client-id' }
      await refreshAccessToken(mockTokens, config)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST'
        })
      )

      const callArgs = global.fetch.mock.calls[0][1]
      const body = new URLSearchParams(callArgs.body)
      expect(body.get('refresh_token')).toBe('test-refresh-token')
      expect(body.get('grant_type')).toBe('refresh_token')
    })

    it('should return new access token and expiry', async () => {
      const mockTokens = {
        refreshToken: 'refresh-token'
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          expires_in: 3600
        })
      })

      const config = { clientId: 'test-client-id' }
      const result = await refreshAccessToken(mockTokens, config)

      expect(result.accessToken).toBe('new-access-token')
      expect(result.expiresIn).toBe(3600)
    })

    it('should preserve existing refresh token', async () => {
      const mockTokens = {
        refreshToken: 'original-refresh-token'
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          expires_in: 3600
        })
      })

      const config = { clientId: 'test-client-id' }
      const result = await refreshAccessToken(mockTokens, config)

      expect(result.refreshToken).toBe('original-refresh-token')
    })

    it('should throw error when refresh token is missing', async () => {
      const mockTokens = {}
      const config = { clientId: 'test-client-id' }

      await expect(
        refreshAccessToken(mockTokens, config)
      ).rejects.toThrow('No refresh token available')
    })

    it('should throw error on failed refresh', async () => {
      const mockTokens = {
        refreshToken: 'invalid-refresh-token'
      }

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'invalid_grant' })
      })

      const config = { clientId: 'test-client-id' }

      await expect(
        refreshAccessToken(mockTokens, config)
      ).rejects.toThrow()
    })
  })
})
