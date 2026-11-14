// cypress/support/commands.js
// Uso en las pruebas:  cy.login('COORD')  o  cy.login('VICE')
// Credenciales en cypress.env.json (excluido de Git):
//   COORD_USER, COORD_PASS, VICE_USER, VICE_PASS

// Selectores genéricos (confirmar con el HTML real de cada pantalla de login)
const SEL = {
  usuario: 'input[type="email"]',
  clave: 'input[type="password"]',
  ingresar: 'button[type="submit"]',
};

// Cada rol tiene su propia pantalla de login y su ruta de destino
const ROLES = {
  COORD: {
    user: 'COORD_USER',
    pass: 'COORD_PASS',
    rutaLogin: '/convocatorias-app/inicio-sesion',
    rutaDestino: '/convocatorias-app/coordinador',
    rutaLoginFragmento: 'inicio-sesion',
  },
  VICE: {
    user: 'VICE_USER',
    pass: 'VICE_PASS',
    rutaLogin: '/login', // confirmar con quien tenga el rol Vicerrectoría
    rutaDestino: '/',
    rutaLoginFragmento: '/login',
  },
};

Cypress.Commands.add('login', (rol) => {
  const r = ROLES[rol];
  if (!r) {
    throw new Error(`Rol desconocido: "${rol}". Use 'COORD' o 'VICE'.`);
  }

  const usuario = Cypress.env(r.user);
  const clave = Cypress.env(r.pass);

  if (!usuario || !clave) {
    throw new Error(
      `Faltan las credenciales ${r.user} / ${r.pass} en cypress.env.json`
    );
  }

  cy.session(
    ['login', rol],
    () => {
      cy.visit(r.rutaLogin);
      cy.get(SEL.usuario).clear().type(usuario, { log: false });
      cy.get(SEL.clave).clear().type(clave, { log: false });
      cy.get(SEL.ingresar).click();
      cy.location('pathname', { timeout: 15000 }).should(
        'not.include',
        r.rutaLoginFragmento
      );
    },
    {
      validate() {
        cy.visit(r.rutaDestino);
        cy.location('pathname').should('not.include', r.rutaLoginFragmento);
      },
      cacheAcrossSpecs: true,
    }
  );
});

// loginManual: se deja igual que el original (usa /login de Nova)
const RUTA_LOGIN = '/login';
Cypress.Commands.add('loginManual', (usuario, clave) => {
  cy.visit(RUTA_LOGIN);
  if (usuario) cy.get('#email').clear().type(usuario, { log: false });
  if (clave) cy.get('#password').clear().type(clave, { log: false });
  cy.get('form button[type="submit"]').click();
});