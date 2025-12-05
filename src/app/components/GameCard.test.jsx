import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import GameCard from './GameCard'

afterEach(() => cleanup())

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

const baseGame = {
  id: 1,
  title: 'Super Jeu',
  price: 19.99,
  discounted_price: null,
  cover_url: 'https://example.com/image.jpg',
  discount: 0
}

describe('GameCard', () => {
  it("affiche le titre et le prix du jeu", () => {
    renderWithRouter(<GameCard game={baseGame} />)
    expect(screen.getByText(/super jeu/i)).toBeInTheDocument()
    expect(screen.getByText(/19\.99/i)).toBeInTheDocument()
  })

  it('affiche le prix promo quand il existe', () => {
    const promoGame = { ...baseGame, discounted_price: 9.99, price: 19.99 }
    renderWithRouter(<GameCard game={promoGame} />)
    const prices = screen.getAllByText(/9\.99/)
    expect(prices.length).toBeGreaterThan(0)
  })

  it('retourne null sans jeu', () => {
    const { container } = renderWithRouter(<GameCard game={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('affiche une vignette par défaut sans couverture', () => {
    const game = { ...baseGame, cover_url: null, title: 'Zelda' }
    renderWithRouter(<GameCard game={game} />)
    expect(screen.getByText('Z')).toBeInTheDocument()
  })

  it('affiche le badge de remise', () => {
    const game = { ...baseGame, discount: 20 }
    renderWithRouter(<GameCard game={game} />)
    expect(screen.getByText(/-20%/)).toBeInTheDocument()
  })

  it('crée un lien vers la page du jeu', () => {
    renderWithRouter(<GameCard game={baseGame} />)
    const links = screen.getAllByRole('link')
    expect(links[0].getAttribute('href')).toBe(`/game/${baseGame.id}`)
  })
})
