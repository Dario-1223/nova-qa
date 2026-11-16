
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
  // Valores inventados a propósito: no corresponden a ninguna cuenta real
  const usuarioInvalido = 'usuario_prueba_inexistente@example.com';
  const claveInvalida = 'ClaveIncorrecta_123'; // longitud válida, para que llegue al servidor

  cy.visit('/login');

  cy.get('#email').clear().type(usuarioInvalido);
  cy.get('#password').clear().type(claveInvalida, { log: false });
  cy.get('form button[type="submit"]').click();

  // Mensaje real observado en la aplicación (toast con role="alert")
  cy.get('[role="alert"]', { timeout: 10000 })
    .should('be.visible')
    .and('contain.text', 'Credenciales incorrectas');

  // No debe salir de la pantalla de login
  cy.location('pathname').should('include', '/login');
  cy.get('#email').should('be.visible');
  cy.get('#password').should('be.visible');

  // No debe haberse guardado ninguna sesión
  cy.getCookies().then((cookies) => {
    const sesion = cookies.filter((c) => /token|session|auth/i.test(c.name));
    expect(sesion, 'cookies de sesión').to.have.length(0);
  });

  cy.screenshot('CP-02-login-rechazado');
});

it('CP-03 - Login con campos vacíos no permite el acceso', () => {
  cy.visit('/login');

  // Los campos se dejan vacíos a propósito
  cy.get('#email').clear();
  cy.get('#password').clear();
  cy.get('form button[type="submit"]').click();

  // 1. No debe salir de la pantalla de login
  cy.location('pathname').should('include', '/login');

  // 2. El formulario debe seguir visible
  cy.get('#email').should('be.visible');
  cy.get('#password').should('be.visible');

  // 3. No debe haberse guardado ninguna sesión
  cy.getCookies().then((cookies) => {
    const sesion = cookies.filter((c) => /token|session|auth/i.test(c.name));
    expect(sesion, 'cookies de sesión').to.have.length(0);
  });

  cy.screenshot('CP-03-campos-vacios');
});
// ---------- CP-04: cierre de sesión (positivo) ----------
  // Ruta real de la pantalla de login (observada en el navegador)
const RUTA_LOGIN = '/convocatorias-app/inicio-sesion';

it('CP-04 - Vicerrectoría cierra sesión y pierde el acceso', () => {
  cy.login('VICE');
  cy.visit('/'); // PENDIENTE: reemplazar por la ruta real del panel si '/' no lo muestra

  // 1. Con sesión iniciada se ve el panel y el botón de cerrar sesión
  cy.contains('Gestión de Avales', { timeout: 15000 }).should('be.visible');
  cy.contains('button', 'Cerrar sesión').should('be.visible');

  // 2. Cerrar sesión
  cy.contains('button', 'Cerrar sesión').click();

  // 3. Redirige a la pantalla de login (ruta observada por un compañero con rol Vicerrectoría)
  cy.location('pathname', { timeout: 15000 }).should('include', RUTA_LOGIN);
  cy.get('#email').should('be.visible');
  cy.get('#password').should('be.visible');

  // 4. El panel ya no está visible
  cy.contains('Gestión de Avales').should('not.exist');

  cy.screenshot('CP-04-sesion-cerrada');

  // 5. Al volver atrás no debe recuperarse el panel
  cy.go('back');
  cy.contains('Gestión de Avales').should('not.exist');

  cy.screenshot('CP-04-atras-sin-acceso');
});

});


