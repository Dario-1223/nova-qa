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

  it("CP-06 Coordinación realiza acción del rol", function () {
    // TODO: ejecutar la acción con this.datos.datosValidos
    // TODO: verificar el mensaje o resultado de éxito
  });

  it("CP-07 formulario de Coordinación con datos inválidos", function () {
    // TODO: llenar el formulario con this.datos.datosInvalidos
    // TODO: verificar que se rechaza (mensaje de error o no se guarda)
  });

  it("CP-08 otra función de Coordinación", function () {
    // TODO
  });
});