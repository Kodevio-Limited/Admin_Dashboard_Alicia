export const baseURL = (import.meta.env.VITE_APP_SERVER as string) || ''
export const apiPrefix = (import.meta.env.VITE_API_PREFIX as string) || '/api/v1'

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

export function toQuery(params: Record<string, any>) {
    const usp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === '') continue
        usp.set(k, String(v))
    }
    const s = usp.toString()
    return s ? `?${s}` : ''
}

export async function client<T>(endpoint: string, { data, ...customConfig }: RequestInit & { data?: any } = {}): Promise<T> {
    const token = localStorage.getItem('access_token')
    const isFormData = data instanceof FormData

    const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...customConfig.headers,
    }

    // Automatically set Content-Type to JSON if data is not FormData
    if (!isFormData && data !== undefined) {
        ;(headers as Record<string, string>)['Content-Type'] = 'application/json'
    }

    const config: RequestInit = {
        method: customConfig.method || (data ? 'POST' : 'GET'),
        ...customConfig,
        headers,
    }

    if (data !== undefined) {
        config.body = isFormData ? data : JSON.stringify(data)
    }

    const url = `${baseURL}${apiPrefix}${endpoint}`

    let response = await fetch(url, config)

    // Handle 401 Unauthorized
    if (response.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/signin'
            throw new Error('Unauthorized')
        }

        if (!isRefreshing) {
            isRefreshing = true
            refreshPromise = (async () => {
                try {
                    const refreshRes = await fetch(`${baseURL}${apiPrefix}/auth/refresh/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh: refreshToken }),
                    })

                    if (!refreshRes.ok) {
                        throw new Error('Refresh failed')
                    }

                    const refreshData = await refreshRes.json()
                    const newAccess = refreshData?.data?.access || refreshData?.access

                    if (!newAccess) throw new Error('No access token returned')

                    localStorage.setItem('access_token', newAccess)
                    return newAccess
                } catch (error) {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    window.location.href = '/signin'
                    throw error
                } finally {
                    isRefreshing = false
                    refreshPromise = null
                }
            })()
        }

        try {
            // Wait for the new token
            const newToken = await refreshPromise
            // Retry the original request
            const newHeaders = new Headers(config.headers)
            newHeaders.set('Authorization', `Bearer ${newToken}`)

            response = await fetch(url, {
                ...config,
                headers: newHeaders,
            })
        } catch (error) {
            throw error
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = (errorData && (errorData.message || errorData.error)) || `Request failed with status ${response.status}`

        if (typeof errorMessage === 'object' && !Array.isArray(errorMessage) && errorMessage !== null) {
            const messages = Object.entries(errorMessage).map(([k, v]) => `${k}: ${v}`)
            throw new Error(messages.join(' | '))
        }

        throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage)
    }

    if (response.status === 204) {
        return undefined as T
    }

    const responseData = await response.json().catch(() => null)

    if (responseData && responseData.status === 'error') {
        const errorMessage = responseData.message || responseData.error || 'An error occurred'
        if (typeof errorMessage === 'object' && !Array.isArray(errorMessage) && errorMessage !== null) {
            const messages = Object.entries(errorMessage).map(([k, v]) => `${k}: ${v}`)
            throw new Error(messages.join(' | '))
        }
        throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage)
    }

    return responseData as T
}
