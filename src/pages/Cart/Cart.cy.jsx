import React from 'react'
import Cart from './Cart'

describe('<Cart />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Cart />)
  })
})