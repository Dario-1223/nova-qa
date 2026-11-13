describe("Coordinación", () => {
  beforeEach(function () {
    cy.login("COORD");
    cy.fixture("coordinacion").as("datos");
    cy.visit("/");
  });

  it("CP-05 Coordinación consulta [función principal]", function () {
    // TODO: entrar a la opción del menú
    // TODO: verificar que se muestra el listado o los datos esperados
  });
});