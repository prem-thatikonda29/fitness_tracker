/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Sign in through Clerk's email/password flow and cache the session. */
      signIn(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("signIn", () => {
  const email = Cypress.env("test_email");
  const password = Cypress.env("test_password");

  cy.session(
    [email],
    () => {
      cy.visit("/sign-in");

      // Step 1: identifier (email). Clerk renders this into our own DOM.
      cy.get('input[name="identifier"]', { timeout: 20000 })
        .should("be.visible")
        .type(email);
      cy.get(".cl-formButtonPrimary").click();

      // Step 2: password (Clerk advances via hash routing once email is accepted).
      cy.get('input[name="password"]', { timeout: 20000 })
        .should("be.visible")
        .type(password, { log: false });
      cy.get(".cl-formButtonPrimary").click();

      // Wait for the verification code to be sent by Clerk before typing the OTP.
      cy.wait(1500);

      // Email code on new device. +clerk_test => 424242.
      cy.get('input[inputmode="numeric"]', { timeout: 20000 })
        .should("be.visible")
        .type(Cypress.env("test_otp"));

      // Land back on an authenticated page.
      cy.location("pathname", { timeout: 20000 }).should("not.include", "sign-in");
    },
    {
      validate() {
        // Session is valid only if a protected route doesn't bounce to sign-in.
        cy.visit("/");
        cy.location("pathname", { timeout: 15000 }).should("not.include", "sign-in");
      },
    }
  );
});

export {};
