import { goToSection, loginWithEmailPassword } from "./helpers";

describe(
  "E2E - Jobs flow",
  {
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },
  () => {
    it("creates a client and a job, transitions status, deletes job, then deletes client", () => {
      const unique = Date.now();
      const clientName = `e2e job client ${unique}`;
      const jobName = `e2e job test ${unique}`;

      cy.intercept("POST", "**/organizations/*/clients").as("createClient");
      cy.intercept("DELETE", "**/organizations/*/clients/*").as("deleteClient");
      cy.intercept("POST", "**/organizations/*/jobs").as("createJob");
      cy.intercept("PATCH", "**/organizations/*/jobs/*/status").as("updateJobStatus");
      cy.intercept("DELETE", "**/organizations/*/jobs/*").as("deleteJob");
      cy.intercept("GET", "**/organizations/*/clients/options*").as("getClientOptions");

      loginWithEmailPassword();

      goToSection("/clients");
      cy.contains("button", /anadir cliente|añadir cliente|add client/i, { timeout: 30000 }).click();
      cy.get("#client-name-input").should("be.visible").clear().type(clientName);
      cy.get("button[form='create-client-form']").click();
      cy.wait("@createClient").its("response.statusCode").should("be.oneOf", [200, 201]);
      cy.contains("table tbody tr", clientName, { timeout: 30000 }).should("be.visible");

      goToSection("/jobs");
      cy.contains("button", /anadir job|añadir job|add job/i, { timeout: 30000 }).click();
      cy.wait("@getClientOptions");
      cy.get("#job-name-input").should("be.visible").clear().type(jobName);
      cy.get("#job-client-select").select(clientName);
      cy.get("button[form='create-job-form']").click();
      cy.wait("@createJob").its("response.statusCode").should("be.oneOf", [200, 201]);

      cy.get("#job-search-input").clear().type(jobName);
      cy.contains("table tbody tr", jobName, { timeout: 30000 })
        .should("be.visible")
        .within(() => {
          cy.contains(/pendiente/i).should("be.visible");
          cy.get("[data-testid='job-row-change-status']").should("be.enabled").click();
        });

      cy.get("[data-testid='job-status-modal']", { timeout: 10000 }).should("be.visible");
      cy.get("[data-testid='job-status-select']", { timeout: 10000 }).should("be.visible").and("not.be.disabled");
      cy.get("[data-testid='job-status-select']").select("IN_PROGRESS");
      cy.get("[data-testid='job-status-submit']").should("be.enabled").click();
      cy.wait("@updateJobStatus").its("response.statusCode").should("be.oneOf", [200, 201]);

      cy.get("#job-search-input").clear().type(jobName);
      cy.contains("table tbody tr", jobName, { timeout: 30000 })
        .should("be.visible")
        .within(() => {
          cy.contains(/en curso/i).should("be.visible");
          cy.get("[data-testid='job-row-change-status']").should("be.enabled").click();
        });

      cy.get("[data-testid='job-status-modal']", { timeout: 10000 }).should("be.visible");
      cy.get("[data-testid='job-status-select']", { timeout: 10000 }).should("be.visible").and("not.be.disabled");
      cy.get("[data-testid='job-status-select']").select("REJECTED");
      cy.get("#job-transition-reason").clear().type("E2E reject cleanup flow");
      cy.get("[data-testid='job-status-submit']").should("be.enabled").click();
      cy.wait("@updateJobStatus").its("response.statusCode").should("be.oneOf", [200, 201]);

      cy.get("#job-search-input").clear().type(jobName);
      cy.contains("table tbody tr", jobName, { timeout: 30000 })
        .should("be.visible")
        .within(() => {
          cy.contains(/rechazado/i).should("be.visible");
          cy.get("[data-testid='job-row-delete']").click();
        });
      cy.get("[data-testid='job-delete-modal']", { timeout: 10000 }).should("be.visible").within(() => {
        cy.get("[data-testid='job-delete-confirm']").click();
      });
      cy.wait("@deleteJob").its("response.statusCode").should("be.oneOf", [200, 204]);

      cy.get("#job-search-input").clear().type(jobName);
      cy.contains("table tbody tr", jobName, { timeout: 30000 }).should("not.exist");

      goToSection("/clients");
      cy.get("input[placeholder*='Buscar cliente']", { timeout: 30000 }).should("be.visible").clear().type(clientName);
      cy.contains("table tbody tr", clientName, { timeout: 30000 })
        .should("be.visible")
        .within(() => {
          cy.get("[data-testid='client-row-delete']").click();
        });

      cy.get("[data-testid='client-delete-modal']", { timeout: 10000 }).should("be.visible").within(() => {
        cy.get("[data-testid='client-delete-confirm']").click();
      });
      cy.wait("@deleteClient").its("response.statusCode").should("be.oneOf", [200, 204]);

      cy.get("input[placeholder*='Buscar cliente']").clear().type(clientName);
      cy.contains("table tbody tr", clientName, { timeout: 30000 }).should("not.exist");
    });
  }
);
