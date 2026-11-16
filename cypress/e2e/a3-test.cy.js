
describe('Verificación A3 - Comandos personalizados', () => {

  it('Cypress reconoce cy.login y cy.loginManual', () => {

    expect(cy.login).to.be.a('function');

    expect(cy.loginManual).to.be.a('function');

  });

});
