import { RUTA_LOGIN, RUTA_PANEL } from './rutas';

const SEL = {
  usuario: '#email',
  clave: '#password',
  enviar: 'form button[type="submit"]',
};

// Un valor de relleno no cuenta como credencial real
const esRelleno = (v) =>
  !v ||
  v === '...' ||
  v === 'pendiente' ||
  String(v).startsWith('PEGA_AQUI') ||
  String(v).startsWith('PON_AQUI');

Cypress.Commands.add('login', (rol) => {
  cy.env([`${rol}_TOKEN`, `${rol}_USER`, `${rol}_PASS`]).then((env) => {
    const token = env[`${rol}_TOKEN`];
    const usuario = env[`${rol}_USER`];
    const clave = env[`${rol}_PASS`];

    // Acceso por cookie "token" (sesión iniciada antes con Google)
    if (!esRelleno(token)) {
      cy.session(
        ['token', rol],
        () => {
          cy.visit(RUTA_LOGIN); // para quedar en el dominio de Nova
          cy.setCookie('token', token, { path: '/' });
          cy.visit(RUTA_PANEL);
          cy.contains('button', 'Cerrar sesión', { timeout: 15000 }).should('be.visible');
        },
        {
          validate() {
            cy.visit(RUTA_PANEL);
            cy.contains('button', 'Cerrar sesión', { timeout: 15000 }).should('be.visible');
          },
        }
      );
      return;
    }

    // Acceso por formulario (correo y contraseña)
    if (esRelleno(usuario) || esRelleno(clave)) {
      throw new Error(
        `No hay credenciales reales para ${rol}: faltan ${rol}_TOKEN o ${rol}_USER y ${rol}_PASS en cypress.env.json`
      );
    }

    cy.session(['login', rol], () => {
      cy.visit(RUTA_LOGIN);
      cy.get(SEL.usuario).clear().type(usuario, { log: false });
      cy.get(SEL.clave).clear().type(clave, { log: false });
      cy.get(SEL.enviar).click();
      cy.contains('button', 'Cerrar sesión', { timeout: 15000 }).should('be.visible');
    });
  });
});