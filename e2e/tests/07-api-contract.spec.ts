/**
 * API Contract E2E Tests
 *
 * Tests to verify overseer's API client works correctly with the latest routilux API.
 * These tests validate the contract between overseer and routilux server.
 */

import { test, expect } from "../fixtures/fixtures";
import { ConnectPage } from "../fixtures/page-objects";

test.describe("API Contract Tests", () => {
  test.describe("Health Endpoints", () => {
    test("should connect to health/live endpoint", async ({ server }) => {
      const api = server.getApiClient();
      const response = await api.get("/api/v1/health/live");

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("status");
    });

    test("should connect to health/ready endpoint", async ({ server }) => {
      const api = server.getApiClient();
      const response = await api.get("/api/v1/health/ready");

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("status");
    });
  });

  test.describe("Flow API Contract", () => {
    test("should list flows with correct response structure", async ({ server }) => {
      const api = server.getApiClient();
      const response = await api.get("/api/v1/flows");

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("flows");
      expect(response.data).toHaveProperty("total");
      expect(Array.isArray(response.data.flows)).toBe(true);
    });

    test("should create flow with DSL dict", async ({ server }) => {
      const api = server.getApiClient();
      const flowId = `test-flow-${Date.now()}`;

      const response = await api.post("/api/v1/flows", {
        flow_id: flowId,
        dsl_dict: {
          flow_id: flowId,
          routines: {
            source: {
              class: "DataSource",
              config: { name: "Test Source" },
            },
          },
          connections: [],
        },
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("flow_id", flowId);
      expect(response.data).toHaveProperty("routines");
      expect(response.data).toHaveProperty("connections");
    });

    test("should get flow by ID", async ({ server }) => {
      const api = server.getApiClient();
      const flowId = `test-flow-get-${Date.now()}`;

      // Create flow first
      await api.post("/api/v1/flows", {
        flow_id: flowId,
        dsl_dict: {
          flow_id: flowId,
          routines: {
            source: { class: "DataSource", config: { name: "Source" } },
          },
          connections: [],
        },
      });

      // Get flow
      const response = await api.get(`/api/v1/flows/${flowId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("flow_id", flowId);
      expect(response.data).toHaveProperty("routines");

      // Verify RoutineInfo structure
      const routines = response.data.routines;
      const routineKeys = Object.keys(routines);
      if (routineKeys.length > 0) {
        const routine = routines[routineKeys[0]];
        expect(routine).toHaveProperty("routine_id");
        expect(routine).toHaveProperty("class_name");
        expect(routine).toHaveProperty("slots");
        expect(routine).toHaveProperty("events");
        expect(routine).toHaveProperty("config");
      }
    });

    test("should delete flow", async ({ server }) => {
      const api = server.getApiClient();
      const flowId = `test-flow-delete-${Date.now()}`;

      // Create flow
      await api.post("/api/v1/flows", {
        flow_id: flowId,
        dsl_dict: {
          flow_id: flowId,
          routines: {
            source: { class: "DataSource" },
          },
          connections: [],
        },
      });

      // Delete flow
      const response = await api.delete(`/api/v1/flows/${flowId}`);
      expect(response.status).toBe(204);
    });
  });

  test.describe("Worker API Contract", () => {
    let testFlowId: string;

    test.beforeAll(async ({ server }) => {
      const api = server.getApiClient();
      testFlowId = `worker-test-flow-${Date.now()}`;

      await api.post("/api/v1/flows", {
        flow_id: testFlowId,
        dsl_dict: {
          flow_id: testFlowId,
          routines: {
            source: { class: "DataSource", config: { name: "Source" } },
          },
          connections: [],
        },
      });
    });

    test("should create worker", async ({ server }) => {
      const api = server.getApiClient();

      const response = await api.post("/api/v1/workers", {
        flow_id: testFlowId,
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("worker_id");
      expect(response.data).toHaveProperty("flow_id", testFlowId);
      expect(response.data).toHaveProperty("status");
      expect(response.data).toHaveProperty("created_at");
      expect(response.data).toHaveProperty("jobs_processed");
      expect(response.data).toHaveProperty("jobs_failed");
    });

    test("should list workers with correct structure", async ({ server }) => {
      const api = server.getApiClient();

      const response = await api.get("/api/v1/workers");

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("workers");
      expect(response.data).toHaveProperty("total");
      expect(response.data).toHaveProperty("limit");
      expect(response.data).toHaveProperty("offset");
    });

    test("should get worker by ID", async ({ server }) => {
      const api = server.getApiClient();

      // Create worker first
      const createResponse = await api.post("/api/v1/workers", {
        flow_id: testFlowId,
      });
      const workerId = createResponse.data.worker_id;

      // Get worker
      const response = await api.get(`/api/v1/workers/${workerId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("worker_id", workerId);
      expect(response.data).toHaveProperty("flow_id");
      expect(response.data).toHaveProperty("status");
    });

    test("should pause and resume worker", async ({ server }) => {
      const api = server.getApiClient();

      // Create worker
      const createResponse = await api.post("/api/v1/workers", {
        flow_id: testFlowId,
      });
      const workerId = createResponse.data.worker_id;

      // Pause worker
      const pauseResponse = await api.post(`/api/v1/workers/${workerId}/pause`);
      expect(pauseResponse.status).toBe(200);
      expect(pauseResponse.data.status).toBe("paused");

      // Resume worker
      const resumeResponse = await api.post(`/api/v1/workers/${workerId}/resume`);
      expect(resumeResponse.status).toBe(200);
      expect(resumeResponse.data.status).toBe("running");
    });
  });

  test.describe("Job API Contract", () => {
    let testFlowId: string;
    let testWorkerId: string;

    test.beforeAll(async ({ server }) => {
      const api = server.getApiClient();
      testFlowId = `job-test-flow-${Date.now()}`;

      await api.post("/api/v1/flows", {
        flow_id: testFlowId,
        dsl_dict: {
          flow_id: testFlowId,
          routines: {
            source: { class: "DataSource", config: { name: "Source" } },
          },
          connections: [],
        },
      });

      const workerResponse = await api.post("/api/v1/workers", {
        flow_id: testFlowId,
      });
      testWorkerId = workerResponse.data.worker_id;
    });

    test("should list jobs with correct structure", async ({ server }) => {
      const api = server.getApiClient();

      const response = await api.get("/api/v1/jobs");

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("jobs");
      expect(response.data).toHaveProperty("total");
      expect(Array.isArray(response.data.jobs)).toBe(true);
    });

    test("should submit job with JobSubmitRequest structure", async ({ server }) => {
      const api = server.getApiClient();

      const response = await api.post("/api/v1/jobs", {
        flow_id: testFlowId,
        worker_id: testWorkerId,
        routine_id: "source",
        slot_name: "trigger",
        data: { test: "data" },
        metadata: { source: "contract-test" },
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("job_id");
      expect(response.data).toHaveProperty("worker_id", testWorkerId);
      expect(response.data).toHaveProperty("flow_id", testFlowId);
      expect(response.data).toHaveProperty("status");
      expect(response.data).toHaveProperty("created_at");
    });

    test("should get job by ID with correct structure", async ({ server }) => {
      const api = server.getApiClient();

      // Submit job
      const submitResponse = await api.post("/api/v1/jobs", {
        flow_id: testFlowId,
        routine_id: "source",
        slot_name: "trigger",
        data: {},
      });
      const jobId = submitResponse.data.job_id;

      // Get job
      const response = await api.get(`/api/v1/jobs/${jobId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("job_id", jobId);
      expect(response.data).toHaveProperty("worker_id");
      expect(response.data).toHaveProperty("flow_id");
      expect(response.data).toHaveProperty("status");
      // Optional fields
      expect(response.data).toHaveProperty("created_at");
      expect(response.data).toHaveProperty("started_at");
      expect(response.data).toHaveProperty("completed_at");
      expect(response.data).toHaveProperty("error");
      expect(response.data).toHaveProperty("metadata");
    });

    test("should list jobs with filters", async ({ server }) => {
      const api = server.getApiClient();

      const response = await api.get("/api/v1/jobs", {
        params: {
          flow_id: testFlowId,
          status: "completed",
          limit: 10,
          offset: 0,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("jobs");
      expect(response.data).toHaveProperty("total");
      expect(response.data).toHaveProperty("limit", 10);
      expect(response.data).toHaveProperty("offset", 0);
    });
  });

  test.describe("Discovery API Contract", () => {
    test("should discover flows", async ({ server }) => {
      const api = server.getApiClient();

      const response = await api.get("/api/v1/discovery/flows");

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("flows");
    });

    test("should discover jobs", async ({ server }) => {
      const api = server.getApiClient();

      const response = await api.get("/api/v1/discovery/jobs");

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("jobs");
    });

    test("should sync flows", async ({ server }) => {
      const api = server.getApiClient();

      const response = await api.post("/api/v1/discovery/flows/sync");

      expect(response.status).toBe(200);
    });
  });

  test.describe("WebSocket Contract", () => {
    test("should connect to generic websocket endpoint", async ({ page, server }) => {
      const serverUrl = server.getServerUrl();
      const wsUrl = serverUrl.replace("http", "ws") + "/api/v1/websocket";

      // Connect via WebSocket
      const wsConnected = await page.evaluate(async (url) => {
        return new Promise((resolve) => {
          const ws = new WebSocket(url);
          ws.onopen = () => {
            ws.close();
            resolve(true);
          };
          ws.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 5000);
        });
      }, wsUrl);

      expect(wsConnected).toBe(true);
    });

    test("should receive connected message on websocket", async ({ page, server }) => {
      const serverUrl = server.getServerUrl();
      const wsUrl = serverUrl.replace("http", "ws") + "/api/v1/websocket";

      const message = await page.evaluate(async (url) => {
        return new Promise((resolve) => {
          const ws = new WebSocket(url);
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            ws.close();
            resolve(data);
          };
          ws.onerror = () => resolve(null);
          setTimeout(() => resolve(null), 5000);
        });
      }, wsUrl);

      expect(message).not.toBeNull();
      expect(message).toHaveProperty("type", "connected");
    });
  });

  test.describe("Overseer Integration", () => {
    test("should connect overseer to routilux server", async ({ page, server }) => {
      const connectPage = new ConnectPage(page);
      await connectPage.open();

      const serverUrl = server.getServerUrl();
      await connectPage.setServerUrl(serverUrl);
      await connectPage.testConnection();

      const isSuccess = await connectPage.isConnectionSuccessful();
      expect(isSuccess).toBe(true);
    });

    test("should display flows after connection", async ({ page, server }) => {
      // Create a flow first
      const api = server.getApiClient();
      await api.post("/api/v1/flows", {
        flow_id: "overseer-test-flow",
        dsl_dict: {
          flow_id: "overseer-test-flow",
          routines: {
            source: { class: "DataSource" },
          },
          connections: [],
        },
      });

      // Connect overseer
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.connectTo(server.getServerUrl());

      // Navigate to flows page
      await page.goto("/flows");
      await page.waitForLoadState("networkidle");

      // Check for flow card
      const flowCard = page.locator('[data-testid="flows-card-overseer-test-flow"]');
      await expect(flowCard).toBeVisible({ timeout: 10000 });
    });

    test("should display workers after connection", async ({ page, server }) => {
      // Create a worker first
      const api = server.getApiClient();
      await api.post("/api/v1/flows", {
        flow_id: "worker-display-test",
        dsl_dict: {
          flow_id: "worker-display-test",
          routines: {
            source: { class: "DataSource" },
          },
          connections: [],
        },
      });
      await api.post("/api/v1/workers", { flow_id: "worker-display-test" });

      // Connect overseer
      const connectPage = new ConnectPage(page);
      await connectPage.open();
      await connectPage.connectTo(server.getServerUrl());

      // Navigate to workers page
      await page.goto("/workers");
      await page.waitForLoadState("networkidle");

      // Check for worker card
      const workerCount = await page.locator('[data-testid^="workers-card-"]').count();
      expect(workerCount).toBeGreaterThan(0);
    });
  });
});
