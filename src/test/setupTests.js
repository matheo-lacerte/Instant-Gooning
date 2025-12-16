import '@testing-library/jest-dom/vitest'
import { vi, beforeAll, afterAll } from 'vitest'

// Provide a simple fetch stub for relative /api calls during tests
const originalFetch = globalThis.fetch

beforeAll(() => {
	vi.stubGlobal('fetch', async (input, init) => {
		const url = typeof input === 'string' ? input : input?.url

		// Intercept app API calls to avoid hitting network in unit tests
		if (typeof url === 'string' && url.startsWith('/api/')) {
			return new Response(JSON.stringify([]), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		}

		// Fallback to original fetch for other absolute URLs if needed
		return originalFetch(input, init)
	})
})

afterAll(() => {
	vi.stubGlobal('fetch', originalFetch)
})
