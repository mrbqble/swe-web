import axios from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './token'
import { showErrorToast } from './toast'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		'X-Client-Type': 'web' // Identify web client for backend role restrictions
	}
})

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = getAccessToken()
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		const url: string = originalRequest?.url || ''
		const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/signup') || url.includes('/auth/refresh')

		if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
			originalRequest._retry = true

			try {
				const refreshToken = getRefreshToken()
				if (refreshToken) {
					// Use axios directly (not api instance) to avoid interceptor loop
					const response = await axios.post(
						`${API_BASE_URL}/auth/refresh`,
						{
							refresh_token: refreshToken
						},
						{
							headers: {
								'Content-Type': 'application/json',
								'X-Client-Type': 'web' // Identify web client for backend role restrictions
							}
						}
					)

					const { access_token, refresh_token: newRefreshToken } = response.data
					setTokens(access_token, newRefreshToken)

					originalRequest.headers.Authorization = `Bearer ${access_token}`
					return api(originalRequest)
				}
			} catch (refreshError) {
				// Refresh failed, logout user
				console.error('Token refresh failed:', refreshError)
				clearTokens()
				localStorage.removeItem('user')
				showErrorToast('Session expired. Please login again.')
				// Reload page to trigger login screen
				window.location.reload()
			}
		}

		return Promise.reject(error)
	}
)
