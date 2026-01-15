// API Client for Routilux Backend

class APIError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(`API Error ${status}: ${message}`);
    this.name = "APIError";
  }
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string) {
    // Remove trailing slash and ensure valid URL format
    this.baseURL = baseURL.replace(/\/$/, "");
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private getEndpointURL(path: string): string {
    return `${this.baseURL}${path}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new APIError(response.status, errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number>
  ): Promise<T> {
    let url: URL;

    try {
      url = new URL(this.getEndpointURL(path));
    } catch {
      // If path is not an absolute URL, use window.location.origin as base
      url = new URL(this.getEndpointURL(path), window.location.origin);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.defaultHeaders,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(
    path: string,
    data?: any,
    params?: Record<string, string | number>
  ): Promise<T> {
    let url: URL;

    try {
      url = new URL(this.getEndpointURL(path));
    } catch {
      url = new URL(this.getEndpointURL(path), window.location.origin);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: this.defaultHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(
    path: string,
    data?: any,
    params?: Record<string, string | number>
  ): Promise<T> {
    let url: URL;

    try {
      url = new URL(this.getEndpointURL(path));
    } catch {
      url = new URL(this.getEndpointURL(path), window.location.origin);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: this.defaultHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete(path: string): Promise<void> {
    const response = await fetch(this.getEndpointURL(path), {
      method: "DELETE",
      headers: this.defaultHeaders,
    });

    await this.handleResponse<void>(response);
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.get<{ status: string }>("/api/health");
      return true;
    } catch {
      return false;
    }
  }
}

export { APIClient, APIError };
