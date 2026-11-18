import { RUTA_LOGIN, RUTA_PANEL } from '../support/rutas';

describe('Login y sesión', () => {

  // ---------- CP-01: login exitoso (positivo) ----------
  it('CP-01.1 - Coordinación inicia sesión correctamente', () => {
    cy.login('COORD'); // falla con mensaje claro si no hay credenciales reales
    cy.visit(RUTA_PANEL);

    // Con sesión iniciada existe el botón "Cerrar sesión"
    cy.contains('button', 'Cerrar sesión', { timeout: 15000 }).should('be.visible');
    // PENDIENTE: agregar cy.contains('<título real del panel de Coordinación>')
  });

  it('CP-01.2 - Vicerrectoría inicia sesión correctamente', () => {
    cy.login('VICE');
    cy.visit(RUTA_PANEL);

    cy.contains('Gestión de Avales', { timeout: 15000 }).should('be.visible');
    cy.contains('button', 'Cerrar sesión').should('be.visible');
  });

  // ---------- CP-02: credenciales inválidas (negativo) ----------
  it('CP-02 - Login con credenciales inválidas no permite el acceso', () => {
    // Valores inventados a propósito: no corresponden a ninguna cuenta real
    const usuarioInvalido = 'usuario_prueba_inexistente@example.com';
    const claveInvalida = 'ClaveIncorrecta_123'; // longitud válida, para que llegue al servidor

    cy.intercept('POST', '**/api/login/').as('login');

    cy.visit(RUTA_LOGIN);

    cy.get('#email').clear().type(usuarioInvalido);
    cy.get('#password').clear().type(claveInvalida, { log: false });
    cy.get('form button[type="submit"]').click();

    // 1. El servidor rechaza el acceso (evidencia principal)
    cy.wait('@login').its('response.statusCode').should('eq', 401);

    // 2. Mensaje al usuario (secundario: el toast dura ~2 s)
    cy.contains('Credenciales incorrectas', { timeout: 10000 }).should('exist');
    cy.screenshot('CP-02-login-rechazado');

    // 3. Sigue en la pantalla de login
    cy.location('pathname').should('include', RUTA_LOGIN);
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');

    // 4. No debe haberse guardado ninguna sesión
    cy.getCookies().then((cookies) => {
      const sesion = cookies.filter((c) => /token|session|auth/i.test(c.name));
      expect(sesion, 'cookies de sesión').to.have.length(0);
    });
  });

  // ---------- CP-02a: contraseña demasiado corta (negativo) ----------
  it('CP-02a - Contraseña demasiado corta muestra validación', () => {
    cy.visit(RUTA_LOGIN);

    cy.get('#email').clear().type('usuario_prueba_inexistente@example.com');
    cy.get('#password').clear().type('abc', { log: false }); // PENDIENTE: confirmar longitud que dispara el mensaje
    cy.get('form button[type="submit"]').click();

    cy.contains('Contraseña muy corta').should('be.visible');
    cy.location('pathname').should('include', RUTA_LOGIN);
  });

  // ---------- CP-03: campos vacíos (negativo) ----------
  it('CP-03 - Login con campos vacíos no permite el acceso', () => {
    cy.visit(RUTA_LOGIN);

    // Los campos se dejan vacíos a propósito
    cy.get('#email').clear();
    cy.get('#password').clear();
    cy.get('form button[type="submit"]').click();

    cy.location('pathname').should('include', RUTA_LOGIN);
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');

    cy.getCookies().then((cookies) => {
      const sesion = cookies.filter((c) => /token|session|auth/i.test(c.name));
      expect(sesion, 'cookies de sesión').to.have.length(0);
    });

    cy.screenshot('CP-03-campos-vacios');
  });

  // ---------- CP-04: cierre de sesión (positivo) ----------
  // Correrlo al final: cerrar sesión probablemente invalida el token
  it('CP-04 - Vicerrectoría cierra sesión y pierde el acceso', () => {
    cy.login('VICE');
    cy.visit(RUTA_PANEL);

    // 1. Con sesión iniciada se ve el panel y el botón de cerrar sesión
    cy.contains('Gestión de Avales', { timeout: 15000 }).should('be.visible');
    cy.contains('button', 'Cerrar sesión').should('be.visible');

    // 2. Cerrar sesión
    cy.contains('button', 'Cerrar sesión').click();

    // 3. Redirige a la pantalla de login
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