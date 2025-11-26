import { UserResponse } from '../services/authService'

export interface User {
	id: string
	email: string
	name: string
	firstName: string
	lastName: string
	role: string
	avatar: string
	companyLogo?: string | null
}

/**
 * Transform backend UserResponse to frontend User format
 */
export function transformUserResponse(userResponse: UserResponse): User {
	const companyLogo = (userResponse as any).company_logo ?? (userResponse as any).companyLogo ?? userResponse.supplier?.company_logo ?? null

	return {
		id: userResponse.id.toString(),
		email: userResponse.email,
		firstName: userResponse.first_name,
		lastName: userResponse.last_name,
		name: `${userResponse.first_name} ${userResponse.last_name}`,
		role: userResponse.role,
		avatar: `${userResponse.first_name.charAt(0)}${userResponse.last_name.charAt(0)}`.toUpperCase(),
		companyLogo
	}
}
