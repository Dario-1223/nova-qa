describe("Portal NOVA - página de inicio", () => {
  it("carga la página principal", () => {
    cy.visit("/");
    cy.title().should("contain", "NOVA");
    cy.contains("Iniciar sesión").should("be.visible");
  });
});
