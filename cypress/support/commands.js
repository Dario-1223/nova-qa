
const SEL = {
  usuario: '#email',
  clave: '#password',
  ingresar: 'form button[type="submit"]',
};

const RUTA_LOGIN = '/login';

const ROLES = {
  COORD: {
    user: 'COORD_USER',
    pass: 'COORD_PASS',
  },
  VICE: {
    user: 'VICE_USER',
    pass: 'VICE_PASS',
  },
};

// Login reutilizable por rol
Cypress.Commands.add('login', (rol) => {
  const r = ROLES[rol];

  if (!r) {
    throw new Error(`Rol desconocido: "${rol}". Use COORD o VICE.`);
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
      cy.visit(RUTA_LOGIN);

      cy.get(SEL.usuario).clear().type(usuario, { log: false });
      cy.get(SEL.clave).clear().type(clave, { log: false });

      cy.get(SEL.ingresar).click();

      cy.location('pathname', { timeout: 15000 })
        .should('not.include', '/login');
    },
    {
      validate() {
        cy.visit('/');
        cy.location('pathname')
          .should('not.include', '/login');
      },
      cacheAcrossSpecs: true,
    }
  );
});

// Login manual para pruebas negativas
Cypress.Commands.add('loginManual', (usuario, clave) => {
  cy.visit(RUTA_LOGIN);

  if (usuario) {
    cy.get(SEL.usuario).clear().type(usuario, { log: false });
  }

  if (clave) {
    cy.get(SEL.clave).clear().type(clave, { log: false });
  }

  cy.get(SEL.ingresar).click();
});
