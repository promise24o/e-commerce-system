export interface JwtPayload {
  sub: string;
  name: string;
  role?: string;
  email?: string;
}
