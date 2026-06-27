# API Integration Guide (Native Fetch)

This guide provides a comprehensive overview of how the Admin Dashboard (and Frontend Dashboard) manages API requests using the custom native `fetch` client.

By removing `axios`, we have simplified our dependencies and handled edge cases related to Vite's local proxy setup gracefully.

## The API Client

The custom API client is located at `src/lib/api-client.ts`. It acts as a centralized wrapper around the native `fetch` API and provides the following features:

1. **Automatic Token Injection**: The `access_token` from `localStorage` is automatically appended to the `Authorization: Bearer` header of every request.
2. **Automatic Token Refresh**: If a request fails with a `401 Unauthorized` status, the client intercepts it, uses the `refresh_token` to get a new `access_token`, updates `localStorage`, and replays the original request transparently.
3. **JSON Serialization**: If you pass a generic object to the `data` property, it automatically sets the `Content-Type: application/json` header and stringifies the payload.
4. **FormData Support**: If you pass a `FormData` object (e.g., for file uploads), it omits the `Content-Type` header (allowing the browser to set the correct multipart boundary) and passes the data directly.
5. **Standardized Error Handling**: Errors returned from the API are parsed and thrown as standard JavaScript `Error` objects, which integrates perfectly with `@tanstack/react-query`.

## Configuration & Environment Variables

During development, we avoid CORS issues by using Vite's proxy feature.

The API client reads two variables from the environment:

- `VITE_APP_SERVER`: The host URL of the backend (e.g., `http://spark.kodevio.com:8000`). **Keep this commented out or empty in `.env` during local development.**
- `VITE_API_PREFIX`: The prefix for the API (e.g., `/api/v1`).

When `VITE_APP_SERVER` is empty, the client makes relative requests like `/api/v1/auth/login/`. Vite intercepts these requests and forwards them to the target specified in `vite.config.ts`. In production, set `VITE_APP_SERVER` to the real backend URL so the client makes full absolute requests.

## How to Use the Client

To make an API request, import `client` from `@/lib/api-client`.

### Making a GET Request

For simple GET requests, provide the endpoint. The client is generically typed, allowing you to specify the expected response type.

```typescript
import { client } from '@/lib/api-client'

interface DashboardResponse {
    status: string
    data: any
}

export const getDashboardData = async (): Promise<DashboardResponse> => {
    // Generics type the return value
    return client<DashboardResponse>('/admin/overview/')
}
```

### Making a POST Request

To make a POST request (or PUT/PATCH), pass an object as the second argument containing a `data` property. The client will automatically default to the `POST` method if `data` is provided, but you can explicitly override it.

```typescript
import { client } from '@/lib/api-client'

export const submitForm = async (payload: { name: string; age: number }) => {
    return client('/users/create/', {
        data: payload, // automatically stringified and sent as JSON
    })
}
```

### Making a Request with URL Parameters

The `api-client.ts` module exports a handy `toQuery` utility function that converts a JavaScript object into a query string and strips out `undefined`, `null`, or empty strings.

```typescript
import { client, toQuery } from '@/lib/api-client'

export const searchUsers = async (filters: { role?: string; active?: boolean }) => {
    // Generates "?role=admin&active=true"
    const queryString = toQuery(filters)

    return client(`/users/search/${queryString}`)
}
```

### Using with TanStack Query (React Query)

Since the `client` throws standard `Error` objects, you can use it seamlessly in your `useQuery` or `useMutation` hooks without needing specific error types like `AxiosError`.

```typescript
import { useMutation } from '@tanstack/react-query'
import { loginApi } from '@/lib/api/auth'
import type { LoginResponse } from '@/lib/api/auth'

export const useLogin = () => {
    // The error type is simply standard `Error`
    return useMutation<LoginResponse, Error, any>({
        mutationFn: loginApi,
        onSuccess: (data) => {
            console.log('Logged in!', data)
        },
    })
}
```
