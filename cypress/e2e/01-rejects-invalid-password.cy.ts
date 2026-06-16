describe("Authentication", () => {
  it("rejects an invalid password and keeps the user on sign-in", () => {
    cy.visit("/sign-in");

    cy.get('input[name="identifier"]', { timeout: 20000 })
      .should("be.visible")
      .type(Cypress.env("test_email"));
    cy.get(".cl-formButtonPrimary").click();

    cy.get('input[name="password"]', { timeout: 20000 })
      .should("be.visible")
      .type("definitely-wrong-password", { log: false });
    cy.get(".cl-formButtonPrimary").click();

    cy.location("pathname", { timeout: 15000 }).should("include", "sign-in");
  });
});
