import { APIClient, type APIError } from "./client";
import { FlowsAPI } from "./flows";
import { JobsAPI } from "./jobs";
import { DebugAPI } from "./debug";
import { BreakpointsAPI } from "./breakpoints";

export function createAPI(baseURL: string) {
  const client = new APIClient(baseURL);

  return {
    // API modules
    flows: new FlowsAPI(client),
    jobs: new JobsAPI(client),
    debug: new DebugAPI(client),
    breakpoints: new BreakpointsAPI(client),

    // Client methods
    testConnection: () => client.testConnection(),
  };
}

export type API = ReturnType<typeof createAPI>;

export type { APIError };
export type * from "../types/api";

