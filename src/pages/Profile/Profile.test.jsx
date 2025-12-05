import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Profile from './Profile'

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Profile page', () => {
  it('affiche la section informations du compte et les champs', () => {
    renderWithRouter(<Profile />)

    expect(
      screen.getByRole('heading', { name: /informations du compte/i })
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/nom d'utilisateur/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^nom$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/adresse courriel/i)).toBeInTheDocument()
  })
})
