import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Login page', () => {
  it('affiche le titre de connexion', () => {
    renderWithRouter(<Login />)
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument()
  })

  it('affiche les champs courriel et mot de passe', () => {
    renderWithRouter(<Login />)
    expect(screen.getByLabelText(/courriel/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  it('permet de saisir courriel et mot de passe', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Login />)

    const emailInput = screen.getByLabelText(/courriel/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'monSuperMotDePasse123')

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('monSuperMotDePasse123')
  })

  it('affiche le bouton pour se connecter et le lien inscription', () => {
    renderWithRouter(<Login />)
    const buttons = screen.getAllByRole('button', { name: /se connecter/i })
    expect(buttons.length).toBeGreaterThan(0)

    const links = screen.getAllByRole('link', {
      name: /aucun compte\? inscrivez-vous ici/i
    })
    expect(links.length).toBeGreaterThan(0)
  })
})
