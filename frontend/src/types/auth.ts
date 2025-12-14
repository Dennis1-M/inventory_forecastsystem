export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
