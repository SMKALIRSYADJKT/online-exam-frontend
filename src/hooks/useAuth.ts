import { getUserFromToken } from "../utils/jwtHelper";

export interface AuthUser {
  id?: string | number;
  name?: string;
  role?: string;
  exp?: number;
  [key: string]: any; // fleksibel jika token punya field lain
}

export function useAuth() {
  const user: AuthUser | null = getUserFromToken();
  const isAuthenticated = !!user;

  return { user, isAuthenticated };
}
