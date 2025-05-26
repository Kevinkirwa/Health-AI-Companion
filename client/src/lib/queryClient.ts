import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = '/api';

// Custom API Error class
class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }

  static async fromResponse(response: Response): Promise<APIError> {
    let errorMessage = response.statusText;
    let errorData;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
        errorData = data;
      } else {
        errorMessage = await response.text() || errorMessage;
      }
    } catch (e) {
      // If parsing fails, use status text
      console.warn('Failed to parse error response:', e);
    }

    // Map common status codes to user-friendly messages
    const statusMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Please log in to continue.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      500: 'An unexpected error occurred. Please try again later.',
    };

    return new APIError(
      response.status,
      statusMessages[response.status] || errorMessage,
      errorData
    );
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    throw await APIError.fromResponse(res);
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Ensure the endpoint has a leading slash and avoid duplicating '/api'
  const normalizedEndpoint = endpoint.startsWith('/api') ? endpoint : endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = normalizedEndpoint.startsWith('/api') ? normalizedEndpoint : `${API_BASE_URL}${normalizedEndpoint}`;
  
  // Start with clean headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  const token = localStorage.getItem('token');
  console.log('🔑 Token from localStorage:', token ? 'Present' : 'Not found');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge with any custom headers
  const finalHeaders = {
    ...headers,
    ...(options.headers || {}),
  };

  const finalOptions = {
    credentials: 'include' as const,
    ...options,
    headers: finalHeaders,
  };

  // Debug request details
  console.log('📤 Request details:', {
    url,
    method: finalOptions.method || 'GET',
    headers: finalHeaders,
    body: finalOptions.body ? JSON.parse(finalOptions.body as string) : undefined
  });

  try {
    const response = await fetch(url, finalOptions);

    console.log('📥 Response status:', response.status);
    // Convert headers to object for logging
    const headerObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    console.log('📥 Response headers:', headerObj);

    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
      console.log('📥 Response body:', data);
    } else {
      const text = await response.text();
      console.log('📥 Response body (text):', text);
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      throw new APIError(response.status, data.message || response.statusText, data);
    }

    return data;
  } catch (error) {
    console.error('❌ API request failed:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, 'Failed to connect to the server. Please try again later.');
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}${queryKey[0]}`, {
        credentials: "include",
        headers
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error('Query failed:', error);
      throw new APIError(500, 'Failed to fetch data. Please try again later.');
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
