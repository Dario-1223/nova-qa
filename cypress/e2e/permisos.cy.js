describe("Permisos entre roles", () => {
  it("CP-12 Coordinación no accede a la función de Vicerrectoría", function () {
    cy.login("COORD");
    cy.visit("/convocatorias-app/vicerrectoria/avales", {
      failOnStatusCode: false,
    });
    cy.location("pathname").should("include", "/acceso-denegado");
    cy.location("pathname").should("not.include", "/vicerrectoria");
  });

  it("CP-13 Vicerrectoría no accede a la función de Coordinación", function () {
    cy.loginViceToken();
    cy.visit("/convocatorias-app/coordinador/aspirantes", {
      failOnStatusCode: false,
    });
    cy.location("pathname").should("include", "/acceso-denegado");
    cy.location("pathname").should("not.include", "/coordinador");
  });
});