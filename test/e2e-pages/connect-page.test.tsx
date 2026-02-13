import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ConnectPage from "@/app/connect/page";
import { useConnectionStore } from "@/lib/stores/connectionStore";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock the connection store
vi.mock("@/lib/stores/connectionStore", () => ({
  useConnectionStore: vi.fn(),
}));

// Mock createAPI
vi.mock("@/lib/api", () => ({
  createAPI: vi.fn(() => ({
    testConnection: vi.fn().mockResolvedValue(true),
  })),
}));

describe("ConnectPage", () => {
  const mockPush = vi.fn();
  const mockSetServerUrl = vi.fn();
  const mockSetApiKey = vi.fn();
  const mockSetConnected = vi.fn();
  const mockSetLastConnected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    (useConnectionStore as any).mockReturnValue({
      serverUrl: "http://localhost:20555",
      apiKey: null,
      setServerUrl: mockSetServerUrl,
      setApiKey: mockSetApiKey,
      setConnected: mockSetConnected,
      setLastConnected: mockSetLastConnected,
    });
  });

  describe("Rendering", () => {
    it("should render the connect page with all elements", () => {
      render(<ConnectPage />);

      // Check page container
      expect(screen.getByTestId("connect-page")).toBeInTheDocument();

      // Check card
      expect(screen.getByTestId("connect-card")).toBeInTheDocument();

      // Check form elements
      expect(screen.getByTestId("connect-form")).toBeInTheDocument();
      expect(screen.getByTestId("connect-input-server-url")).toBeInTheDocument();
      expect(screen.getByTestId("connect-input-api-key")).toBeInTheDocument();
      expect(screen.getByTestId("connect-button-submit")).toBeInTheDocument();
    });

    it("should display the logo", () => {
      render(<ConnectPage />);
      expect(screen.getByTestId("connect-logo")).toBeInTheDocument();
    });

    it("should have default server URL", () => {
      render(<ConnectPage />);
      const serverUrlInput = screen.getByTestId("connect-input-server-url") as HTMLInputElement;
      expect(serverUrlInput.value).toBe("http://localhost:20555");
    });

    it("should have empty API key by default", () => {
      render(<ConnectPage />);
      const apiKeyInput = screen.getByTestId("connect-input-api-key") as HTMLInputElement;
      expect(apiKeyInput.value).toBe("");
    });
  });

  describe("User Interactions", () => {
    it("should update server URL when user types", () => {
      render(<ConnectPage />);
      const serverUrlInput = screen.getByTestId("connect-input-server-url");

      fireEvent.change(serverUrlInput, { target: { value: "http://custom-server:8080" } });

      expect((serverUrlInput as HTMLInputElement).value).toBe("http://custom-server:8080");
    });

    it("should update API key when user types", () => {
      render(<ConnectPage />);
      const apiKeyInput = screen.getByTestId("connect-input-api-key");

      fireEvent.change(apiKeyInput, { target: { value: "my-api-key" } });

      expect((apiKeyInput as HTMLInputElement).value).toBe("my-api-key");
    });

    it("should disable submit button when URL is empty", () => {
      render(<ConnectPage />);
      const serverUrlInput = screen.getByTestId("connect-input-server-url");
      const submitButton = screen.getByTestId("connect-button-submit");

      fireEvent.change(serverUrlInput, { target: { value: "" } });

      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when URL is provided", () => {
      render(<ConnectPage />);
      const serverUrlInput = screen.getByTestId("connect-input-server-url");
      const submitButton = screen.getByTestId("connect-button-submit");

      fireEvent.change(serverUrlInput, { target: { value: "http://localhost:20555" } });

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Connection Flow", () => {
    it("should show loading state during connection", async () => {
      render(<ConnectPage />);
      const submitButton = screen.getByTestId("connect-button-submit");

      fireEvent.click(submitButton);

      // Check for spinner
      await waitFor(() => {
        expect(screen.getByTestId("connect-spinner")).toBeInTheDocument();
      });
    });

    it("should disable inputs during connection", async () => {
      render(<ConnectPage />);
      const submitButton = screen.getByTestId("connect-button-submit");
      const serverUrlInput = screen.getByTestId("connect-input-server-url");
      const apiKeyInput = screen.getByTestId("connect-input-api-key");

      fireEvent.click(submitButton);

      expect(serverUrlInput).toBeDisabled();
      expect(apiKeyInput).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should display error message when connection fails", async () => {
      const { createAPI } = await import("@/lib/api");
      (createAPI as any).mockReturnValue({
        testConnection: vi.fn().mockResolvedValue(false),
      });

      render(<ConnectPage />);
      const submitButton = screen.getByTestId("connect-button-submit");

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("connect-error-message")).toBeInTheDocument();
      });
    });
  });
});
