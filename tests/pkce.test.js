// ABOUTME: Tests for OAuth PKCE (Proof Key for Code Exchange) utilities
// ABOUTME: Validates code verifier generation, SHA-256 hashing, and base64url encoding

import { describe, it, expect } from 'vitest'
import { generateCodeVerifier, generateCodeChallenge, base64UrlEncode } from '../src/auth/pkce'

describe('PKCE Utilities', () => {
  describe('generateCodeVerifier', () => {
    it('should generate a random string', () => {
      const verifier = generateCodeVerifier()
      expect(verifier).toBeTruthy()
      expect(typeof verifier).toBe('string')
    })

    it('should generate string between 43-128 characters', () => {
      const verifier = generateCodeVerifier()
      expect(verifier.length).toBeGreaterThanOrEqual(43)
      expect(verifier.length).toBeLessThanOrEqual(128)
    })

    it('should generate different values on each call', () => {
      const verifier1 = generateCodeVerifier()
      const verifier2 = generateCodeVerifier()
      expect(verifier1).not.toBe(verifier2)
    })

    it('should only contain URL-safe characters', () => {
      const verifier = generateCodeVerifier()
      // Should match [A-Za-z0-9\-._~]+
      expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/)
    })
  })

  describe('base64UrlEncode', () => {
    it('should encode Uint8Array to base64url string', () => {
      const input = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
      const encoded = base64UrlEncode(input)
      expect(encoded).toBe('SGVsbG8')
    })

    it('should replace + with -', () => {
      // Test data that produces + in standard base64
      const input = new Uint8Array([251, 239]) // Produces "++" in base64
      const encoded = base64UrlEncode(input)
      expect(encoded).not.toContain('+')
      expect(encoded).toContain('-')
    })

    it('should replace / with _', () => {
      // Test data that produces / in standard base64
      const input = new Uint8Array([255, 239]) // Produces "/" in base64
      const encoded = base64UrlEncode(input)
      expect(encoded).not.toContain('/')
    })

    it('should remove padding =', () => {
      const input = new Uint8Array([72, 101, 108, 108, 111]) // "Hello" (padded in base64)
      const encoded = base64UrlEncode(input)
      expect(encoded).not.toContain('=')
    })
  })

  describe('generateCodeChallenge', () => {
    it('should generate SHA-256 hash of verifier', async () => {
      const verifier = 'test-verifier-string-for-pkce-flow'
      const challenge = await generateCodeChallenge(verifier)

      expect(challenge).toBeTruthy()
      expect(typeof challenge).toBe('string')
      expect(challenge).not.toBe(verifier)
    })

    it('should generate same challenge for same verifier', async () => {
      const verifier = 'consistent-verifier-string'
      const challenge1 = await generateCodeChallenge(verifier)
      const challenge2 = await generateCodeChallenge(verifier)

      expect(challenge1).toBe(challenge2)
    })

    it('should generate different challenges for different verifiers', async () => {
      const challenge1 = await generateCodeChallenge('verifier-one')
      const challenge2 = await generateCodeChallenge('verifier-two')

      expect(challenge1).not.toBe(challenge2)
    })

    it('should only contain URL-safe base64 characters', async () => {
      const verifier = generateCodeVerifier()
      const challenge = await generateCodeChallenge(verifier)

      expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/)
      expect(challenge).not.toContain('+')
      expect(challenge).not.toContain('/')
      expect(challenge).not.toContain('=')
    })
  })
})
