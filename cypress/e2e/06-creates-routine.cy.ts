describe("Routine", () => {
  beforeEach(() => {
    cy.signIn();
  });

  it("creates a new routine and shows it in the list", () => {
    cy.visit("/routines");

    cy.get('[data-testid="routine-card"]').should("have.length.at.least", 1);
    cy.get('[data-testid="new-routine-btn"]').first().should("be.visible").click();

    cy.location("pathname", { timeout: 10000 }).should("include", "/routines/new");
    cy.get('[data-testid="new-routine-title"]').should("contain.text", "New routine");

    cy.get('[data-testid="routine-name-input"]').type("Morning Pump");

    cy.get('[data-testid="routine-split-select"]').first().click();
    cy.get('[data-testid="routine-split-item"]').contains("Standard split").click();

    cy.get('[data-testid="routine-exercise-toggle"][data-exercise="Bench Press"]').first().click();
    cy.get('[data-testid="routine-exercise-toggle"][data-exercise="Overhead Press"]').first().click();

    cy.get('[data-testid="save-routine-btn"]').first().click();

    cy.location("pathname", { timeout: 15000 }).should("eq", "/routines");

    cy.get('[data-testid="routine-card"][data-routine="Morning Pump"]').should("be.visible");
    cy.get('[data-testid="use-routine-btn"][data-routine="Morning Pump"]').should("be.visible");
  });
});
