describe("Coordinación", () => {
  beforeEach(function () {
    cy.login("COORD");
    cy.fixture("coordinacion").as("datos");
    cy.visit("/");
  });

  it("CP-05 Coordinación consulta [función principal]", function () {
    // ...
  });

  it("CP-06 Coordinación realiza [acción del rol]", function () {
    // ...
  });
});