const isServer = typeof window === "undefined";

function getAccessTokenFromCookie(): string | undefined {
  if (isServer) return undefined;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match ? match[1] : undefined;
}

async function fetchData<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: any,
  token?: string,
  nextOptions?: NextFetchRequestConfig,
): Promise<T | null> {
  const isFormData = body instanceof FormData;

  const options: any = {
    method,
    credentials: isServer ? "omit" : "include",
  };

  const headers: any = {};

  if (method !== "GET" && body) {
    options.body = isFormData ? body : JSON.stringify(body);
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
  }

  // Server-side: token passed manually as "Cookie: access_token=..." or "Bearer ..."
  if (isServer && token) {
    if (token.startsWith("Bearer ")) {
      headers["Authorization"] = token;
    } else if (token.startsWith("access_token=")) {
      // Extract token value from cookie string
      const match = token.match(/access_token=([^;]+)/);
      if (match) {
        headers["Authorization"] = `Bearer ${match[1]}`;
      }
    } else {
      // Treat as raw cookie header for compatibility
      headers["Cookie"] = token;
    }
  }

  // Client-side: read access_token from cookie and add as Bearer
  if (!isServer) {
    const accessToken = getAccessTokenFromCookie();
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  options.headers = headers;

  if (nextOptions) {
    options.next = nextOptions;
  }

  const result = await fetch(url, options);
  const data = await result.json();
  return data;
}

export const http = {
  get: <T>(url: string, token?: string, nextOptions?: NextFetchRequestConfig) =>
    fetchData<T>("GET", url, undefined, token, nextOptions),

  post: <T>(url: string, body: any, token?: string) =>
    fetchData<T>("POST", url, body, token),

  put: <T>(url: string, body: any, token?: string) =>
    fetchData<T>("PUT", url, body, token),

  delete: <T>(url: string, body: any, token?: string) =>
    fetchData<T>("DELETE", url, body, token),
};
