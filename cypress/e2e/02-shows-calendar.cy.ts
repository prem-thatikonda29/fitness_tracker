describe("Calendar", () => {
  beforeEach(() => {
    cy.signIn();
  });

  it("shows the calendar with seeded data after login", () => {
    cy.visit("/");

    cy.get('[data-testid="calendar-header"]').should("be.visible");
    cy.get('[data-testid="month-title"]').should("be.visible");
    cy.get('[data-testid="calendar-grid"]').should("be.visible");

    cy.get('[data-testid="week-summary"]').should("be.visible");
    cy.get('[data-testid="week-workout-count"]').should("exist");
    cy.get('[data-testid="log-workout-btn"]').should("be.visible");

    cy.get('[data-testid="month-prev"]').first().click();
    cy.get('[data-testid="month-next"]').first().click();
    cy.get('[data-testid="month-title"]').should("be.visible");
  });
});
