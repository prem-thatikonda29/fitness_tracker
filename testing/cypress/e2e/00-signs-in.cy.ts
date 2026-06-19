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

    cy.wait(1500);

    cy.get('input[inputmode="numeric"]', { timeout: 20000 })
      .should("be.visible")
      .type(Cypress.env("test_otp"));

    cy.location("pathname", { timeout: 30000 }).should("match", /^\/?$/);
    cy.contains(/workouts|log workout|calendar/i, { timeout: 20000 }).should("be.visible");
  });
});
