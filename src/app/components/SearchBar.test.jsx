import React, { useState } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import SearchBar from './SearchBar'

const originalFetch = global.fetch
const originalLocation = window.location

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([])
    })
  )
  // mock location to avoid navigation errors
  delete window.location
  window.location = { href: '', assign: vi.fn() }
})

afterEach(() => {
  cleanup()
  global.fetch = originalFetch
  window.location = originalLocation
})

describe('SearchBar', () => {
  it('affiche le champ de recherche et le bouton', () => {
    render(<SearchBar value="" onChange={() => {}} />)
    const inputs = screen.getAllByRole('combobox')
    expect(inputs.length).toBeGreaterThan(0)
    const buttons = screen.getAllByRole('button', { name: /rechercher/i })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('appelle onChange quand on tape du texte', () => {
    function Wrapper() {
      const [value, setValue] = useState('')
      const handleChange = (v) => setValue(v)
      return <SearchBar value={value} onChange={handleChange} />
    }

    render(<Wrapper />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'halo' } })
    expect(input).toHaveValue('halo')
  })

  it('soumet le formulaire avec une valeur', () => {
    const handleSubmit = vi.fn()

    function Wrapper() {
      const [value, setValue] = useState('doom')
      return (
        <SearchBar
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
        />
      )
    }

    render(<Wrapper />)
    const form = screen.getByRole('search')
    fireEvent.submit(form)
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('ouvre les suggestions et permet la soumission clavier', async () => {
    const handleSubmit = vi.fn()
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: 1, title: 'Doom', cover_url: '/doom.png' }])
    })

    function Wrapper() {
      const [value, setValue] = useState('do')
      return (
        <SearchBar
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          debounceMs={0}
        />
      )
    }

    render(<Wrapper />)
    const input = screen.getByRole('combobox')
    await waitFor(() => expect(screen.getByRole('option', { name: /doom/i })).toBeInTheDocument())

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith('Doom'))
    expect(input).toHaveValue('Doom')
  })

  it('clique sur une suggestion et navigue', async () => {
    const handleSubmit = vi.fn()
    const handleChange = vi.fn()
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: 2, title: 'Halo', cover_url: '/halo.png' }])
    })

    function Wrapper() {
      const [value, setValue] = useState('ha')
      const onChange = vi.fn((v) => {
        handleChange(v)
        setValue(v)
      })
      return (
        <SearchBar
          value={value}
          onChange={onChange}
          onSubmit={handleSubmit}
          debounceMs={0}
        />
      )
    }

    render(<Wrapper />)
    await waitFor(() => expect(screen.getByRole('option', { name: /halo/i })).toBeInTheDocument())
    const option = screen.getByRole('option', { name: /halo/i })
    fireEvent.click(option)

    expect(handleChange).toHaveBeenCalledWith('Halo')
    expect(window.location.href).toContain('/game/2')
  })

  it("n'appelle pas onSubmit si le champ est vide", () => {
    const handleSubmit = vi.fn()
    render(<SearchBar value="" onChange={() => {}} onSubmit={handleSubmit} />)

    const form = screen.getByRole('search')
    fireEvent.submit(form)

    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('efface la recherche via le bouton clear', async () => {
    function Wrapper() {
      const [value, setValue] = useState('doom')
      return <SearchBar value={value} onChange={setValue} debounceMs={0} />
    }

    render(<Wrapper />)
    const clearButton = await screen.findByRole('button', { name: /effacer la recherche/i })
    fireEvent.click(clearButton)

    const input = screen.getByRole('combobox')
    expect(input).toHaveValue('')
  })
})
