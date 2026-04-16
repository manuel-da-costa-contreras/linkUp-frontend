import { goToSection, loginWithEmailPassword } from "./helpers";

describe(
  "E2E - Clients flow",
  {
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },
  () => {
    it("creates client, validates it in jobs and then deletes it", () => {
      const unique = Date.now();
      const clientName = `e2e client test ${unique}`;

      cy.intercept("GET", "**/organizations/*/clients*").as("getClients");
      cy.intercept("POST", "**/organizations/*/clients").as("createClient");
      cy.intercept("DELETE", "**/organizations/*/clients/*").as("deleteClient");
      cy.intercept("GET", "**/organizations/*/jobs*").as("getJobs");
      cy.intercept("GET", "**/organizations/*/clients/options*").as("getClientOptions");

      loginWithEmailPassword();
      goToSection("/clients");
      cy.wait("@getClients");

      cy.contains("button", /anadir cliente|add client/i).click();
      cy.get("#client-name-input").should("be.visible").clear().type(clientName);
      cy.get("button[form='create-client-form']").click();
      cy.wait("@createClient").its("response.statusCode").should("be.oneOf", [200, 201]);
      cy.wait("@getClients");

      cy.contains("table tbody tr", clientName, { timeout: 30000 }).should("be.visible");

      cy.get("input[placeholder*='Buscar cliente']").clear().type(clientName);
      cy.contains("table tbody tr", clientName, { timeout: 30000 }).should("be.visible");

      goToSection("/jobs");
      cy.wait("@getJobs");
      cy.contains("button", /anadir job|add job/i).click();
      cy.wait("@getClientOptions");
      cy.get("#job-client-select").within(() => {
        cy.contains("option", clientName).should("exist");
      });
      cy.contains("button", /cancelar|cancel/i).click();

      goToSection("/clients");
      cy.get("input[placeholder*='Buscar cliente']", { timeout: 30000 }).should("be.visible");
      cy.get("input[placeholder*='Buscar cliente']").clear().type(clientName);
      cy.contains("table tbody tr", clientName, { timeout: 30000 })
        .should("be.visible")
        .within(() => {
          cy.get("[data-testid='client-row-delete']").click();
        });

      cy.get("@deleteClient.all").should("have.length", 0);

      cy.get("[data-testid='client-delete-modal']", { timeout: 10000 }).should("be.visible").within(() => {
        cy.contains("button", /eliminar|delete/i).click();
      });

      cy.wait("@deleteClient").its("response.statusCode").should("be.oneOf", [200, 204]);

      cy.get("input[placeholder*='Buscar cliente']").clear().type(clientName);
      cy.contains("table tbody tr", clientName, { timeout: 30000 }).should("not.exist");
    });
  }
);
