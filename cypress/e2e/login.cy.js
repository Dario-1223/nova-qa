
describe('CP-01 - Login exitoso por rol', () => {

  it('CP-01.1 - Coordinación inicia sesión correctamente', () => {

    cy.login('COORD');

    cy.location('pathname', { timeout: 15000 })
      .should('not.include', '/login');

  });

  it('CP-01.2 - Vicerrectoría inicia sesión correctamente', () => {

    cy.login('VICE');

    cy.location('pathname', { timeout: 15000 })
      .should('not.include', '/login');

  });

});
