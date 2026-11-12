// cypress/support/commands.js
// Comando personalizado para iniciar sesión según el rol.
// Uso en las pruebas:  cy.login('COORD')  o  cy.login('VICE')
//
// Las credenciales se leen de cypress.env.json (excluido de Git):
//   COORD_USER, COORD_PASS, VICE_USER, VICE_PASS

// ---------------------------------------------------------------
// SELECTORES DE LA PANTALLA DE LOGIN (tomados de /login de NOVA)
//   <input type="email" id="email" name="email">
//   <input type="password" id="password" name="password">
//   <button type="submit">Iniciar Sesión</button>
// ---------------------------------------------------------------
const SEL = {
  usuario: '#email',
  clave: '#password',
  ingresar: 'form button[type="submit"]',
};

// Ruta de la página de login (relativa a baseUrl)
const RUTA_LOGIN = '/login';

const ROLES = {
  COORD: { user: 'COORD_USER', pass: 'COORD_PASS' },
  VICE: { user: 'VICE_USER', pass: 'VICE_PASS' },
};

/**
 * Inicia sesión con el rol indicado y guarda la sesión con cy.session,
 * para no repetir el login en cada prueba (más rápido y menos peticiones al servidor).
 * @param {'COORD'|'VICE'} rol
 */
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
      cy.visit(RUTA_LOGIN);
      cy.get(SEL.usuario).clear().type(usuario, { log: false });
      cy.get(SEL.clave).clear().type(clave, { log: false });
      cy.get(SEL.ingresar).click();
      // Login exitoso = la app sale de /login.
      // Cuando tengan credenciales, pueden agregar además un elemento
      // que solo se vea ya dentro (menú, nombre del usuario, etc.).
      cy.location('pathname', { timeout: 15000 }).should('not.include', '/login');
    },
    {
      // Si la sesión guardada expiró, se vuelve a iniciar sesión.
      validate() {
        cy.visit('/');
        cy.location('pathname').should('not.include', '/login');
      },
      cacheAcrossSpecs: true,
    }
  );
});

/**
 * Intenta iniciar sesión con datos arbitrarios SIN guardar sesión.
 * Pensado para los casos negativos (CP-02, CP-03).
 * Pasar '' para dejar un campo vacío.
 */
// Nota: el campo de correo es type="email", así que el navegador
// valida el formato y puede bloquear el envío sin llamar al servidor.
// En ese caso la prueba debe verificar que se sigue en /login.
Cypress.Commands.add('loginManual', (usuario, clave) => {
  cy.visit(RUTA_LOGIN);
  if (usuario) cy.get(SEL.usuario).clear().type(usuario, { log: false });
  if (clave) cy.get(SEL.clave).clear().type(clave, { log: false });
  cy.get(SEL.ingresar).click();
});
