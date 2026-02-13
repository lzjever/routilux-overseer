import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "@/components/layout/Navbar";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useSearchStore } from "@/lib/stores/searchStore";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: vi.fn(() => "/flows"),
}));

// Mock stores
vi.mock("@/lib/stores/connectionStore", () => ({
  useConnectionStore: vi.fn(),
}));

vi.mock("@/lib/stores/searchStore", () => ({
  useSearchStore: vi.fn(),
}));

describe("Navbar", () => {
  const mockDisconnect = vi.fn();
  const mockOpenSearch = vi.fn();

  const connectedState = {
    connected: true,
    serverUrl: "http://localhost:20555",
    disconnect: mockDisconnect,
  };

  const disconnectedState = {
    connected: false,
    serverUrl: null,
    disconnect: mockDisconnect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchStore as any).mockReturnValue({ open: mockOpenSearch });
  });

  describe("Rendering", () => {
    it("should render navbar with testid", () => {
      (useConnectionStore as any).mockReturnValue(connectedState);
      render(<Navbar />);

      expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });

    it("should render home link", () => {
      (useConnectionStore as any).mockReturnValue(connectedState);
      render(<Navbar />);

      expect(screen.getByTestId("nav-link-home")).toBeInTheDocument();
    });

    it("should render all navigation links", () => {
      (useConnectionStore as any).mockReturnValue(connectedState);
      render(<Navbar />);

      expect(screen.getByTestId("nav-link-flows")).toBeInTheDocument();
      expect(screen.getByTestId("nav-link-workers")).toBeInTheDocument();
      expect(screen.getByTestId("nav-link-jobs")).toBeInTheDocument();
      expect(screen.getByTestId("nav-link-runtimes")).toBeInTheDocument();
      expect(screen.getByTestId("nav-link-plugins")).toBeInTheDocument();
    });

    it("should render search button", () => {
      (useConnectionStore as any).mockReturnValue(connectedState);
      render(<Navbar />);

      expect(screen.getByTestId("nav-button-search")).toBeInTheDocument();
    });
  });

  describe("Connection Status - Connected", () => {
    beforeEach(() => {
      (useConnectionStore as any).mockReturnValue(connectedState);
    });

    it("should show connected status", () => {
      render(<Navbar />);

      expect(screen.getByTestId("nav-connection-status")).toBeInTheDocument();
      expect(screen.getByTestId("nav-status-connected")).toBeInTheDocument();
    });

    it("should show server badge", () => {
      render(<Navbar />);

      expect(screen.getByTestId("nav-server-badge")).toBeInTheDocument();
      expect(screen.getByTestId("nav-server-badge").textContent).toContain("localhost:20555");
    });

    it("should show settings button", () => {
      render(<Navbar />);

      expect(screen.getByTestId("nav-button-settings")).toBeInTheDocument();
    });

    it("should disconnect when settings button clicked", () => {
      render(<Navbar />);

      const settingsButton = screen.getByTestId("nav-button-settings");
      fireEvent.click(settingsButton);

      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/connect");
    });
  });

  describe("Connection Status - Disconnected", () => {
    beforeEach(() => {
      (useConnectionStore as any).mockReturnValue(disconnectedState);
    });

    it("should show disconnected status", () => {
      render(<Navbar />);

      expect(screen.getByTestId("nav-status-disconnected")).toBeInTheDocument();
    });

    it("should not show settings button", () => {
      render(<Navbar />);

      expect(screen.queryByTestId("nav-button-settings")).not.toBeInTheDocument();
    });

    it("should not show server badge", () => {
      render(<Navbar />);

      expect(screen.queryByTestId("nav-server-badge")).not.toBeInTheDocument();
    });
  });

  describe("Search", () => {
    beforeEach(() => {
      (useConnectionStore as any).mockReturnValue(connectedState);
    });

    it("should open search when search button clicked", () => {
      render(<Navbar />);

      const searchButton = screen.getByTestId("nav-button-search");
      fireEvent.click(searchButton);

      expect(mockOpenSearch).toHaveBeenCalled();
    });
  });

  describe("Navigation Links Container", () => {
    beforeEach(() => {
      (useConnectionStore as any).mockReturnValue(connectedState);
    });

    it("should have nav-links container", () => {
      render(<Navbar />);

      expect(screen.getByTestId("nav-links")).toBeInTheDocument();
    });
  });
});
