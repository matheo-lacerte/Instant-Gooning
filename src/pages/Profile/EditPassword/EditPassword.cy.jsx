import React from 'react'
import EditPassword from './EditPassword'

describe('<EditPassword />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<EditPassword />)
  })
})