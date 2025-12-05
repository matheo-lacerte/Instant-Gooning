import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from './Home'

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Home page', () => {
  it('affiche les sections principales', () => {
    renderWithRouter(<Home />)
    expect(screen.getByRole('heading', { name: /filtres rapides/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /tous les jeux/i })).toBeInTheDocument()
  })

  it('affiche la barre de recherche et le bouton', () => {
    renderWithRouter(<Home />)
    const searchInputs = screen.getAllByRole('combobox')
    expect(searchInputs.length).toBeGreaterThan(0)

    const searchButtons = screen.getAllByRole('button', { name: /rechercher/i })
    expect(searchButtons.length).toBeGreaterThan(0)
  })

  it('affiche les principaux filtres de prix', () => {
    renderWithRouter(<Home />)
    const toutButtons = screen.getAllByRole('button', { name: /tout/i })
    expect(toutButtons.length).toBeGreaterThan(0)

    const less20Buttons = screen.getAllByRole('button', { name: /< 20\$/i })
    expect(less20Buttons.length).toBeGreaterThan(0)

    const more100Buttons = screen.getAllByRole('button', { name: /> 100\$/i })
    expect(more100Buttons.length).toBeGreaterThan(0)
  })
})
