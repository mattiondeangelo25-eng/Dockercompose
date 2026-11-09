import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock fetch for tests
global.fetch = vi.fn()

// Setup function to create mock responses
export const createFetchResponse = (data) => {
  return { 
    ok: true, 
    json: () => new Promise((resolve) => resolve(data)) 
  }
}