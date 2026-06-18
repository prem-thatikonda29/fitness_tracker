describe("Authentication", () => {
  it("signs in with valid credentials and lands on the app", () => {
    cy.visit("/sign-in");

    cy.get('input[name="identifier"]', { timeout: 20000 })
      .should("be.visible")
      .type(Cypress.env("test_email"));
    cy.get(".cl-formButtonPrimary").click();

    cy.get('input[name="password"]', { timeout: 20000 })
      .should("be.visible")
      .type(Cypress.env("test_password"), { log: false });
    cy.get(".cl-formButtonPrimary").click();

    cy.get('input[inputmode="numeric"]', { timeout: 20000 })
      .should("be.visible")
      .type(Cypress.env("test_otp"));

    cy.location("pathname", { timeout: 30000 }).should("not.match", /^\/sign-in\/?$/);
    cy.contains(/workouts/i).should("be.visible");
  });
});
