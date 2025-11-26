const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function setTokens(accessToken: string | null, refreshToken?: string | null) {
	if (accessToken) {
		localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
	} else {
		localStorage.removeItem(ACCESS_TOKEN_KEY)
	}

	if (typeof refreshToken !== 'undefined') {
		if (refreshToken) {
			localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
		} else {
			localStorage.removeItem(REFRESH_TOKEN_KEY)
		}
	}
}

export function getAccessToken(): string | null {
	return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
	return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
	localStorage.removeItem(ACCESS_TOKEN_KEY)
	localStorage.removeItem(REFRESH_TOKEN_KEY)
}
