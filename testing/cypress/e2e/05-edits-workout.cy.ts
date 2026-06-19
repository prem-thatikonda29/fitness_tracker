describe("Workout", () => {
  beforeEach(() => {
    cy.signIn();
  });

  it("creates a workout then edits its name", () => {
    cy.visit("/log");

    cy.get('[data-testid="session-name"]').type("Push Session");

    // Chest is auto-activated. Pick an exercise without toggling body part.
    cy.get('[data-testid="exercise-toggle"][data-exercise="Incline Dumbbell Press"]').first().click();
    cy.get('[data-testid="set-reps"][data-exercise="Incline Dumbbell Press"][data-set-index="0"]')
      .first()
      .type("12");
    cy.get('[data-testid="set-weight"][data-exercise="Incline Dumbbell Press"][data-set-index="0"]')
      .first()
      .type("40");
    cy.get('[data-testid="save-workout"]').first().click();

    cy.location("pathname", { timeout: 15000 }).should("match", /^\/session\/\d+$/);
    cy.get('[data-testid="session-title"]').should("contain.text", "Push Session");

    // Edit
    cy.get('[data-testid="edit-session-link"]').first().click();
    cy.contains("h1", /edit workout/i).should("be.visible");

    cy.get('[data-testid="session-name"]').clear().type("Push Session (edited)");
    cy.get('[data-testid="save-workout"]').first().click();

    cy.get('[data-testid="session-title"]', { timeout: 15000 })
      .should("contain.text", "Push Session (edited)");
  });
});
