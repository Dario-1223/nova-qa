const RUTA = "/convocatorias-app/vicerrectoria/avales";
const BUSCADOR = 'input[placeholder*="Nombre"]';

describe("Vicerrectoría", () => {
  beforeEach(function () {
    cy.fixture("vicerrectoria").as("datos");
    cy.loginViceToken();
    cy.visit(RUTA);
    // Si la sesión no es válida la app redirige al login: se detecta aquí con un mensaje claro
    cy.location("pathname", { timeout: 10000 }).should(
      "include",
      "/vicerrectoria/avales"
    );
    cy.contains("Gestión de Avales", { timeout: 10000 }).should("be.visible");
  });

  it("CP-10 Vicerrectoría consulta el listado de avales", function () {
    cy.contains("Total postulantes", { matchCase: false }).should("be.visible");
    cy.contains("Con aval", { matchCase: false }).should("be.visible");
    cy.contains("Sin aval", { matchCase: false }).should("be.visible");
    cy.contains("button", "Ver postulantes", { timeout: 10000 }).should("be.visible");
  });

  it("CP-11 Vicerrectoría dispone del filtro de convocatoria", function () {
    cy.get("select", { timeout: 15000 }).should("exist");
    cy.get("select")
      .first()
      .find("option:selected")
      .invoke("text")
      .then((t) => expect(t.trim()).to.match(/todas/i));
  });

  // DEF-01: el desplegable solo ofrece "Todas las convocatorias" aunque la convocatoria
  // existe en el listado. Este caso FALLA mientras el defecto exista.
  it("CP-11b Vicerrectoría filtra postulantes por una convocatoria (DEF-01)", function () {
    const esperada = this.datos.datosValidos.convocatoria;

    // La convocatoria existe en la pantalla (tarjeta del listado)
    cy.contains(esperada, { timeout: 10000 }).should("exist");

    // ...y por tanto debe poder elegirse en el desplegable
    cy.get("select", { timeout: 10000 }).should(($selects) => {
      const opciones = [...$selects[0].options].map((o) => o.text.trim());
      expect(
        opciones,
        `El desplegable debe incluir "${esperada}". Encontrado: [${opciones.join(" | ")}]`
      ).to.include(esperada);
    });
  });

  it("CP-14 búsqueda por nombre inexistente en Vicerrectoría", function () {
    cy.get(BUSCADOR, { timeout: 10000 }).should("be.visible");
    cy.get(BUSCADOR).clear();
    const texto = this.datos.datosInvalidos.busqueda;
    cy.get(BUSCADOR).type(texto);
    cy.wait(1500);
    cy.get(BUSCADOR).should("have.value", texto);
    cy.location("pathname").should("include", "/vicerrectoria/avales");
    cy.contains("Gestión de Avales").should("be.visible");
    cy.contains("Total postulantes", { matchCase: false }).should("be.visible");
  });

  it("CP-15 búsqueda por nombre con caracteres especiales y campo vacío", function () {
    cy.get(BUSCADOR, { timeout: 10000 }).should("be.visible");
    cy.get(BUSCADOR).clear();
    cy.get(BUSCADOR).type(this.datos.datosInvalidos.caracteresEspeciales);
    cy.wait(1500);
    cy.location("pathname").should("include", "/vicerrectoria/avales");
    cy.contains("Gestión de Avales").should("be.visible");

    cy.get(BUSCADOR).clear();
    cy.wait(1500);
    cy.get(BUSCADOR).should("have.value", "");
    cy.location("pathname").should("include", "/vicerrectoria/avales");
    cy.contains("Gestión de Avales").should("be.visible");
  });

  // Solo lectura: NO se pulsa ningún botón que otorgue avales.
  it("CP-16 Vicerrectoría abre el listado de postulantes de una convocatoria", function () {
    cy.contains("button", "Ver postulantes", { timeout: 10000 })
      .first()
      .click();
    cy.wait(2000);
    cy.location("pathname").should("not.include", "inicio-sesion");
    cy.contains(/postulante/i).should("exist");
  });
});

// Sin sesión: cada prueba parte limpia, sin el login del bloque anterior.
// Observado: sin sesión, la app NO muestra la pantalla de avales y redirige a /convocatorias-app.
describe("Vicerrectoría sin sesión", () => {
  it("CP-17 acceso a Avales sin iniciar sesión no muestra la pantalla de Vicerrectoría", function () {
    cy.visit(RUTA, { failOnStatusCode: false });
    cy.location("pathname", { timeout: 15000 }).should("not.include", "/vicerrectoria");
    cy.contains("Gestión de Avales").should("not.exist");
  });
});