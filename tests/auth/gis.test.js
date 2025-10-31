// ABOUTME: Tests for Google Identity Services (GIS) auth wrapper
// ABOUTME: Validates GIS initialization, token management, and error handling

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  initializeGis,
  requestAccessToken,
  getAccessToken,
  revokeToken,
  isAuthenticated,
  _resetForTesting
} from '../../src/auth/gis.js'

describe('GIS Auth', () => {
  beforeEach(() => {
    // Reset module state
    _resetForTesting()
    vi.clearAllMocks()
  })

  describe('initializeGis', () => {
    it('should initialize with client ID and scopes', async () => {
      const clientId = 'test-client-id'
      const scopes = ['https://www.googleapis.com/auth/spreadsheets']

      // Mock GIS global
      global.google = {
        accounts: {
          oauth2: {
            initTokenClient: vi.fn().mockReturnValue({})
          }
        }
      }

      global.gapi = {
        load: vi.fn((name, callback) => callback())
      }

      await initializeGis(clientId, scopes)

      expect(global.google.accounts.oauth2.initTokenClient).toHaveBeenCalledWith({
        client_id: clientId,
        scope: scopes.join(' '),
        callback: expect.any(Function)
      })
    })

    it('should throw error if client ID missing', async () => {
      await expect(initializeGis('', ['scope'])).rejects.toThrow('Client ID required')
    })

    it('should throw error if scopes empty', async () => {
      await expect(initializeGis('client-id', [])).rejects.toThrow('At least one scope required')
    })
  })

  describe('requestAccessToken', () => {
    it('should request token with consent prompt if no existing token', async () => {
      let storedCallback = null
      const mockClient = {
        callback: null,
        requestAccessToken: vi.fn()
      }

      global.google = {
        accounts: {
          oauth2: {
            initTokenClient: vi.fn((config) => {
              mockClient.callback = config.callback
              return mockClient
            })
          }
        }
      }

      global.gapi = {
        load: vi.fn((name, callback) => callback()),
        client: {
          getToken: vi.fn().mockReturnValue(null)
        }
      }

      await initializeGis('client-id', ['scope'])

      // Simulate successful token request
      const requestPromise = requestAccessToken()
      // Simulate GIS calling the callback with success
      mockClient.callback({ access_token: 'test-token' })
      await requestPromise

      expect(mockClient.requestAccessToken).toHaveBeenCalledWith({ prompt: 'consent' })
    })

    it('should request token without prompt if token exists', async () => {
      const mockClient = {
        callback: null,
        requestAccessToken: vi.fn()
      }

      global.google = {
        accounts: {
          oauth2: {
            initTokenClient: vi.fn((config) => {
              mockClient.callback = config.callback
              return mockClient
            })
          }
        }
      }

      global.gapi = {
        load: vi.fn((name, callback) => callback()),
        client: {
          getToken: vi.fn().mockReturnValue({ access_token: 'token' })
        }
      }

      await initializeGis('client-id', ['scope'])

      // Simulate successful token request
      const requestPromise = requestAccessToken()
      // Simulate GIS calling the callback with success
      mockClient.callback({ access_token: 'refreshed-token' })
      await requestPromise

      expect(mockClient.requestAccessToken).toHaveBeenCalledWith({ prompt: '' })
    })

    it('should throw error if not initialized', async () => {
      await expect(requestAccessToken()).rejects.toThrow('GIS not initialized')
    })
  })

  describe('getAccessToken', () => {
    it('should return access token from gapi', () => {
      global.gapi = {
        client: {
          getToken: vi.fn().mockReturnValue({ access_token: 'test-token' })
        }
      }

      const token = getAccessToken()
      expect(token).toBe('test-token')
    })

    it('should return null if no token', () => {
      global.gapi = {
        client: {
          getToken: vi.fn().mockReturnValue(null)
        }
      }

      const token = getAccessToken()
      expect(token).toBeNull()
    })
  })

  describe('revokeToken', () => {
    it('should revoke token and clear from gapi', async () => {
      const mockRevoke = vi.fn((token, callback) => callback())

      global.google = {
        accounts: {
          oauth2: {
            revoke: mockRevoke
          }
        }
      }

      global.gapi = {
        client: {
          getToken: vi.fn().mockReturnValue({ access_token: 'test-token' }),
          setToken: vi.fn()
        }
      }

      await revokeToken()

      expect(mockRevoke).toHaveBeenCalledWith('test-token', expect.any(Function))
      expect(global.gapi.client.setToken).toHaveBeenCalledWith(null)
    })

    it('should do nothing if no token', async () => {
      global.gapi = {
        client: {
          getToken: vi.fn().mockReturnValue(null)
        }
      }

      await expect(revokeToken()).resolves.toBeUndefined()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      global.gapi = {
        client: {
          getToken: vi.fn().mockReturnValue({ access_token: 'token' })
        }
      }

      expect(isAuthenticated()).toBe(true)
    })

    it('should return false if no token', () => {
      global.gapi = {
        client: {
          getToken: vi.fn().mockReturnValue(null)
        }
      }

      expect(isAuthenticated()).toBe(false)
    })
  })
})
