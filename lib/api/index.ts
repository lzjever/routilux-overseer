import { OpenAPI, DefaultService } from "./generated";
import { FlowsAPI } from "./flows";
import { JobsAPI } from "./jobs";
import { DebugAPI } from "./debug";
import { BreakpointsAPI } from "./breakpoints";

// Re-export generated types
export type * from "./generated";

// Export API classes for use in plugins
export { FlowsAPI, JobsAPI, DebugAPI, BreakpointsAPI };

export function createAPI(baseURL: string, apiKey?: string) {
  // Configure OpenAPI base URL and headers
  OpenAPI.BASE = baseURL.replace(/\/$/, "");
  if (apiKey) {
    OpenAPI.HEADERS = {
      "X-API-Key": apiKey,
    };
  } else {
    OpenAPI.HEADERS = undefined;
  }

  const flows = new FlowsAPI(baseURL, apiKey);
  const jobs = new JobsAPI(baseURL, apiKey);
  const debug = new DebugAPI(baseURL, apiKey);
  const breakpoints = new BreakpointsAPI(baseURL, apiKey);

  return {
    // API modules
    flows,
    jobs,
    debug,
    breakpoints,

    // Client methods
    testConnection: async (): Promise<boolean> => {
      try {
        const response = await DefaultService.healthApiHealthGet();
        return response !== undefined;
      } catch (error: any) {
        console.error("Connection test error:", error);
        // Re-throw with more details for debugging
        if (error?.status) {
          throw new Error(`Server responded with status ${error.status}: ${error.message || 'Unknown error'}`);
        } else if (error?.message) {
          throw new Error(`Connection failed: ${error.message}`);
        } else {
          throw new Error(`Failed to connect to server. Please check if the server is running at ${baseURL}`);
        }
      }
    },
    setApiKey: (key: string | null) => {
      if (key) {
        OpenAPI.HEADERS = {
          "X-API-Key": key,
        };
      } else {
        OpenAPI.HEADERS = undefined;
      }
      // Update all API instances
      flows["apiKey"] = key || undefined;
      jobs["apiKey"] = key || undefined;
      debug["apiKey"] = key || undefined;
      breakpoints["apiKey"] = key || undefined;
    },
  };
}

export type API = ReturnType<typeof createAPI>;
