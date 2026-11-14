
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
it('CP-02 - Login con credenciales inválidas no permite el acceso', () => {
  // Usuario inventado: no corresponde a ninguna cuenta real
  const usuarioInvalido = 'usuario_prueba_inexistente@example.com';
  const claveInvalida = 'ClaveIncorrecta_123';

  cy.visit('/login');

  cy.get('#email').clear().type(usuarioInvalido);
  cy.get('#password').clear().type(claveInvalida, { log: false });
  cy.get('form button[type="submit"]').click();

  // 1. No debe salir de la pantalla de login
  cy.location('pathname', { timeout: 15000 }).should('include', '/login');

  // 2. Debe seguir viéndose el formulario (no hubo acceso)
  cy.get('#email').should('be.visible');
  cy.get('#password').should('be.visible');

  // 3. No debe haberse guardado ninguna sesión
  cy.getCookies().then((cookies) => {
    const sesion = cookies.filter((c) => /token|session|auth/i.test(c.name));
    expect(sesion, 'cookies de sesión').to.have.length(0);
  });
});
});


