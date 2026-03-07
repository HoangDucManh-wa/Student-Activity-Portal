

const isServer = typeof window === "undefined";

async function fetchData<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: any,
  token?: string,
  nextOptions?: NextFetchRequestConfig,
): Promise<T | null> {
  const isFormData = body instanceof FormData;

  const options: any = {
    method: method,
    credentials: isServer ? "omit" : "include",
  }

  const headers: any = {}
  if (method !== "GET" && body) {
    options.body = isFormData ? body : JSON.stringify(body)
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
  }
  if (isServer && token) {
    headers["Cookie"] = `${token}`
  }

  options.headers = headers

  if (nextOptions) {
    options.next = nextOptions
  }
  const result = await fetch(url, options)

  const data = await result.json()
  return data
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