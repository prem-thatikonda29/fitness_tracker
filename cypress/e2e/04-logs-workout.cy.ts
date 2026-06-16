describe("Workout", () => {
  beforeEach(() => {
    cy.signIn();
  });

  it("logs a full workout with sets and redirects to the session page", () => {
    cy.visit("/log");

    cy.contains("h1", /log workout/i).should("be.visible");

    cy.get('[data-testid="session-name"]').type("Chest Day Test");

    // Chest is auto-activated on page load. Don't toggle it — just pick the exercise.
    cy.get('[data-testid="exercise-toggle"][data-exercise="Bench Press"]').first().click();

    // Fill set 1
    cy.get('[data-testid="set-reps"][data-exercise="Bench Press"][data-set-index="0"]')
      .first()
      .type("10");
    cy.get('[data-testid="set-weight"][data-exercise="Bench Press"][data-set-index="0"]')
      .first()
      .type("60");

    // Add a second set
    cy.get('[data-testid="add-set"]').first().click();

    // Fill set 2
    cy.get('[data-testid="set-reps"][data-exercise="Bench Press"][data-set-index="1"]')
      .first()
      .type("8");
    cy.get('[data-testid="set-weight"][data-exercise="Bench Press"][data-set-index="1"]')
      .first()
      .type("65");

    // Save
    cy.get('[data-testid="save-workout"]').first().click();

    cy.location("pathname", { timeout: 15000 }).should("match", /^\/session\/\d+$/);

    cy.get('[data-testid="session-title"]').should("contain.text", "Chest Day Test");
    cy.get('[data-testid="session-bodypart-badge"]').should("have.length.at.least", 1);
    cy.get('[data-testid="exercise-card"][data-exercise="Bench Press"]').should("be.visible");
    cy.get('[data-testid="workout-receipt"]').should("be.visible");
  });
});
