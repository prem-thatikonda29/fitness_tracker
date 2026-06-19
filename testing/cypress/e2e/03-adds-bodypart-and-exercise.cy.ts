describe("Custom exercises", () => {
  beforeEach(() => {
    cy.signIn();
  });

  it("adds a new body part and then an exercise under it", () => {
    cy.visit("/log");

    cy.contains("h1", /log workout/i).should("be.visible");

    // Add a new body part via the dialog
    cy.get('[data-testid="add-bodypart-btn"]').first().click();
    cy.get('[data-testid="bodypart-name-input"]').type("Forearms");
    cy.get('[data-testid="bodypart-add-confirm"]').click();

    // The new body part toggle should now be visible
    cy.get('[data-testid="bodypart-toggle"][data-bodypart="Forearms"]').should("be.visible");

    // Click it to activate Forearms
    cy.get('[data-testid="bodypart-toggle"][data-bodypart="Forearms"]').first().click();

    // Add an exercise under Forearms via the dialog
    cy.get('[data-testid="add-exercise-btn"]').first().click();
    cy.get('[data-testid="exercise-name-input"]').type("Wrist Curl");
    cy.get('[data-testid="exercise-add-confirm"]').click();

    // The exercise toggle should now be visible
    cy.get('[data-testid="exercise-toggle"][data-exercise="Wrist Curl"]').should("be.visible");
  });
});
