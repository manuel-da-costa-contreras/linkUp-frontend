export function loginWithEmailPassword() {
  const env = Cypress.env() as {
    email?: string;
    password?: string;
    E2E_EMAIL?: string;
    E2E_PASSWORD?: string;
    CYPRESS_email?: string;
    CYPRESS_password?: string;
  };

  const email = env.email ?? env.CYPRESS_email ?? env.E2E_EMAIL;
  const password = env.password ?? env.CYPRESS_password ?? env.E2E_PASSWORD;

  if (!email) {
    throw new Error("E2E_EMAIL is required");
  }

  if (!password) {
    throw new Error("E2E_PASSWORD is required");
  }

  cy.visit("/");
  cy.get("#auth-email", { timeout: 30000 }).should("be.visible").clear().type(email, { log: false });
  cy.get("#auth-password", { timeout: 30000 }).should("be.visible").clear().type(password, { log: false });
  cy.get("form button[type='submit']").should("be.enabled").click();
  cy.contains("h1, h2", /dashboard/i, { timeout: 30000 }).should("be.visible");
}

export function goToSection(path: "/clients" | "/jobs") {
  cy.get("body").then(($body) => {
    const visibleLink = $body.find(`a[href='${path}']:visible`);
    if (visibleLink.length > 0) {
      cy.get(`a[href='${path}']:visible`).first().click();
      return;
    }

    cy.get("header button").first().click();
    cy.get(`aside a[href='${path}']`, { timeout: 10000 }).first().click({ force: true });
  });
}
