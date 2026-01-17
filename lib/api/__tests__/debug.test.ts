import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockDebugSession, mockEvalResponse, mockEvalError } from "@/test/test-utils";
import { DebugService } from "../generated/services/DebugService";

// Mock the generated services
vi.mock("../generated/services/DebugService", () => ({
  DebugService: {
    getDebugSessionApiJobsJobIdDebugSessionGet: vi.fn(),
    evaluateExpressionApiJobsJobIdDebugEvaluatePost: vi.fn(),
    stepOverApiJobsJobIdDebugStepOverPost: vi.fn(),
    stepIntoApiJobsJobIdDebugStepIntoPost: vi.fn(),
    resumeDebugApiJobsJobIdDebugResumePost: vi.fn(),
    getVariablesApiJobsJobIdDebugVariablesGet: vi.fn(),
    setVariableApiJobsJobIdDebugVariablesNamePut: vi.fn(),
    getCallStackApiJobsJobIdDebugCallStackGet: vi.fn(),
  },
}));

vi.mock("../generated/RoutiluxAPI", () => ({
  RoutiluxAPI: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../generated/core/OpenAPI", () => ({
  OpenAPI: {
    BASE: "",
    HEADERS: undefined,
  },
}));

describe("Debug API", () => {
  let api: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { createAPI, OpenAPI } = await import("../index");
    OpenAPI.BASE = "http://localhost:20555";
    api = createAPI("http://localhost:20555");
  });

  describe("getSession", () => {
    it("should get debug session info", async () => {
      vi.mocked(DebugService.getDebugSessionApiJobsJobIdDebugSessionGet).mockResolvedValue(
        mockDebugSession as any
      );

      const result = await api.debug.getSession("job-1");

      expect(result).toEqual(mockDebugSession);
      expect(DebugService.getDebugSessionApiJobsJobIdDebugSessionGet).toHaveBeenCalledWith("job-1");
    });
  });

  describe("evaluateExpression", () => {
    it("should evaluate expression successfully", async () => {
      const request = {
        expression: "1 + 1",
        routine_id: "routine-1",
      };

      vi.mocked(DebugService.evaluateExpressionApiJobsJobIdDebugEvaluatePost).mockResolvedValue(
        mockEvalResponse as any
      );

      const result = await api.debug.evaluateExpression("job-1", request);

      expect(result).toEqual(mockEvalResponse);
      expect(result.result).toBe(42);
      expect(DebugService.evaluateExpressionApiJobsJobIdDebugEvaluatePost).toHaveBeenCalledWith(
        "job-1",
        request
      );
    });

    it("should handle evaluation errors", async () => {
      const request = {
        expression: "undefined_var",
        routine_id: "routine-1",
      };

      vi.mocked(DebugService.evaluateExpressionApiJobsJobIdDebugEvaluatePost).mockResolvedValue(
        mockEvalError as any
      );

      const result = await api.debug.evaluateExpression("job-1", request);

      expect(result).toEqual(mockEvalError);
      expect(result.error).toBeDefined();
    });
  });

  describe("stepOver", () => {
    it("should step over execution", async () => {
      const mockResponse = { status: "running", job_id: "job-1", step_mode: "over" };

      vi.mocked(DebugService.stepOverApiJobsJobIdDebugStepOverPost).mockResolvedValue(
        mockResponse as any
      );

      const result = await api.debug.stepOver("job-1");

      expect(result).toEqual(mockResponse);
      expect(DebugService.stepOverApiJobsJobIdDebugStepOverPost).toHaveBeenCalledWith("job-1");
    });
  });

  describe("stepInto", () => {
    it("should step into execution", async () => {
      const mockResponse = { status: "running", job_id: "job-1", step_mode: "into" };

      vi.mocked(DebugService.stepIntoApiJobsJobIdDebugStepIntoPost).mockResolvedValue(
        mockResponse as any
      );

      const result = await api.debug.stepInto("job-1");

      expect(result).toEqual(mockResponse);
      expect(DebugService.stepIntoApiJobsJobIdDebugStepIntoPost).toHaveBeenCalledWith("job-1");
    });
  });

  describe("resume", () => {
    it("should resume execution", async () => {
      const mockResponse = { status: "running", job_id: "job-1" };

      vi.mocked(DebugService.resumeDebugApiJobsJobIdDebugResumePost).mockResolvedValue(
        mockResponse as any
      );

      const result = await api.debug.resume("job-1");

      expect(result).toEqual(mockResponse);
      expect(DebugService.resumeDebugApiJobsJobIdDebugResumePost).toHaveBeenCalledWith("job-1");
    });
  });

  describe("getVariables", () => {
    it("should get variables", async () => {
      const mockVariables = { x: 1, y: 2 };

      vi.mocked(DebugService.getVariablesApiJobsJobIdDebugVariablesGet).mockResolvedValue(
        mockVariables as any
      );

      const result = await api.debug.getVariables("job-1", "routine-1");

      expect(result).toEqual(mockVariables);
      expect(DebugService.getVariablesApiJobsJobIdDebugVariablesGet).toHaveBeenCalledWith(
        "job-1",
        "routine-1"
      );
    });
  });

  describe("setVariable", () => {
    it("should set variable", async () => {
      const mockResponse = { success: true };

      vi.mocked(DebugService.setVariableApiJobsJobIdDebugVariablesNamePut).mockResolvedValue(
        mockResponse as any
      );

      const result = await api.debug.setVariable("job-1", "x", 42);

      expect(result).toEqual(mockResponse);
      expect(DebugService.setVariableApiJobsJobIdDebugVariablesNamePut).toHaveBeenCalledWith(
        "job-1",
        "x",
        { value: 42 }
      );
    });
  });

  describe("getCallStack", () => {
    it("should get call stack", async () => {
      const mockCallStack = [{ routine: "routine-1", line: 10 }];

      vi.mocked(DebugService.getCallStackApiJobsJobIdDebugCallStackGet).mockResolvedValue(
        mockCallStack as any
      );

      const result = await api.debug.getCallStack("job-1");

      expect(result).toEqual(mockCallStack);
      expect(DebugService.getCallStackApiJobsJobIdDebugCallStackGet).toHaveBeenCalledWith("job-1");
    });
  });
});
