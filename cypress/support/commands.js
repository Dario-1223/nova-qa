// cypress/support/commands.js
// Uso en las pruebas:
//   cy.login('COORD')        -> Coordinación (correo y contraseña)
//   cy.login('VICE')         -> Vicerrectoría con correo y contraseña (si el docente da una cuenta)
//   cy.loginViceToken()      -> Vicerrectoría con sesión de Google reutilizada (cookie token)
// Credenciales en cypress.env.json (excluido de Git):
//   COORD_USER, COORD_PASS, VICE_USER, VICE_PASS, VICE_TOKEN

const SEL = {
  usuario: 'input[type="email"]',
  clave: 'input[type="password"]',
  ingresar: 'button[type="submit"]',
};

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
    rutaLogin: '/convocatorias-app/inicio-sesion',
    rutaDestino: '/convocatorias-app/vicerrectoria/avales',
    rutaLoginFragmento: 'inicio-sesion',
  },
};

Cypress.Commands.add('login', (rol) => {
  const r = ROLES[rol];

  if (!r) {
    throw new Error(`Rol desconocido: "${rol}". Use COORD o VICE.`);
  }

  cy.env([r.user, r.pass]).then((env) => {
    const usuario = env[r.user];
    const clave = env[r.pass];

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

        cy.contains('button', 'Iniciar Sesión').click();

        cy.location('pathname', { timeout: 15000 })
          .should('not.include', r.rutaLoginFragmento);
      },
      {
        validate() {
          cy.visit(r.rutaDestino);
          cy.location('pathname')
            .should('not.include', r.rutaLoginFragmento);
        },
        cacheAcrossSpecs: true,
      }
    );
  });
});

// Vicerrectoría: reutiliza la sesión de Google guardada en la cookie "token".
// Requiere "VICE_TOKEN" en cypress.env.json. El token caduca: si falla, copie uno nuevo.
Cypress.Commands.add('loginViceToken', () => {
  cy.env(['VICE_TOKEN']).then(({ VICE_TOKEN }) => {
    if (!VICE_TOKEN) {
      throw new Error('Falta VICE_TOKEN en cypress.env.json');
    }

    cy.session(
      ['login-token', 'VICE'],
      () => {
        cy.visit('/convocatorias-app/inicio-sesion');
        cy.setCookie('token', VICE_TOKEN, { path: '/' });
      },
      {
        validate() {
          cy.visit('/convocatorias-app/vicerrectoria/avales');
          cy.location('pathname').should('not.include', 'inicio-sesion');
        },
      }
    );
  });
});

const RUTA_LOGIN = '/login';
Cypress.Commands.add('loginManual', (usuario, clave) => {
  cy.visit(RUTA_LOGIN);

  if (usuario) {
    cy.get('#email').clear().type(usuario, { log: false });
  }

  if (clave) {
    cy.get('#password').clear().type(clave, { log: false });
  }

  cy.get('form button[type="submit"]').click();
});