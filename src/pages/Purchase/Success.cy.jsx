import React from 'react'
import Success from './Success'

describe('<Success />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Success />)
  })
})