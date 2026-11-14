describe.skip("Vicerrectoría", () => {
  const RUTA = "/convocatorias-app/vicerrectoria/avales";

  beforeEach(function () {
    cy.login("VICE");
    cy.fixture("vicerrectoria").as("datos");
    cy.visit(RUTA);
  });

  it("CP-10 Vicerrectoría consulta el listado de avales", function () {
    cy.location("pathname").should("include", "/vicerrectoria/avales");
    cy.contains("Gestión de Avales").should("be.visible");
    cy.contains("Total postulantes", { matchCase: false }).should("be.visible");
    cy.contains("Con aval", { matchCase: false }).should("be.visible");
    cy.contains("Sin aval", { matchCase: false }).should("be.visible");
    cy.contains("button", "Ver postulantes").should("be.visible");
  });

  it("CP-11 Vicerrectoría filtra postulantes por convocatoria", function () {
    cy.contains("label", "Convocatoria", { matchCase: false })
      .parent()
      .find("select")
      .select(this.datos.datosValidos.convocatoria);
    cy.contains("Gestión de Avales").should("be.visible");
    cy.contains(this.datos.datosValidos.convocatoria).should("be.visible");
  });
});
