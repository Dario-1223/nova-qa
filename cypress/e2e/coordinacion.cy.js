describe("Coordinación", () => {
  const RUTA = "/convocatorias-app/coordinador/aspirantes";

  beforeEach(function () {
    cy.login("COORD");
    cy.fixture("coordinacion").as("datos");
    cy.visit(RUTA);
  });

  it("CP-05 Coordinación consulta el listado de aspirantes", function () {
    cy.location("pathname").should("include", "/coordinador/aspirantes");
    cy.contains("Gestión de Avales").should("be.visible");
    cy.contains("Total aspirantes", { matchCase: false }).should("be.visible");
    cy.contains("Con aval", { matchCase: false }).should("be.visible");
    cy.contains("Sin aval", { matchCase: false }).should("be.visible");
    cy.contains("button", "Ver aspirantes").should("be.visible");
  });

  it("CP-06 Coordinación filtra aspirantes por estado de postulación", function () {
    cy.contains("label", "Estado de postulación")
      .parent()
      .find("select")
      .select(this.datos.datosValidos.estado);
    cy.contains("label", "Estado de postulación")
      .parent()
      .find("select")
      .should("have.value", this.datos.datosValidos.estado);
    cy.contains("Gestión de Avales").should("be.visible");
  });

      it("CP-07 búsqueda de aspirante inexistente en Coordinación", function () {
    cy.contains("button", "Ver aspirantes").click();
    cy.get('input[placeholder^="Buscar aspirante"]')
      .clear()
      .type(this.datos.datosInvalidos.busqueda);
    cy.contains("0 aspirante(s)").should("be.visible");
  });

  it("CP-08 Coordinación no accede a la ruta de otro rol", function () {
    cy.visit("/convocatorias-app/talento-humano", { failOnStatusCode: false });
    cy.location("pathname").should("include", "/acceso-denegado");
    cy.location("pathname").should("not.include", "/talento-humano");
  });
  
    it("CP-09 búsqueda de aspirante con coincidencias en Coordinación", function () {
    cy.contains("button", "Ver aspirantes").click();
    cy.get('input[placeholder^="Buscar aspirante"]')
      .clear()
      .type(this.datos.datosValidos.busquedaValida);
    cy.contains("0 aspirante(s)").should("not.exist");
  });
});