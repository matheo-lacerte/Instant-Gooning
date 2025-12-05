import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Cart from './Cart'

const originalFetch = global.fetch

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (String(url).includes('/api/payments/cart')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            cart_id: '123',
            items: []
          })
      })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
})

afterEach(() => {
  global.fetch = originalFetch
})

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Cart page', () => {
  it("affiche un message quand le panier est vide", async () => {
    renderWithRouter(<Cart />)

    const emptyText = await screen.findByText(/votre panier est vide/i)
    expect(emptyText).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /continuer vos achats/i })
    expect(link).toBeInTheDocument()
  })
})
