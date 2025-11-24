import { UserResponse } from '../services/authService';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar: string;
}

/**
 * Transform backend UserResponse to frontend User format
 */
export function transformUserResponse(userResponse: UserResponse): User {
  return {
    id: userResponse.id.toString(),
    email: userResponse.email,
    firstName: userResponse.first_name,
    lastName: userResponse.last_name,
    name: `${userResponse.first_name} ${userResponse.last_name}`,
    role: userResponse.role,
    avatar: `${userResponse.first_name.charAt(0)}${userResponse.last_name.charAt(0)}`.toUpperCase(),
  };
}

