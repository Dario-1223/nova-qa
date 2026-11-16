// cypress/support/commands.js
// Uso en las pruebas:
//   cy.login('COORD')        -> Coordinación (correo y contraseña)
//   cy.login('VICE')         -> Vicerrectoría con correo y contraseña (si el docente da una cuenta)
//   cy.loginViceToken()      -> Vicerrectoría con sesión de Google reutilizada (token)
// Credenciales en cypress.env.json (excluido de Git):
//   COORD_USER, COORD_PASS, VICE_USER, VICE_PASS, VICE_TOKEN

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
    rutaLogin: '/convocatorias-app/inicio-sesion',
    rutaDestino: '/convocatorias-app/vicerrectoria/avales',
    rutaLoginFragmento: 'inicio-sesion',
  },
};

// Login reutilizable por rol
Cypress.Commands.add('login', (rol) => {
  const r = ROLES[rol];

  if (!r) {
    throw new Error(`Rol desconocido: "${rol}". Use COORD o VICE.`);
  }

  // Cypress 16: las credenciales se leen con cy.env(), no con Cypress.env()
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

        // Se pulsa por texto exacto para no confundirlo con
        // el botón "Iniciar sesión con Google"
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

// ---------------------------------------------------------------------------
// Vicerrectoría: reutiliza la sesión de Google guardada en la cookie "token".
// Requiere "VICE_TOKEN" en cypress.env.json (se actualiza con: node scripts/token.js).
// El token dura 50 minutos. Si está vencido, este comando falla con un mensaje claro
// en vez de dejar que las pruebas fallen por 401.
// ---------------------------------------------------------------------------
function minutosRestantes(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const datos = JSON.parse(atob(payload));
    return Math.floor((datos.exp * 1000 - Date.now()) / 60000);
  } catch (e) {
    return null;
  }
}

Cypress.Commands.add('loginViceToken', () => {
  cy.env(['VICE_TOKEN']).then(({ VICE_TOKEN }) => {
    if (!VICE_TOKEN) {
      throw new Error('Falta VICE_TOKEN en cypress.env.json. Ejecute: node scripts/token.js');
    }

    const min = minutosRestantes(VICE_TOKEN);
    if (min === null) {
      throw new Error('VICE_TOKEN no tiene formato de token valido. Ejecute: node scripts/token.js');
    }
    if (min <= 0) {
      throw new Error(
        `TOKEN VENCIDO hace ${Math.abs(min)} min. Inicie sesion con Google, copie la cookie token y ejecute: node scripts/token.js`
      );
    }

    cy.log(`Token vigente: quedan ${min} min`);

    // El final del token va en el id de la sesion: si cambia el token, no se reutiliza la cache vieja
    cy.session(
      ['login-token', 'VICE', VICE_TOKEN.slice(-12)],
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

// Login manual para pruebas negativas (usa el login general de Nova)
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