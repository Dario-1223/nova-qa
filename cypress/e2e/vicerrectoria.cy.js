describe("Vicerrectoría", () => {
  const RUTA = "/convocatorias-app/vicerrectoria/avales";

  beforeEach(function () {
    cy.loginViceToken();
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

  it("CP-11 Vicerrectoría dispone del filtro de convocatoria", function () {
    cy.contains("Gestión de Avales").should("be.visible");
    cy.get("select", { timeout: 15000 }).should("exist");
    cy.get("select")
      .first()
      .find("option:selected")
      .invoke("text")
      .then((t) => expect(t.trim()).to.match(/todas/i));
  });

  it("CP-11b Vicerrectoría filtra postulantes por una convocatoria", function () {
    cy.contains("Gestión de Avales").should("be.visible");
    cy.wait(5000); // tiempo para que carguen las convocatorias

    cy.get("select").then(($selects) => {
      const idx = [...$selects].findIndex((s) => s.options.length > 1);

      if (idx === -1) {
        // No hay convocatorias en el desplegable: se registra y se omite
        cy.log("SIN DATOS: el desplegable solo tiene 'Todas las convocatorias'");
        this.skip();
      }

      const opciones = [...$selects[idx].options]
        .map((o) => o.text.trim())
        .filter((t) => t && !/todas/i.test(t));
      const elegida = opciones[0];
      cy.log(`Convocatoria elegida: ${elegida}`);

      cy.get("select").eq(idx).select(elegida);
      cy.contains("Gestión de Avales").should("be.visible");
      cy.get("select")
        .eq(idx)
        .find("option:selected")
        .invoke("text")
        .then((t) => expect(t.trim()).to.eq(elegida));
    });
  });
});